/**
 * api/_ml/pricing.js — cost estimation for the provider cascade.
 *
 * Providers do not all return token usage, and ai.js must stay provider-agnostic.
 * So we estimate from characters (4 chars ~ 1 token) when usage is absent and
 * flag the row with tokens_estimated = true. That is deliberately approximate:
 * this exists to answer "is this feature costing $5 or $500 a month", not to
 * reconcile an invoice.
 *
 * Prices are USD per 1M tokens. They change — review quarterly. Unknown models
 * fall back to DEFAULT_RATE rather than 0, so a new model never looks free.
 */

const USD_PER_1M = {
  'gemini-2.5-pro': { in: 1.25, out: 10.0 },
  'gemini-2.5-flash': { in: 0.3, out: 2.5 },
  'gemini-2.5-flash-lite': { in: 0.1, out: 0.4 },
  'gemini-2.0-flash': { in: 0.1, out: 0.4 },
  'gemini-2.0-flash-lite': { in: 0.075, out: 0.3 },
  'llama-3.3-70b-versatile': { in: 0.59, out: 0.79 },
  'llama-3.1-8b-instant': { in: 0.05, out: 0.08 },
  'llama-4-scout-17b-16e-instruct': { in: 0.11, out: 0.34 },
  'qwen3-32b': { in: 0.29, out: 0.59 },
  'deepseek-r1-distill-70b': { in: 0.75, out: 0.99 },
};

const DEFAULT_RATE = { in: 0.15, out: 0.6 };
const CHARS_PER_TOKEN = 4;

function rateFor(modelId) {
  const id = String(modelId || '').trim();
  if (!id) return DEFAULT_RATE;
  // OpenRouter free tiers and self-hosted NIM are genuinely zero-rated.
  if (id.endsWith(':free') || id === 'openrouter/free') return { in: 0, out: 0 };
  return USD_PER_1M[id] || DEFAULT_RATE;
}

/**
 * @returns {{costUsd: number, tokensEstimated: boolean, promptTokens: number, completionTokens: number}}
 */
export function estimateCost({ modelId, promptChars = 0, completionChars = 0, promptTokens = null, completionTokens = null }) {
  const rate = rateFor(modelId);
  const hasUsage = Number.isFinite(promptTokens) || Number.isFinite(completionTokens);
  const pTok = Number.isFinite(promptTokens)
    ? Number(promptTokens)
    : Math.ceil((Number(promptChars) || 0) / CHARS_PER_TOKEN);
  const cTok = Number.isFinite(completionTokens)
    ? Number(completionTokens)
    : Math.ceil((Number(completionChars) || 0) / CHARS_PER_TOKEN);
  const costUsd = (pTok / 1_000_000) * rate.in + (cTok / 1_000_000) * rate.out;
  return {
    costUsd: Number(costUsd.toFixed(8)),
    tokensEstimated: !hasUsage,
    promptTokens: pTok,
    completionTokens: cTok,
  };
}
