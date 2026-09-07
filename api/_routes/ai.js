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

const env = (name) => process.env[name] || '';
const multiKeys = (name) =>
  String(env(name) || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
    .filter((k, i, a) => a.indexOf(k) === i);

// Diagnostics can include a full class transcript plus detailed teacher notes.
// 8,000 characters prevented that normal workflow from ever reaching a model.
// This is intentionally well below the 5 MB HTTP body guard, but comfortably
// supports long, evidence-based diagnostic prompts (roughly 30,000 English tokens).
export const MAX_AI_PROMPT_CHARS = 120_000;
export const AI_REQUEST_TIMEOUT_MS = 30_000;
export const AI_ATTEMPT_TIMEOUT_MS = 18_000;

// ── Rate limit (best-effort per warm instance; set APP_ORIGIN in Vercel dashboard) ──
const _rl = new Map();
function checkRateLimit(ip, max = 30, windowMs = 60_000) {
  const now = Date.now();
  const e = _rl.get(ip) || { n: 0, t: now + windowMs };
  if (now > e.t) { e.n = 0; e.t = now + windowMs; }
  e.n++;
  _rl.set(ip, e);
  if (_rl.size > 500) for (const [k, v] of _rl) if (now > v.t) _rl.delete(k);
  return e.n <= max;
}
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

const GEMINI_DEFAULT_MODELS = [
  'gemini-3.7-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-flash-latest',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];

const OPENROUTER_DEFAULT_MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
];

const GROQ_DEFAULT_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'deepseek-r1-distill-llama-70b',
  'qwen/qwen3.6-27b',
];

const NVIDIA_DEFAULT_MODELS = [
  // Hosted NVIDIA NIM text models. Keep this list provider-specific so
  // NVIDIA can carry diagnostics even when the other providers are unavailable.
  // Retired models that return HTTP 410 have been removed, along with the large
  // models that hang past the attempt timeout and waste the request budget.
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'mistralai/mixtral-8x22b-instruct',
  'qwen/qwen3-next-80b-a3b-instruct',
  'nvidia/llama-3.1-nemotron-51b-instruct',
];

const parseList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

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

function isGeminiModelName(model) {
  return /^(?:gemini|gemma)[a-z0-9._-]*$/i.test(String(model || '').trim());
}

// A provider's models can be configured two ways: the singular env var
// (e.g. GEMINI_MODEL — one model, highest priority) or the plural env var
// (e.g. GEMINI_MODELS — comma-separated priority list). The singular override
// is tried FIRST so a dashboard one-model override takes effect even when the
// plural var already exists. Curated defaults are only used when NEITHER is
// set, so an explicit config is never polluted with the fallback models.
const resolveModels = (singularEnv, pluralEnv, defaults) => {
  const single = env(singularEnv);
  const list = parseList(env(pluralEnv));
  if (!single && !list.length) return defaults;
  return [...new Set([...(single ? [single] : []), ...list])];
};
const configuredGeminiModels = resolveModels('GEMINI_MODEL', 'GEMINI_MODELS', GEMINI_DEFAULT_MODELS)
  .filter(isGeminiModelName);
