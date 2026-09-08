/**
 * api/_routes/ai-status.js — redacted health check for the AI cascade.
 *
 * Answers "why is Regen failing?" in one request. It reports only the NUMBER of
 * API keys per provider plus the resolved model ids and the order the proxy will
 * try them in — never a key value, never a provider error body.
 *
 *   GET /api/ai-status            → config census (no tokens spent)
 *   GET /api/ai-status?probe=1    → additionally sends one tiny live request
 *                                   through the real /api/ai handler logic
 *
 * A provider with keys:0 is simply not configured on this deployment, which is
 * the usual reason a single 429 takes the whole feature down.
 */

import { applyPublicApiHeaders, writeProblem } from './_problem.js';
import { providerCensus, multiKeys } from './_ai-providers.js';

const PING_TIMEOUT_MS = 10_000;

/** One tiny live request per configured provider. Costs a handful of tokens. */
async function ping(provider, model, key) {
  const startedAt = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  try {
    let url;
    let init;
    if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      init = { body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the word OK.' }] }], generationConfig: { temperature: 0, maxOutputTokens: 8 } }) };
    } else {
      url = {
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        nvidia: 'https://integrate.api.nvidia.com/v1/chat/completions',
      }[provider];
      init = { headers: { Authorization: `Bearer ${key}` }, body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Reply with the word OK.' }], temperature: 0, max_tokens: 8 }) };
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      body: init.body,
      signal: ctrl.signal,
    });
    const ms = Date.now() - startedAt;
    if (r.ok) {
      const data = await r.json().catch(() => null);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.choices?.[0]?.message?.content || '';
      return { provider, model, ok: Boolean(String(text).trim()), status: r.status, ms, sample: String(text).trim().slice(0, 20) };
    }
    // Provider error bodies can echo account details — never forward them.
    return { provider, model, ok: false, status: r.status, ms };
  } catch (e) {
    return { provider, model, ok: false, status: e.name === 'AbortError' ? 'timeout' : 'error', ms: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  applyPublicApiHeaders(res);
  if (req.method !== 'GET') {
    writeProblem(res, 405, 'method_not_allowed', 'This endpoint only accepts GET requests.', 'Use GET /api/ai-status.', 'GET');
    return;
  }

  const isEvidenceHeavy = req.query?.heavy === '1';
  const census = providerCensus({ isEvidenceHeavy });
  const configured = Object.entries(census.providers).filter(([, p]) => p.configured);

  const body = {
    service: 'met-mastery-ai',
    readOnly: true,
    // Zero configured providers means /api/ai can only ever return 503.
    anyConfigured: census.anyConfigured,
    configuredProviders: configured.map(([name]) => name),
    unconfiguredProviders: Object.entries(census.providers)
      .filter(([, p]) => !p.configured).map(([name]) => name),
    // The exact order the proxy will attempt, filtered to providers that have keys.
    attemptableModels: census.attemptableModels,
    providers: census.providers,
    hint: 'keys:0 means the env var is missing or empty on this deployment. Add it in the Vercel dashboard, then redeploy.',
  };

  if (req.query?.probe === '1') {
    const pings = [];
    for (const [provider, cfg] of configured) {
      const keys = provider === 'gemini'
        ? [...new Set([...multiKeys('GEMINI_API_KEY'), ...multiKeys('GEMINI_API_KEY_2'), ...multiKeys('GEMINI_API_KEY_3')])]
        : multiKeys(`${provider.toUpperCase()}_API_KEY`);
      const key = keys[0];
      if (key) pings.push(ping(provider, cfg.models[0], key));
    }
    body.probe = await Promise.all(pings);
    body.probeHint = 'ok:false with status 401/403 = dead key; 429 = quota exhausted; timeout = provider too slow for the serverless budget.';
  }

  res.status(200).json(body);
}
