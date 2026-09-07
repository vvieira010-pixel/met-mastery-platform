/**
 * api/_assemblyai-llm.js — AssemblyAI LLM Gateway client (the requested scorer).
 *
 * Routes MET rubric grading through AssemblyAI's unified LLM Gateway:
 *   POST https://llm-gateway.assemblyai.com/v1/chat/completions
 * OpenAI-compatible request/response shape.
 *
 * This account's accessible gateway model is `qwen3.5-4b-32k-fast` (AssemblyAI's
 * own, cheapest tier). Override with ASSEMBLYAI_LLM_MODEL. NOTE: qwen3.5 does NOT
 * support `response_format`, so callers must parse JSON out of the text
 * (see parseLLMJson) — the gateway also offers built-in json-repair on its side.
 *
 * Used by both evaluate-writing.js and evaluate-speaking.js so "scoring via
 * AssemblyAI" is the default path for both skills.
 */

// SECURITY: server-only secrets must NOT fall back to VITE_* (client-exposed) vars.
const env = (name) => process.env[name] || '';

export const ASSEMBLYAI_LLM_URL = 'https://llm-gateway.assemblyai.com/v1/chat/completions';
// Free/cheapest model available on this account; configurable per environment.
export const DEFAULT_ASSEMBLYAI_MODEL = env('ASSEMBLYAI_LLM_MODEL') || 'qwen3.5-4b-32k-fast';

// Robustly extract a JSON value from an LLM response that may be wrapped in
// ```json fences or contain prose around the object. Returns parsed object/array
// or null. Model-agnostic so it works for qwen3.5 and any fallback provider.
export function parseLLMJson(text) {
  if (!text) return null;
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(t);
  } catch {
    /* fall through */
  }
  const obj = t.match(/\{[\s\S]*\}/);
  if (obj) {
    try {
      return JSON.parse(obj[0]);
    } catch {
      /* fall through */
    }
  }
  const arr = t.match(/\[[\s\S]*\]/);
  if (arr) {
    try {
      return JSON.parse(arr[0]);
    } catch {
      /* fall through */
    }
  }
  return null;
}

function reqId(raw) {
  try {
    return JSON.parse(raw)?.request_id || null;
  } catch {
    return null;
  }
}

/**
 * Call the AssemblyAI LLM Gateway.
 * @param {{messages: Array<{role:string,content:string}>, model?:string, temperature?:number, maxTokens?:number}} opts
 * @returns {Promise<{ok:boolean, content?:string, model?:string, requestId?:string, status?:number, error?:string}>}
 */
/**
 * Pull `scores` out of a parsed evaluation, requiring every expected key to be a
 * finite number. Returns null if any key is missing/NaN — callers then treat the
 * attempt as a provider failure and fall back. Guards against the truncated /
 * partial-object case that would otherwise silently average to NaN.
 */
export function extractScores(obj, keys) {
  const s = obj && typeof obj === 'object' ? obj.scores : null;
  if (!s || typeof s !== 'object') return null;
  const out = {};
  for (const k of keys) {
    const v = s[k];
    // Reject null/'undefined'/'' explicitly: Number(null) and Number('') are 0,
    // which is finite and would silently score a missing criterion at the floor.
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    out[k] = n;
  }
  return out;
}

/**
 * Call the gateway and return a parsed object, retrying once with a stricter
 * "concise output" instruction if the JSON is unparseable. Small models
 * (qwen3.5-4b) frequently blow the token budget on long rationales and emit
 * truncated JSON, which used to surface as empty scores.
 */
export async function callAssemblyAILLMJson(
  { messages, model = DEFAULT_ASSEMBLYAI_MODEL, temperature = 0.2, maxTokens = 3072 },
  opts = {},
) {
  const { retries = 1, timeoutMs = 30000, validateKeys = null } = opts;
  let last = { ok: false, error: 'no attempt made' };

  for (let i = 0; i <= retries; i++) {
    // On the retry, ask for a much shorter response so it fits the token budget.
    const msgs = i === 0
      ? messages
      : [...messages, {
          role: 'user',
          content: 'Your last reply was not valid JSON or was truncated. Reply with ONLY the JSON object, no prose, and keep each rationale to one short sentence.',
        }];
    const r = await callAssemblyAILLM({ messages: msgs, model, temperature, maxTokens }, timeoutMs);
    if (!r.ok) {
      last = { ok: false, error: r.error, requestId: r.requestId, status: r.status };
      continue;
    }
    const parsed = parseLLMJson(r.content);
    if (!parsed) {
      last = { ok: false, error: 'unparseable JSON', requestId: r.requestId };
      continue;
    }
    if (validateKeys) {
      const scores = extractScores(parsed, validateKeys);
      if (!scores) {
        last = { ok: false, error: 'missing/invalid score fields', requestId: r.requestId };
        continue;
      }
    }
    return { ok: true, evaluation: parsed, model: r.model, requestId: r.requestId };
  }
  return last;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Gateway errors come in two shapes: {metadata:{errors:[...]}} and {message:"..."}.
function extractError(raw) {
  try {
    const j = JSON.parse(raw);
    const d = j?.metadata?.errors;
    if (d) return Array.isArray(d) ? d.join('; ') : String(d);
    if (j?.message) return String(j.message);
    if (j?.error) return String(j.error);
  } catch {
    /* keep raw */
  }
  return raw;
}

export async function callAssemblyAILLM(
  { messages, model = DEFAULT_ASSEMBLYAI_MODEL, temperature = 0.2, maxTokens = 1024 },
  timeoutMs = 25000,
  { maxRetries = 1, backoffMs = 2000 } = {},
) {
  const key = env('ASSEMBLYAI_API_KEY');
  if (!key) return { ok: false, error: 'ASSEMBLYAI_API_KEY not set' };

  // The cheap/free gateway tier is rate-limited per model per 60s window, so
  // 429s are common under burst load. Retry transient 429/5xx with backoff.
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(ASSEMBLYAI_LLM_URL, {
        method: 'POST',
        headers: { authorization: key, 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        signal: ctrl.signal,
      });
      const raw = await res.text();
      if (!res.ok) {
        const transient = res.status === 429 || res.status >= 500;
        if (transient && attempt < maxRetries) {
          await sleep(backoffMs);
          continue;
        }
        return { ok: false, status: res.status, error: extractError(raw), requestId: reqId(raw) };
      }
      const data = JSON.parse(raw);
      const content = data?.choices?.[0]?.message?.content || '';
      if (!content) {
        return { ok: false, status: res.status, error: 'empty completion', requestId: data?.request_id || null };
      }
      return {
        ok: true,
        content,
        model: data?.request?.model || model,
        requestId: data?.request_id || null,
      };
    } catch (e) {
      if (attempt < maxRetries) {
        await sleep(backoffMs);
        continue;
      }
      return { ok: false, error: e.message };
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: 'exhausted retries' };
}
