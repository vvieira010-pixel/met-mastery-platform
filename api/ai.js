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
 * Optional model overrides (comma-separated, best-first priority):
 *   GEMINI_MODELS, OPENROUTER_MODELS, GROQ_MODELS, NVIDIA_MODELS
 * Cascade is globally ordered by MODEL_PRIORITY — best models across all providers
 * first. Each model is skipped if not in its provider's configured model list.
 */

const env = (name) => process.env[name] || '';
const multiKeys = (name) =>
  String(env(name) || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
    .filter((k, i, a) => a.indexOf(k) === i);

// Diagnostics can include a full class transcript plus detailed teacher notes.
// 8,000 characters prevented that normal workflow from ever reaching a model.
// This is intentionally well below the 5 MB HTTP body guard, but comfortably
// supports long, evidence-based diagnostic prompts (roughly 30,000 English tokens).
export const MAX_AI_PROMPT_CHARS = 120_000;

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
  const origin = req.headers['origin'] || '';
  if (!origin) return true; // server-to-server — no Origin header
  const allowed = env('APP_ORIGIN');
  if (allowed) return origin === allowed || /^https?:\/\/localhost(:\d+)?$/.test(origin);
  return true; // open until APP_ORIGIN is configured
}

const GEMINI_DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];

const OPENROUTER_DEFAULT_MODELS = [
  'openrouter/free',
  'deepseek/deepseek-chat-v3-0324:free',
  'deepseek/deepseek-r1-0528:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-4-scout:free',
  'qwen/qwen3-235b-a22b:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemma-3-27b-it:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
];

const GROQ_DEFAULT_MODELS = [
  'llama-3.3-70b-versatile',
  'qwen3-32b',
  'deepseek-r1-distill-70b',
  'llama-3.1-8b-instant',
  'llama-4-scout-17b-16e-instruct',
];

const NVIDIA_DEFAULT_MODELS = [
  // Hosted NVIDIA NIM text models. Keep this list provider-specific so
  // NVIDIA can carry diagnostics even when the other providers are unavailable.
  'deepseek-ai/deepseek-v4-flash',
  'moonshotai/kimi-k3',
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'meta/muse-glimmer-30b',
  'google/gemma-4-31b-it',
  'meta/llama-3.3-70b-instruct',
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'meta/llama-3.2-3b-instruct',
  'meta/llama-3.2-1b-instruct',
];

const parseList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

const GEMINI_MODELS = parseList(env('GEMINI_MODELS')).length
  ? parseList(env('GEMINI_MODELS')) : GEMINI_DEFAULT_MODELS;
const OPENROUTER_MODELS = parseList(env('OPENROUTER_MODELS')).length
  ? parseList(env('OPENROUTER_MODELS')) : OPENROUTER_DEFAULT_MODELS;
const GROQ_MODELS = parseList(env('GROQ_MODELS')).length
  ? parseList(env('GROQ_MODELS')) : GROQ_DEFAULT_MODELS;
