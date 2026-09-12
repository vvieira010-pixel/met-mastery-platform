/**
 * api/_routes/_ai-providers.js — single source of truth for the AI cascade.
 *
 * Shared by api/_routes/ai.js (the proxy) and api/_routes/ai-status.js (the
 * redacted health check) so the model lists and the key-resolution rules can
 * never drift apart again.
 *
 * Historical bug this module prevents: the proxy built its attempt order from a
 * HARDCODED fallback list intersected with the configured model list, so only
 * the FIRST configured model of a provider was ever attempted. A deployment
 * with GEMINI_MODELS="gemini-2.5-flash" therefore had exactly one attempt in
 * the whole cascade — when Gemini returned 429 the request failed even though
 * other providers (and other Gemini models) were configured. The priority list
 * is now built from the configured lists themselves.
 */

const env = (name) => process.env[name] || '';

/** Diagnostics can carry a full class transcript plus teacher notes. */
export const MAX_AI_PROMPT_CHARS = 120_000;
export const AI_REQUEST_TIMEOUT_MS = 30_000;
export const AI_ATTEMPT_TIMEOUT_MS = 18_000;

export const multiKeys = (name) =>
  String(env(name) || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
    .filter((k, i, a) => a.indexOf(k) === i);

const parseList = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

/**
 * A provider's models come from (1) the singular override, (2) the plural list,
 * (3) the curated defaults — in that precedence order. An explicit config is
 * never polluted with the defaults.
 */
export const resolveModels = (singularEnv, pluralEnv, defaults) => {
  const single = env(singularEnv);
  const list = parseList(env(pluralEnv));
  if (!single && !list.length) return [...defaults];
  return [...new Set([...(single ? [single] : []), ...list])];
};

export function isGeminiModelName(model) {
  return /^(?:gemini|gemma)[a-z0-9._-]*$/i.test(String(model || '').trim());
}

// Model ids verified against each provider's model list on 2026-09-07. Order is
// best-first: the newer flash tiers are tried before the 2.5 tier, whose free
// quota is the one that hits HTTP 429 first.
export const DEFAULT_MODELS = {
  gemini: [
    'gemini-3.7-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemma-4-31b-it',
    'gemma-4-26b-a4b-it',
  ],
  groq: [
    'openai/gpt-oss-20b',
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'qwen/qwen3.6-27b',
  ],
  openrouter: [
    'nvidia/nemotron-3.5-lightning:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'thinkingmachines/inkling-small:free',
    'poolside/laguna-xs-2.1:free',
    'inclusionai/ling-3.0-flash-fin:free',
    'openrouter/free',
  ],
  nvidia: [
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'nvidia/nemotron-3-super-120b-a12b',
    'nvidia/nemotron-3-ultra-550b-a55b',
    'deepseek-ai/deepseek-v4-pro-0813',
    'deepseek-ai/deepseek-v4-flash-0731',
    'google/gemma-4-31b-it',
    'nvidia/llama-3.1-nemotron-51b-instruct',
  ],
  // OpenAI + Perplexity are OpenAI-compatible chat endpoints. They are wired in
  // so operators can extend the cascade with OPENAI_API_KEY / PERPLEXITY_API_KEY.
  openai: [
    'gpt-4o-mini',
    'gpt-4.1-mini',
    'gpt-4o',
    'o4-mini',
  ],
  perplexity: [
    'sonar',
    'sonar-pro',
    'sonar-reasoning',
  ],
  // AssemblyAI's LLM Gateway. Small (32k) context, so it is a last resort for
  // short prompts only — but it is already paid for and it answers when every
  // other provider is rate limited.
  };

const NVIDIA_EVIDENCE_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b',
  'nvidia/nemotron-3-super-120b-a12b',
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'deepseek-ai/deepseek-v4-pro-0813',
];
const NVIDIA_FAST_MODELS = [
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'nvidia/nemotron-3-super-120b-a12b',
  'deepseek-ai/deepseek-v4-flash-0731',
  'nvidia/llama-3.1-nemotron-51b-instruct',
];

export function geminiModels() {
  const configured = resolveModels('GEMINI_MODEL', 'GEMINI_MODELS', DEFAULT_MODELS.gemini)
    .filter(isGeminiModelName);
  // GEMINI_MODEL has been set to an API key by mistake before. Ignore it and
  // keep the service callable with the curated list.
  return configured.length ? configured : [...DEFAULT_MODELS.gemini];
}

