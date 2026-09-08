/**
 * api/_routes/_rate-limit.js — spend guardrail for endpoints that bill a
 * third-party provider (AssemblyAI STT, Imagen, TTS, Resend).
 *
 * WHY THIS EXISTS
 * Every route below forwards to a paid API. Without a cap, one scripted loop
 * (or one stuck client retry) converts a free tier into an invoice. This module
 * is the circuit breaker: fixed-window counters per identity, with a hard cap on
 * how many identities we will track so a rotating-IP flood cannot exhaust memory.
 *
 * SCOPE / HONEST LIMITATION
 * State lives in the process. On Vercel each lambda instance keeps its own map,
 * so the effective ceiling is `limit x concurrent instances`. That is enough to
 * stop a single abuser and to flatten accidental retry storms; it is NOT a
 * distributed guarantee. For a hard global cap, back this with Upstash Redis
 * (`INCR` + `EXPIRE`) — the call sites below would not change.
 *
 * FAIL-CLOSED
 * If the limiter itself throws we refuse the request. An unavailable counter
 * must never be interpreted as "spend freely".
 */

/** Refuse to track more than this many (identity, window) pairs. */
const MAX_TRACKED_KEYS = 10000;

/** `${identity}|${windowName}` -> { count, resetAt } */
const windows = new Map();

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Per-endpoint budgets. Numbers are chosen from provider pricing so a single
 * user cannot outrun the free tier:
 *  - evaluate-speaking: AssemblyAI STT (~$0.006/min) + LLM grading. 20/min is
 *    far above human use; 200/day bounds worst-case spend to roughly $1.50/day.
 *  - generate-image:    Imagen 3 is ~$0.03-0.04 per image -> 60/day ~= $2.40.
 *  - tts:               cascade can reach ElevenLabs (~$0.15/1k chars), so the
 *                       daily cap matters more than the burst cap.
 *  - send-invite:       Resend volume is bounded by reputation, not price;
 *                       keep it tight to protect deliverability.
 */
export const LIMITS = {
  'evaluate-speaking': [
    { name: 'burst', limit: 20, windowMs: MINUTE },
    { name: 'hourly', limit: 60, windowMs: HOUR },
    { name: 'daily', limit: 200, windowMs: DAY },
  ],
  'evaluate-writing': [
    { name: 'burst', limit: 20, windowMs: MINUTE },
    { name: 'hourly', limit: 60, windowMs: HOUR },
    { name: 'daily', limit: 200, windowMs: DAY },
  ],
  ai: [
    { name: 'burst', limit: 30, windowMs: MINUTE },
    { name: 'hourly', limit: 200, windowMs: HOUR },
    { name: 'daily', limit: 1000, windowMs: DAY },
  ],
  'generate-image': [
    { name: 'burst', limit: 10, windowMs: MINUTE },
    { name: 'daily', limit: 60, windowMs: DAY },
  ],
  tts: [
    { name: 'burst', limit: 30, windowMs: MINUTE },
    { name: 'daily', limit: 300, windowMs: DAY },
  ],
  'send-invite': [
    { name: 'burst', limit: 10, windowMs: MINUTE },
    { name: 'daily', limit: 100, windowMs: DAY },
  ],
};

function normalizeRule(rule) {
  const limit = Math.max(1, Math.floor(Number(rule?.limit)) || 1);
  const windowMs = Math.max(SECOND, Math.floor(Number(rule?.windowMs)) || MINUTE);
  const name = String(rule?.name || `${limit}:${windowMs}`);
  return { name, limit, windowMs };
}

/** Drop entries whose window has elapsed. Cheap, and keeps the map bounded. */
function sweep(now) {
  for (const [key, entry] of windows) {
    if (entry.resetAt <= now) windows.delete(key);
  }
}

/**
 * Hard ceiling on tracked keys. A bot cycling source IPs would otherwise grow
 * this map without bound; we expire first, then evict oldest-first (Map keeps
 * insertion order).
 */
function enforceMemoryCap(now) {
  if (windows.size <= MAX_TRACKED_KEYS) return;
  sweep(now);
  let overflow = windows.size - MAX_TRACKED_KEYS;
  if (overflow <= 0) return;
  for (const key of windows.keys()) {
    if (overflow-- <= 0) break;
    windows.delete(key);
  }
}

/**
 * Evaluate (and, when allowed, commit) a set of windows for one identity.
 *
 * Quota is only consumed when *every* window has capacity, so a rejected burst
 * does not also burn the daily allowance.
 *
 * @returns {{allowed: boolean, retryAfterSeconds: number, identity: string,
 *            results: Array<object>, remaining: number, limit: number}}
 */
