import express from 'express';
import aiHandler from '../../../api/_routes/ai.js';

/**
 * Shared internal token for the AI proxy tests.
 *
 * The proxy now requires a session (audit AUTH-1). These integration tests
 * exercise the handler as an internal server-to-server caller, so we set
 * AI_INTERNAL_TOKEN and present it on every request that should succeed. The
 * handler reads env('AI_INTERNAL_TOKEN') per request, so setting it here
 * (module load, before any test runs) is enough.
 */
export const AI_TEST_TOKEN = process.env.AI_INTERNAL_TOKEN || 'vitest-internal-token';
process.env.AI_INTERNAL_TOKEN = AI_TEST_TOKEN;

/** Header bag that authenticates a request as an internal caller. */
export function authHeaders() {
  return { 'x-internal-token': AI_TEST_TOKEN };
}

/**
 * Minimal test app wrapping the real /api/ai handler.
 * Mirrors server.ts middleware (express.json 5mb) without starting a server.
 */
export function createAiTestApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.all('/api/ai', (req, res) => aiHandler(req, res));
  return app;
}

const KEY_VARS = [
  'GEMINI_API_KEY',
  'GEMINI_API_KEY_2',
  'OPENROUTER_API_KEY',
  'GROQ_API_KEY',
  'NVIDIA_API_KEY',
];

/** Set exactly one provider key so MODEL_PRIORITY is deterministic. */
export function useGeminiKeyOnly(key = 'test-gemini-key') {
  for (const v of KEY_VARS) delete process.env[v];
  process.env.GEMINI_API_KEY = key;
  process.env.AI_TELEMETRY = '0';
}

/** Remove every provider key to trigger the 503 path. */
export function useNoProviderKeys() {
  for (const v of KEY_VARS) delete process.env[v];
  process.env.AI_TELEMETRY = '0';
}

let ipCounter = 0;
/** Fresh IP per test — the handler rate-limits per IP (30/min). */
export function uniqueIp() {
  ipCounter += 1;
  return `10.200.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`;
}

const VALID_FEEDBACK_JSON = JSON.stringify({
  classFocus: 'Speaking task went well.',
  whatYouDidWell: [
    { strength: 'Task completion', explanation: 'You kept going.', evidence: 'night shift quote' },
    { strength: 'Clarity', explanation: 'Clear idea.', evidence: 'second quote' },
    { strength: 'Vocabulary', explanation: 'Good word choice.', evidence: 'third quote' },
  ],
  whatToImprove: [],
  finalNote: 'Nice work.',
});

/** Mock fetch that succeeds through the Gemini path. */
export function mockGeminiSuccess(text = VALID_FEEDBACK_JSON) {
  return async (url) => {
    if (String(url).includes('generativelanguage.googleapis.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
        }),
      };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  };
}

/** Mock fetch where every provider fails with the given HTTP status. */
export function mockAllProvidersFail(status = 500) {
  return async () => ({ ok: false, status, json: async () => ({}) });
}

/** Mock fetch returning provider prose (non-strict JSON) on success. */
export function mockNonJsonProse() {
  const prose = 'Here is my reasoning about {"classFocus":"x"} and why it matters...';
  return async (url) => {
    if (String(url).includes('generativelanguage.googleapis.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: prose }] }, finishReason: 'STOP' }],
        }),
      };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  };
}

export { VALID_FEEDBACK_JSON };
