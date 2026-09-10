import test from 'node:test';
import assert from 'node:assert/strict';

// These tests pin the diagnostic AI cascade's environment-variable resolution:
//  - GEMINI_MODEL (singular) must be tried BEFORE GEMINI_MODELS (plural) even
//    when both are set (the dashboard one-model override must win).
//  - GEMINI_API_KEY_2 must be used as a fallback when the primary key is
//    rate-limited, so a single exhausted key does not break the diagnostic.
process.env.GEMINI_API_KEY = 'primary-key';
process.env.GEMINI_API_KEY_2 = 'fallback-key';
process.env.GEMINI_MODEL = 'gemini-2.5-pro';
process.env.GEMINI_MODELS = 'gemini-2.5-flash-lite,gemini-2.0-flash';
process.env.APP_ORIGIN = 'https://app.example.test';
// The AI proxy requires a session (audit AUTH-1). These contract tests exercise
// the server-side cascade as an internal caller, so we authenticate with the
// shared internal token — the same path production server-to-server calls use.
process.env.AI_INTERNAL_TOKEN = 'test-internal-token';
const INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN;

const { default: handler } = await import('../api/_routes/ai.js');

function request(ip, extra = {}) {
  return {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
      origin: 'https://app.example.test',
      'x-internal-token': INTERNAL_TOKEN,
    },
    body: { prompt: 'Reply with OK.', ...extra },
  };
}
function result() {
  return { statusCode: 200, headers: {}, body: null, status(c) { this.statusCode = c; return this; }, setHeader() {}, json(b) { this.body = b; return this; } };
}
function geminiModelFromUrl(url) { const m = String(url).match(/models\/([^:?]+)/); return m ? m[1] : null; }
function geminiKeyFromUrl(url) { const m = String(url).match(/[?&]key=([^&]+)/); return m ? m[1] : null; }

test('GEMINI_MODEL (singular) is tried before GEMINI_MODELS (plural)', async () => {
  let firstModel = null;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('generativelanguage.googleapis.com')) {
      if (!firstModel) firstModel = geminiModelFromUrl(u);
      return { ok: true, status: 200, async json() { return { candidates: [{ content: { parts: [{ text: 'ok' }] } }] }; } };
    }
    return { ok: false, status: 503, async json() { return {}; } };
  };
  const res = result();
  await handler(request('singular-wins'), res);
  assert.equal(res.statusCode, 200);
  assert.equal(firstModel, 'gemini-2.5-pro');
});

test('falls through to GEMINI_API_KEY_2 when the primary key is rate-limited', async () => {
  const triedKeys = [];
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('generativelanguage.googleapis.com')) {
      const k = geminiKeyFromUrl(u);
      triedKeys.push(k);
      if (k === 'primary-key') return { ok: false, status: 429, async json() { return { error: { message: 'rate limited' } }; } };
      return { ok: true, status: 200, async json() { return { candidates: [{ content: { parts: [{ text: 'ok via fallback key' }] } }] }; } };
    }
    return { ok: false, status: 503, async json() { return {}; } };
  };
  const res = result();
  await handler(request('key-fallback'), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(triedKeys, ['primary-key', 'fallback-key']);
  assert.equal(res.body.content[0].text, 'ok via fallback key');
});