export function checkRateLimit(identity, rules, now = Date.now()) {
  const id = String(identity || 'anon').slice(0, 128);
  const normalized = (Array.isArray(rules) ? rules : [rules]).filter(Boolean).map(normalizeRule);
  const results = [];
  let allowed = true;
  let retryAfterSeconds = 0;

  // Pass 1 — read-only: does every window have room?
  for (const rule of normalized) {
    const key = `${id}|${rule.name}`;
    const existing = windows.get(key);
    const active = existing && existing.resetAt > now ? existing : null;
    const count = active ? active.count : 0;
    const ok = count < rule.limit;
    const resetAt = active ? active.resetAt : now + rule.windowMs;
    results.push({
      name: rule.name,
      limit: rule.limit,
      count,
      remaining: Math.max(0, rule.limit - count),
      resetAt,
      allowed: ok,
    });
    if (!ok) {
      allowed = false;
      const wait = Math.max(1, Math.ceil((resetAt - now) / SECOND));
      if (wait > retryAfterSeconds) retryAfterSeconds = wait;
    }
  }

  // Pass 2 — commit only when the whole request is admitted.
  if (allowed) {
    for (const rule of normalized) {
      const key = `${id}|${rule.name}`;
      const existing = windows.get(key);
      if (existing && existing.resetAt > now) {
        existing.count += 1;
      } else {
        windows.set(key, { count: 1, resetAt: now + rule.windowMs });
      }
    }
    enforceMemoryCap(now);
    // Reflect the commit in the returned snapshot.
    for (let i = 0; i < results.length; i += 1) {
      results[i].count += 1;
      results[i].remaining = Math.max(0, results[i].limit - results[i].count);
    }
  }

  const tightest = results.reduce(
    (worst, r) => (worst === null || r.remaining < worst.remaining ? r : worst),
    null,
  );

  return {
    allowed,
    retryAfterSeconds,
    identity: id,
    results,
    remaining: tightest ? tightest.remaining : 0,
    limit: tightest ? tightest.limit : 0,
    resetAt: tightest ? tightest.resetAt : now,
  };
}

/**
 * Best-effort caller IP.
 * `x-real-ip` is preferred because Vercel sets it at the edge and a client
 * cannot spoof it; the leftmost `x-forwarded-for` entry CAN be forged.
 */
export function clientIp(req) {
  const real = req?.headers?.['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real.trim().slice(0, 64);
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return '';
}

/**
 * Bucket key for a request. Authenticated users are counted per account so a
 * shared NAT or office IP does not punish a whole classroom; anonymous callers
 * fall back to IP, then to a single `anon` bucket (still bounded).
 */
export function rateLimitIdentity(req, user) {
  const subject = user?.id || user?.email;
  if (subject) return `user:${String(subject).slice(0, 128)}`;
  const ip = clientIp(req);
  return ip ? `ip:${ip}` : 'anon';
}

/** Advertise the tightest window so well-behaved clients can back off. */
export function applyRateLimitHeaders(res, result) {
  if (!res || res.headersSent) return;
  const resetSeconds = Math.max(0, Math.ceil((result.resetAt - Date.now()) / SECOND));
  res.setHeader('RateLimit-Limit', String(result.limit));
  res.setHeader('RateLimit-Remaining', String(result.remaining));
  res.setHeader('RateLimit-Reset', String(resetSeconds));
}

/**
 * Enforce the budget for a scope. Returns the result when the request may
 * proceed, or `null` after writing a 429 (caller must `return` immediately).
 *
 * @param {object} req
 * @param {object} res
 * @param {{scope: string, user?: object, rules?: Array<object>}} options
 */
export function guardRateLimit(req, res, { scope, user, rules } = {}) {
  const budget = rules || LIMITS[scope] || [{ name: 'burst', limit: 30, windowMs: MINUTE }];
  try {
    const result = checkRateLimit(rateLimitIdentity(req, user), budget);
    applyRateLimitHeaders(res, result);
    if (result.allowed) return result;

    if (res && !res.headersSent) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
      res.status(429).json({
        error: `Too many requests — please wait ${result.retryAfterSeconds}s and try again.`,
        code: 'rate_limit_exceeded',
        scope: scope || 'unknown',
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }
    return null;
  } catch (err) {
    // Fail closed: an unusable counter must not read as unlimited budget.
    console.error('[rate-limit] guard failed — refusing request:', err);
    if (res && !res.headersSent) {
      res.status(429).json({
        error: 'Rate limit service unavailable. Please retry shortly.',
        code: 'rate_limit_unavailable',
        scope: scope || 'unknown',
      });
    }
    return null;
  }
}

/** Test/telemetry helpers. */
export function trackedKeyCount() {
  return windows.size;
}

export function resetRateLimits() {
  windows.clear();
}

export const RATE_LIMIT_CONSTANTS = { MAX_TRACKED_KEYS, SECOND, MINUTE, HOUR, DAY };
