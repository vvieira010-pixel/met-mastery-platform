/**
 * api/ai.js — Vercel serverless AI proxy.
 *
 * Runs the multi-provider fallback cascade SERVER-SIDE so provider API keys are
 * never shipped in the browser bundle. The client (shared.jsx → callAI) POSTs
 * { prompt, system, max_tokens, temperature, preferredProvider } here and gets
 * back { content: [{ text }] } — the same shape the client cascade returns.
 *
 * Keys are read from server-only env vars. For a smooth migration it also accepts
 * the legacy VITE_-prefixed names (Vercel exposes every env var to functions at
 * runtime regardless of prefix), but you should drop the VITE_ prefix in the
 * Vercel dashboard so the keys stop being inlined into the client build.
 *
 *   GEMINI_API_KEY / GROQ_API_KEY / OPENROUTER_API_KEY / NVIDIA_API_KEY
 *   OPENAI_API_KEY / PERPLEXITY_API_KEY
 *   (comma- or newline-separated for multiple keys)
 *
 * Optional model overrides, resolved in this precedence order:
 *   1. SINGULAR one-model override — GEMINI_MODEL / NVIDIA_MODEL /
 *      OPENROUTER_MODEL / GROQ_MODEL (highest priority, tried first).
 *   2. PLURAL best-first list — GEMINI_MODELS / NVIDIA_MODELS /
 *      OPENROUTER_MODELS / GROQ_MODELS (comma-separated).
 *   3. Curated defaults — used only when BOTH 1 and 2 are unset.
 * For NVIDIA the singular is NVIDIA_MODEL; openai/ models stay excluded.
 * Cascade is globally ordered by MODEL_PRIORITY — best models across all providers
 * first. Each model is skipped if not in its provider's configured model list.
 */

import { logPrediction } from './_ml/log.js';
import { getActive } from './_ml/registry.js';
import { telemetryEnabled } from './_ml/store.js';
import { guardRateLimit, enforceDistributedCap, rateLimitIdentity, LIMITS } from './_rate-limit.js';
import { verifySupabaseSession } from './_supabase-auth.js';
import {
  AI_ATTEMPT_TIMEOUT_MS,
  AI_REQUEST_TIMEOUT_MS,
  MAX_AI_PROMPT_CHARS,
  modelPriority,
  providerConfig,
} from './_ai-providers.js';

// Re-exported so existing importers (and the fallback tests) keep working.
export { AI_ATTEMPT_TIMEOUT_MS, AI_REQUEST_TIMEOUT_MS, MAX_AI_PROMPT_CHARS };

const env = (name) => process.env[name] || '';

function allowedOrigin(req) {
  const origin = (req.headers['origin'] || '').toLowerCase();
  // Local development (browser on the same machine) is always permitted.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  // Server-to-server / internal calls carry no Origin header.
  if (!origin) return true;
  // Any other (foreign) origin is only allowed if it exactly matches the
  // configured APP_ORIGIN. Fail closed when APP_ORIGIN is not set so the
  // paid AI proxy cannot be abused from arbitrary websites.
  const allowed = env('APP_ORIGIN');
  if (!allowed) return false;
  return origin === allowed.toLowerCase();
}

// Model lists and key resolution now live in ./_ai-providers.js so the proxy
// and /api/ai-status cannot drift apart.

/**
 * A JSON-requesting client must receive a complete JSON document, not prose
 * that happens to quote the request schema. Treating any text containing
 * braces as JSON caused regeneration to accept provider reasoning and then
 * fail silently in the client parser.
 */
export function isStrictJsonResponse(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  try {
    const parsed = JSON.parse(candidate);
    return parsed !== null && (typeof parsed === 'object');
  } catch {
    return false;
  }
}