export function nvidiaModels(isEvidenceHeavy) {
  const configured = parseList(env('NVIDIA_MODELS')).filter((m) => !/^openai\//i.test(m));
  const single = env('NVIDIA_MODEL');
  if (!configured.length && single) configured.push(single);
  const defaults = resolveModels('', 'NVIDIA_MODELS', DEFAULT_MODELS.nvidia);
  return [...new Set([
    ...configured,
    ...(isEvidenceHeavy ? NVIDIA_EVIDENCE_MODELS : NVIDIA_FAST_MODELS),
    ...defaults,
  ])];
}

/**
 * Resolved provider configuration for this request.
 * @param {{isEvidenceHeavy?: boolean}} opts
 */
export function providerConfig({ isEvidenceHeavy = false } = {}) {
  const configuredGroq = resolveModels('GROQ_MODEL', 'GROQ_MODELS', DEFAULT_MODELS.groq);
  const configuredOpenRouter = resolveModels('OPENROUTER_MODEL', 'OPENROUTER_MODELS', DEFAULT_MODELS.openrouter);
  const models = {
    gemini: geminiModels(),
    groq: configuredGroq,
    openrouter: configuredOpenRouter,
    nvidia: nvidiaModels(isEvidenceHeavy),
    openai: resolveModels('OPENAI_MODEL', 'OPENAI_MODELS', DEFAULT_MODELS.openai),
    perplexity: resolveModels('PERPLEXITY_MODEL', 'PERPLEXITY_MODELS', DEFAULT_MODELS.perplexity),
  };
  const keys = {
    // GEMINI_API_KEY plus any _2…_5 suffixed key are honored, so a rate-limited
    // or exhausted primary key does not take the whole diagnostic down. Each
    // extra free-tier key is its own quota bucket.
    gemini: [...new Set([
      ...multiKeys('GEMINI_API_KEY'),
      ...multiKeys('GEMINI_API_KEY_2'),
      ...multiKeys('GEMINI_API_KEY_3'),
      ...multiKeys('GEMINI_API_KEY_4'),
      ...multiKeys('GEMINI_API_KEY_5'),
    ])],
    groq: multiKeys('GROQ_API_KEY'),
    openrouter: multiKeys('OPENROUTER_API_KEY'),
    nvidia: multiKeys('NVIDIA_API_KEY'),
    openai: multiKeys('OPENAI_API_KEY'),
    perplexity: multiKeys('PERPLEXITY_API_KEY'),
  };
  return { models, keys };
}

/**
 * Attempt order: cheap/fast providers first so a hanging provider cannot eat
 * the serverless time budget and starve the healthy fallbacks. Every configured
 * model of a provider is tried (not just the first one).
 * @returns {Array<[string, string]>} [model, providerId] pairs, deduped.
 */
export function modelPriority({ isEvidenceHeavy = false } = {}) {
  const { models } = providerConfig({ isEvidenceHeavy });
  const order = [];
  const push = (provider) => {
    for (const model of models[provider]) order.push([model, provider]);
  };
  push('gemini');
  push('groq');
  push('openrouter');
  push('nvidia');
  push('openai');
  push('perplexity');
  const seen = new Set();
  return order.filter(([model, provider]) => {
    const k = `${provider}:${model}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Redacted census for /api/ai-status — key COUNTS and model ids only, never
 * secret values. Safe to expose publicly; it is what makes "AI is down" a
 * one-request diagnosis.
 */
export function providerCensus({ isEvidenceHeavy = false } = {}) {
  const { models, keys } = providerConfig({ isEvidenceHeavy });
  const out = {};
  for (const provider of Object.keys(models)) {
    out[provider] = {
      keys: keys[provider].length,
      configured: keys[provider].length > 0,
      models: models[provider],
    };
  }
  return {
    providers: out,
    attemptableModels: modelPriority({ isEvidenceHeavy })
      .filter(([model, provider]) => keys[provider]?.length && models[provider].includes(model))
      .map(([model, provider]) => `${provider}/${model}`),
    anyConfigured: Object.values(keys).some((k) => k.length > 0),
  };
}