// A dashboard value in GEMINI_MODEL must be a model ID, never an API key. If
// it is malformed, keep the service callable with the curated Gemini models.
const GEMINI_MODELS = configuredGeminiModels.length ? configuredGeminiModels : GEMINI_DEFAULT_MODELS;
const OPENROUTER_MODELS = resolveModels('OPENROUTER_MODEL', 'OPENROUTER_MODELS', OPENROUTER_DEFAULT_MODELS);
const GROQ_MODELS = resolveModels('GROQ_MODEL', 'GROQ_MODELS', GROQ_DEFAULT_MODELS);
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
  if (!allowedOrigin(req)) {
    return res.status(403).json({ error: { message: 'Forbidden' } });
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: { message: 'Too many requests. Please slow down.' } });
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
    // eslint-disable-next-line no-console -- structured, redacted server-side operational event.
    console.info(JSON.stringify({ event: 'ai_attempt', provider, model, outcome, durationMs: Date.now() - startedAt }));
  };

  // GEMINI_API_KEY_2 (and any _2/_3 suffixed key) is honored as a fallback so a
  // rate-limited or exhausted primary key does not force the diagnostic to fall
  // back to other providers.
  const geminiKeys = [...new Set([...multiKeys('GEMINI_API_KEY'), ...multiKeys('GEMINI_API_KEY_2')])];
  const openrouterKeys = multiKeys('OPENROUTER_API_KEY');
  const groqKeys = multiKeys('GROQ_API_KEY');
  const nvidiaKeys = multiKeys('NVIDIA_API_KEY');
  if (!geminiKeys.length && !openrouterKeys.length && !groqKeys.length &&
      !nvidiaKeys.length) {
    return res.status(503).json({ error: { message: 'No AI provider keys configured on the server.' } });
  }

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

  // The diagnostic's first stage carries the long transcript and returns the
  // core assessment. Its later feedback/homework stages are much smaller.
  // Put NVIDIA immediately after Gemini and select its models for the job,
  // instead of treating every request as the same generic chat completion.
  const isEvidenceHeavy = (prompt.length + sys.length) > 16_000 || max_tokens > 3_500;
  const NVIDIA_EVIDENCE_MODELS = [
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'mistralai/mixtral-8x22b-instruct',
    'qwen/qwen3-next-80b-a3b-instruct',
    'nvidia/llama-3.1-nemotron-51b-instruct',
  ];
  const NVIDIA_FAST_MODELS = [
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'nvidia/nemotron-3-nano-30b-a3b',
    'mistralai/mixtral-8x22b-instruct',
    'nvidia/llama-3.1-nemotron-51b-instruct',
  ];
  const configuredNvidiaModels = parseList(env('NVIDIA_MODELS'))
    .filter((model) => !/^openai\//i.test(model));
  if (!configuredNvidiaModels.length && env('NVIDIA_MODEL')) configuredNvidiaModels.push(env('NVIDIA_MODEL'));
  const NVIDIA_MODELS = [...new Set([...configuredNvidiaModels, ...NVIDIA_DEFAULT_MODELS])];
  // Respect the operator's explicit NVIDIA model order first (so a configured
  // diagnostic-capable model is tried before the curated defaults), then the
  // evidence/fast-curated defaults, then the full configured+default set.
  const nvidiaPriority = [...new Set([
    ...configuredNvidiaModels,
    ...(isEvidenceHeavy ? NVIDIA_EVIDENCE_MODELS : NVIDIA_FAST_MODELS),
    ...NVIDIA_MODELS,
  ])];
  const geminiFallback = [
    'gemini-3.7-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
  ];
  const openRouterFallback = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'openai/gpt-oss-120b:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'openrouter/free',
  ];
  const groqFallback = [
    ['openai/gpt-oss-120b',                       'groq'],
    ['openai/gpt-oss-20b',                        'groq'],
    ['deepseek-r1-distill-llama-70b',             'groq'],
    ['qwen/qwen3.6-27b',                          'groq'],
  ];
  // Order matters for the time budget (AI_REQUEST_TIMEOUT_MS): fast, reliable
  // providers run first so a slow/hanging provider (e.g. NVIDIA's large models
  // timing out at the full attempt timeout) cannot consume the whole budget and
  // starve the healthy fallbacks. Groq and OpenRouter are quick OpenAI-compatible
  // gateways, so they are tried before the heavier NVIDIA evidence models.
  const MODEL_PRIORITY = [
    [GEMINI_MODELS[0], 'gemini'],
    ...geminiFallback.map((model) => [model, 'gemini']),
    ...groqFallback,
    ...openRouterFallback.map((model) => [model, 'openrouter']),
    ...nvidiaPriority.map((model) => [model, 'nvidia']),
  ];

  const providerKeys = { gemini: geminiKeys, groq: groqKeys, openrouter: openrouterKeys, nvidia: nvidiaKeys };
  const providerModels = { gemini: new Set(GEMINI_MODELS), groq: new Set(GROQ_MODELS), openrouter: new Set(OPENROUTER_MODELS), nvidia: new Set(NVIDIA_MODELS) };
  // `model` is carried on each attempt so a successful call can be attributed to
  // the exact provider model that served it (pricing and drift both need this).
  const providerRunner = {
    gemini: (k, m) => ({ id: 'gemini', model: m, run: () => tryGemini(k, m) }),
    groq: (k, m) => ({ id: 'groq', model: m, run: () => tryOpenAICompat('https://api.groq.com/openai/v1/chat/completions', k, m, {}, 'Groq') }),
    openrouter: (k, m) => ({ id: 'openrouter', model: m, run: () => tryOpenAICompat('https://openrouter.ai/api/v1/chat/completions', k, m, { 'X-Title': 'MET Proficiency Mastery' }, 'OpenRouter') }),
    nvidia: (k, m) => ({ id: 'nvidia', model: m, run: () => tryOpenAICompat('https://integrate.api.nvidia.com/v1/chat/completions', k, m, {}, 'Nvidia') }),
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

  // Stop starting new attempts once an overall budget is used up
  // so the function finishes inside serverless time limits.
  for (const a of ordered) {
    if (Date.now() > deadline) break;
    const attemptStartedAt = Date.now();
    const result = await a.run();
    if (result) {
      const text = result?.content?.[0]?.text || '';
      await logPrediction({
        ...telemetry,
        provider: a.id,
        modelId: a.model,
        outputChars: text.length,
        latencyMs: Date.now() - attemptStartedAt,
        status: 'ok',
      });
      return res.status(200).json(result);
    }
  }

  // Do not return provider model identifiers or raw provider failures. Those
  // values can contain dashboard configuration mistakes and are not useful to
  // a teacher. The detailed, redacted attempt records stay server-side.
  await logPrediction({
    ...telemetry,
    latencyMs: Date.now() - requestStartedAt,
    status: 'provider_error',
    error: `all providers failed after ${errors.length} attempt(s)`,
  });
  console.warn('[api/ai] all configured providers failed', { attempts: errors.length });
  return res.status(502).json({ error: { message: 'AI generation is temporarily unavailable. Please try Regen again in a moment.' } });
}