/** fetch with an abort-backed timeout so a hung provider can't stall the function. */
async function fetchT(url, init, ms = AI_ATTEMPT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  // SECURITY (audit AUTH-1): the paid AI proxy must not be anonymously callable.
  // A valid Supabase session is required; genuine server-to-server callers may
  // use the shared AI_INTERNAL_TOKEN instead. This closes the open-proxy hole
  // where `curl` (no Origin) was treated as trusted.
  const user = await verifySupabaseSession(req);
  const internalToken = env('AI_INTERNAL_TOKEN');
  const isInternal = Boolean(internalToken) && req.headers['x-internal-token'] === internalToken;
  if (!user && !isInternal) {
    return res.status(401).json({ error: { message: 'Sign-in required to use AI features.' } });
  }
  // Defense-in-depth: same-origin only unless an internal token is presented.
  if (!isInternal && !allowedOrigin(req)) {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }
  if (!guardRateLimit(req, res, { scope: 'ai', user })) return;
  // Optional TRUE global cap (audit RATE-1). Dormant unless Upstash Redis env is
  // set; when enabled it enforces the budget across all Vercel instances, not
  // just the single lambda that handled this request. Fails open on error.
  const distributedOk = await enforceDistributedCap(rateLimitIdentity(req, user), LIMITS.ai);
  if (!distributedOk) {
    return res.status(429).json({
      error: { message: 'Global AI rate limit reached. Please try again later.', code: 'rate_limit_global' },
    });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const {
    prompt, system, max_tokens = 2048, temperature = 0.3, preferredProvider = null,
    response_format = null,
    // Telemetry context. All optional: the caller may say which product feature
    // this call belongs to and which student/submission it concerns. `subject`
    // is hashed server-side (see api/_ml/hash.js) and never stored raw.
    feature = 'ai_proxy', subject = null, submissionId = null,
  } = body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: { message: 'Missing "prompt"' } });
  }
  if (prompt.length > MAX_AI_PROMPT_CHARS) {
    return res.status(400).json({ error: { message: `Prompt too long (max ${MAX_AI_PROMPT_CHARS.toLocaleString('en-US')} characters).` } });
  }
  if (system && typeof system !== 'string') {
    return res.status(400).json({ error: { message: '"system" must be a string' } });
  }

  const sys = system || 'You are a helpful MET English teaching assistant.';
  const expectsJson = Boolean(response_format) || /(?:return|respond|output)\s+(?:only\s+)?(?:valid\s+)?json\b/i.test(`${sys}\n${prompt}`);
  const errors = [];
  const requestStartedAt = Date.now();
  const deadline = requestStartedAt + AI_REQUEST_TIMEOUT_MS;
  const attemptTimeout = () => Math.max(1, Math.min(AI_ATTEMPT_TIMEOUT_MS, deadline - Date.now()));
  const logAttempt = (provider, model, outcome, startedAt) => {
    // Do not log prompts, responses, or provider errors: they can contain student data or secrets.
    console.info(JSON.stringify({ event: 'ai_attempt', provider, model, outcome, durationMs: Date.now() - startedAt }));
  };

  // GEMINI_API_KEY_2 (and any _2/_3 suffixed key) is honored as a fallback so a
  // rate-limited or exhausted primary key does not force the diagnostic to fall
  // back to other providers.
  //
  // The diagnostic's first stage carries the long transcript and returns the
  // core assessment; its later feedback/homework stages are much smaller, and
  // NVIDIA picks different models for each case.
  const isEvidenceHeavy = (prompt.length + sys.length) > 16_000 || max_tokens > 3_500;
  const { keys: providerKeys, models: providerModelLists } = providerConfig({ isEvidenceHeavy });
  if (!Object.values(providerKeys).some((list) => list.length)) {
    return res.status(503).json({ error: { message: 'No AI provider keys configured on the server.' } });
  }
  const providerModels = Object.fromEntries(
    Object.entries(providerModelLists).map(([provider, list]) => [provider, new Set(list)]),
  );

  async function tryGemini(key, model) {
    const startedAt = Date.now();
    let outcome = 'failed';
    try {
      const isGemma = /^gemma/i.test(model);
      const gen = { temperature, maxOutputTokens: max_tokens };
      if (expectsJson) gen.responseMimeType = 'application/json';
      if (/2\.5/.test(model) && /flash/i.test(model)) gen.thinkingConfig = { thinkingBudget: 0 };
      const reqBody = isGemma
        ? { contents: [{ parts: [{ text: `${sys}\n\n${prompt}` }] }], generationConfig: gen }
        : { systemInstruction: { parts: [{ text: sys }] }, contents: [{ parts: [{ text: prompt }] }], generationConfig: gen };
      const r = await fetchT(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody) },
        attemptTimeout(),
      );
      if (r.ok) {
        const data = await r.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        if (text && (!expectsJson || isStrictJsonResponse(text))) {
          outcome = 'success';
          return { content: [{ text }] };
        }
        outcome = text && expectsJson ? 'non_json' : 'empty';
        if (text && expectsJson) errors.push(`Gemini/${model}: non-JSON response`);
        errors.push(`Gemini/${model}: empty (${data?.candidates?.[0]?.finishReason || 'no candidates'})`);
      } else {
        outcome = `http_${r.status}`;
        errors.push(`Gemini/${model}: HTTP ${r.status}`);
      }
    } catch (e) {
      outcome = e.name === 'AbortError' ? 'timeout' : 'error';
      errors.push(`Gemini/${model}: ${e.message}`);
    } finally {
      logAttempt('gemini', model, outcome, startedAt);
    }
    return null;
  }

  async function tryOpenAICompat(url, key, model, extraHeaders = {}, label) {
    const tag = `${label || 'provider'}/${model}`;
    const provider = String(label || 'provider').toLowerCase();
    const startedAt = Date.now();
    let outcome = 'failed';
    try {
      const requestBody = { model, temperature, max_tokens, messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] };
      if (expectsJson) requestBody.response_format = { type: 'json_object' };
      let r = await fetchT(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
        body: JSON.stringify(requestBody),
      }, attemptTimeout());
      // Some older OpenAI-compatible gateways reject response_format. Retry
      // that same model once without the hint before moving to the next model.
      if (!r.ok && expectsJson && (r.status === 400 || r.status === 422)) {
        const fallbackBody = { ...requestBody };
        delete fallbackBody.response_format;
        r = await fetchT(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
          body: JSON.stringify(fallbackBody),
        }, attemptTimeout());
      }
      if (r.ok) {
        const data = await r.json();
        const text = data?.choices?.[0]?.message?.content || '';
        if (text && (!expectsJson || isStrictJsonResponse(text))) {
          outcome = 'success';
          return { content: [{ text }] };
        }
        outcome = text && expectsJson ? 'non_json' : 'empty';
        if (text && expectsJson) errors.push(`${tag}: non-JSON response`);
        errors.push(`${tag}: empty response`);
      } else {
        outcome = `http_${r.status}`;
        errors.push(`${tag}: HTTP ${r.status}`);
      }
    } catch (e) {
      outcome = e.name === 'AbortError' ? 'timeout' : 'error';
      errors.push(`${tag}: ${e.message}`);
    } finally {
      logAttempt(provider, model, outcome, startedAt);
    }
    return null;
  }

  // Attempt order matters for the time budget (AI_REQUEST_TIMEOUT_MS): fast,
  // reliable providers run first so a slow/hanging provider (e.g. NVIDIA's large
  // models timing out at the full attempt timeout) cannot consume the whole
  // budget and starve the healthy fallbacks. Every configured model of each
  // provider is included — previously only the first configured model was ever
  // attempted, which reduced the whole cascade to a single call.
  const MODEL_PRIORITY = modelPriority({ isEvidenceHeavy });

  // `model` is carried on each attempt so a successful call can be attributed to
  // the exact provider model that served it (pricing and drift both need this).
  const providerRunner = {
    gemini: (k, m) => ({ id: 'gemini', model: m, run: () => tryGemini(k, m) }),
    groq: (k, m) => ({ id: 'groq', model: m, run: () => tryOpenAICompat('https://api.groq.com/openai/v1/chat/completions', k, m, {}, 'Groq') }),
    openrouter: (k, m) => ({ id: 'openrouter', model: m, run: () => tryOpenAICompat('https://openrouter.ai/api/v1/chat/completions', k, m, { 'X-Title': 'MET Proficiency Mastery' }, 'OpenRouter') }),
    nvidia: (k, m) => ({ id: 'nvidia', model: m, run: () => tryOpenAICompat('https://integrate.api.nvidia.com/v1/chat/completions', k, m, {}, 'Nvidia') }),
    openai: (k, m) => ({ id: 'openai', model: m, run: () => tryOpenAICompat('https://api.openai.com/v1/chat/completions', k, m, {}, 'OpenAI') }),
    perplexity: (k, m) => ({ id: 'perplexity', model: m, run: () => tryOpenAICompat('https://api.perplexity.ai/chat/completions', k, m, {}, 'Perplexity') }),
  };

  const attempts = [];
  for (const [model, provider] of MODEL_PRIORITY) {
    const keys = providerKeys[provider];
    if (keys.length && providerModels[provider].has(model)) {
      keys.forEach((k) => attempts.push(providerRunner[provider](k, model)));
    }
  }

  // preferredProvider: float its attempts to the front.
  let ordered = attempts;
  if (preferredProvider) {
    const pref = attempts.filter((a) => a.id === preferredProvider);
    if (pref.length) ordered = [...pref, ...attempts.filter((a) => a.id !== preferredProvider)];
  }

  // Resolved once per request and cached for 60s in the registry module. Falls
  // back to 'unversioned' so telemetry still works before the migration lands.
  const activeModel = telemetryEnabled()
    ? await getActive('model', 'ai_proxy', { version: 'unversioned', promptSha: 'unversioned' })
    : { version: 'unversioned', promptSha: 'unversioned' };

  const telemetry = {
    feature: typeof feature === 'string' && feature ? feature : 'ai_proxy',
    subject,
    submissionId,
    modelName: 'ai_proxy',
    modelVersion: activeModel.version,
    prompt: sys,
    promptSha: activeModel.promptSha,
    inputParts: [sys, prompt],
    inputChars: sys.length + prompt.length,
  };

  // One structured line per request describing the cascade that was built.
  // This is the fastest way to answer "why did Regen fail?": attempts:1 with a
  // 429 means a single provider is carrying the whole feature.
  console.info(JSON.stringify({
    event: 'ai_cascade_start',
    attempts: ordered.length,
    providers: [...new Set(ordered.map((a) => a.id))],
    expectsJson,
    promptChars: prompt.length,
  }));

  // Stop starting new attempts once an overall budget is used up
  // so the function finishes inside serverless time limits.
  for (const a of ordered) {
    if (Date.now() > deadline) break;
    const attemptStartedAt = Date.now();
    const result = await a.run();
    if (result) {
      const text = result?.content?.[0]?.text || '';
      // Fire-and-forget: do not block the response on telemetry (PERF-1).
      void logPrediction({
        ...telemetry,
        provider: a.id,
        modelId: a.model,
        outputChars: text.length,
        latencyMs: Date.now() - attemptStartedAt,
        status: 'ok',
      }).catch(() => {});
      return res.status(200).json(result);
    }
  }

  // Do not return provider model identifiers or raw provider failures. Those
  // values can contain dashboard configuration mistakes and are not useful to
  // a teacher. The detailed, redacted attempt records stay server-side.
  void logPrediction({
    ...telemetry,
    latencyMs: Date.now() - requestStartedAt,
    status: 'provider_error',
    error: `all providers failed after ${errors.length} attempt(s)`,
  }).catch(() => {});
  console.warn('[api/ai] all configured providers failed', { attempts: errors.length });

  // A teacher-facing message should say what is actually wrong. When every
  // attempt was rejected with HTTP 429 the provider quota is exhausted: retrying
  // immediately cannot help, and the fix is another provider key.
  const onlyRateLimited = errors.length > 0 && errors.every((e) => /HTTP 429/.test(e));
  if (onlyRateLimited) {
    return res.status(429).json({
      error: {
        message: 'Every configured AI provider is currently rate limited (HTTP 429). Add a fallback provider key or wait for the quota to reset, then try Regen again.',
        code: 'provider_quota_exhausted',
      },
    });
  }
  return res.status(502).json({ error: { message: 'AI generation is temporarily unavailable. Please try Regen again in a moment.' } });
}