/** fetch with an abort-backed timeout so a hung provider can't stall the function. */
async function fetchT(url, init, ms = 12000) {
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
  } = body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: { message: 'Missing "prompt"' } });
  }
  if (prompt.length > MAX_AI_PROMPT_CHARS) {
    return res.status(400).json({ error: { message: `Prompt too long (max ${MAX_AI_PROMPT_CHARS.toLocaleString()} characters).` } });
  }
  if (system && typeof system !== 'string') {
    return res.status(400).json({ error: { message: '"system" must be a string' } });
  }

  const sys = system || 'You are a helpful MET English teaching assistant.';
  const expectsJson = Boolean(response_format) || /(?:return|respond|output)\s+(?:only\s+)?(?:valid\s+)?json\b/i.test(`${sys}\n${prompt}`);
  const isJsonLike = (text) => {
    const s = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return (s.startsWith('{') && s.includes('}')) || (s.startsWith('[') && s.includes(']')) || (s.includes('{') && s.includes('}'));
  };
  const errors = [];

  const geminiKeys = multiKeys('GEMINI_API_KEY');
  const openrouterKeys = multiKeys('OPENROUTER_API_KEY');
  const groqKeys = multiKeys('GROQ_API_KEY');
  const nvidiaKeys = multiKeys('NVIDIA_API_KEY');
  if (!geminiKeys.length && !openrouterKeys.length && !groqKeys.length &&
      !nvidiaKeys.length) {
    return res.status(503).json({ error: { message: 'No AI provider keys configured on the server.' } });
  }

  async function tryGemini(key, model) {
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
      );
      if (r.ok) {
        const data = await r.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        if (text && (!expectsJson || isJsonLike(text))) return { content: [{ text }] };
        if (text && expectsJson) errors.push(`Gemini/${model}: non-JSON response`);
        errors.push(`Gemini/${model}: empty (${data?.candidates?.[0]?.finishReason || 'no candidates'})`);
      } else {
        errors.push(`Gemini/${model}: HTTP ${r.status}`);
      }
    } catch (e) { errors.push(`Gemini/${model}: ${e.message}`); }
    return null;
  }

  async function tryOpenAICompat(url, key, model, extraHeaders = {}, label) {
    const tag = `${label || 'provider'}/${model}`;
    try {
      const requestBody = { model, temperature, max_tokens, messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] };
      if (expectsJson) requestBody.response_format = { type: 'json_object' };
      let r = await fetchT(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
        body: JSON.stringify(requestBody),
      });
      // Some older OpenAI-compatible gateways reject response_format. Retry
      // that same model once without the hint before moving to the next model.
      if (!r.ok && expectsJson && (r.status === 400 || r.status === 422)) {
        const fallbackBody = { ...requestBody };
        delete fallbackBody.response_format;
        r = await fetchT(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
          body: JSON.stringify(fallbackBody),
        });
      }
      if (r.ok) {
        const data = await r.json();
        const text = data?.choices?.[0]?.message?.content || '';
        if (text && (!expectsJson || isJsonLike(text))) return { content: [{ text }] };
        if (text && expectsJson) errors.push(`${tag}: non-JSON response`);
        errors.push(`${tag}: empty response`);
      } else {
        errors.push(`${tag}: HTTP ${r.status}`);
      }
    } catch (e) { errors.push(`${tag}: ${e.message}`); }
    return null;
  }

  // The diagnostic's first stage carries the long transcript and returns the
  // core assessment. Its later feedback/homework stages are much smaller.
  // Put NVIDIA immediately after Gemini and select its models for the job,
  // instead of treating every request as the same generic chat completion.
  const isEvidenceHeavy = (prompt.length + sys.length) > 16_000 || max_tokens > 3_500;
  const NVIDIA_EVIDENCE_MODELS = [
    'deepseek-ai/deepseek-v4-flash',
    'moonshotai/kimi-k3',
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'meta/muse-glimmer-30b',
    'google/gemma-4-31b-it',
    'meta/llama-3.3-70b-instruct',
    'meta/llama-3.1-70b-instruct',
  ];
  const NVIDIA_FAST_MODELS = [
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'meta/llama-3.3-70b-instruct',
    'google/gemma-4-31b-it',
    'meta/llama-3.1-8b-instruct',
    'meta/llama-3.2-3b-instruct',
    'meta/llama-3.2-1b-instruct',
  ];
  const configuredNvidiaModels = parseList(env('NVIDIA_MODELS'))
    .filter((model) => !/^openai\//i.test(model));
  const NVIDIA_MODELS = [...new Set([...configuredNvidiaModels, ...NVIDIA_DEFAULT_MODELS])];
  const nvidiaPriority = [...new Set([
    ...(isEvidenceHeavy ? NVIDIA_EVIDENCE_MODELS : NVIDIA_FAST_MODELS),
    ...NVIDIA_MODELS,
  ])];
  const geminiFallback = [
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
  ];
  const openRouterFallback = [
    'deepseek/deepseek-r1-0528:free',
    'deepseek/deepseek-chat-v3-0324:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-235b-a22b:free',
    'meta-llama/llama-4-scout:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'google/gemma-3-27b-it:free',
    'nvidia/llama-3.1-nemotron-70b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'openrouter/free',
  ];
  const groqFallback = [
    ['llama-3.3-70b-versatile',                     'groq'],
    ['qwen3-32b',                                   'groq'],
    ['deepseek-r1-distill-70b',                     'groq'],
    ['llama-3.1-8b-instant',                        'groq'],
    ['llama-4-scout-17b-16e-instruct',              'groq'],
  ];
  const MODEL_PRIORITY = [
    ['gemini-2.5-flash', 'gemini'],
    ...nvidiaPriority.map((model) => [model, 'nvidia']),
    ...geminiFallback.map((model) => [model, 'gemini']),
    ...openRouterFallback.map((model) => [model, 'openrouter']),
    ...groqFallback,
  ];

  const providerKeys = { gemini: geminiKeys, groq: groqKeys, openrouter: openrouterKeys, nvidia: nvidiaKeys };
  const providerModels = { gemini: new Set(GEMINI_MODELS), groq: new Set(GROQ_MODELS), openrouter: new Set(OPENROUTER_MODELS), nvidia: new Set(NVIDIA_MODELS) };
  const providerRunner = {
    gemini: (k, m) => ({ id: 'gemini', run: () => tryGemini(k, m) }),
    groq: (k, m) => ({ id: 'groq', run: () => tryOpenAICompat('https://api.groq.com/openai/v1/chat/completions', k, m, {}, 'Groq') }),
    openrouter: (k, m) => ({ id: 'openrouter', run: () => tryOpenAICompat('https://openrouter.ai/api/v1/chat/completions', k, m, { 'X-Title': 'MET Proficiency Mastery' }, 'OpenRouter') }),
    nvidia: (k, m) => ({ id: 'nvidia', run: () => tryOpenAICompat('https://integrate.api.nvidia.com/v1/chat/completions', k, m, {}, 'Nvidia') }),
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

  // Stop starting new attempts once an overall budget is used up
  // so the function finishes inside serverless time limits.
  const deadline = Date.now() + 30_000;
  for (const a of ordered) {
    if (Date.now() > deadline) break;
    const result = await a.run();
    if (result) return res.status(200).json(result);
  }

  return res.status(502).json({ error: { message: `All AI providers failed:\n${errors.join('\n')}` } });
}
