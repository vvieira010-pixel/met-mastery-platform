import test from 'node:test';
import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.NVIDIA_API_KEY = 'test-nvidia-key';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GEMINI_MODELS = 'gemini-2.5-flash';
process.env.OPENROUTER_MODELS = 'openrouter/free';
process.env.NVIDIA_MODELS = 'openai/gpt-oss-120b';
process.env.GROQ_MODELS = 'llama-3.3-70b-versatile';
process.env.APP_ORIGIN = 'https://app.example.test';

const { default: handler } = await import('../api/ai.js');

function response(status, body) {
  const jsonBody = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      if (typeof body === 'string') throw new Error('not json');
      return body;
    },
    async text() { return jsonBody; },
  };
}

function request(ip, extra = {}) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': ip, origin: 'https://app.example.test' },
    body: { prompt: 'Reply with OK.', ...extra },
  };
}

function result() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(body) { this.body = body; return this; },
  };
}

function providerFor(url) {
  if (url.includes('generativelanguage.googleapis.com')) return 'gemini';
  if (url.includes('openrouter.ai')) return 'openrouter';
  if (url.includes('integrate.api.nvidia.com')) return 'nvidia';
  if (url.includes('api.groq.com')) return 'groq';
  return 'unknown';
}

test('uses each configured provider through the server proxy', async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push({ provider: providerFor(url), url: String(url) });
    const provider = providerFor(url);
    return provider === 'gemini'
      ? response(200, { candidates: [{ content: { parts: [{ text: 'Gemini OK' }] } }] })
      : response(200, { choices: [{ message: { content: `${provider} OK` } }] });
  };

  for (const [provider, expectedText] of [
    ['gemini', 'Gemini OK'],
    ['openrouter', 'openrouter OK'],
    ['nvidia', 'nvidia OK'],
    ['groq', 'groq OK'],
  ]) {
    const res = result();
    await handler(request(`provider-${provider}`, { preferredProvider: provider }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.content[0].text, expectedText);
  }

  assert.deepEqual(calls.map((call) => call.provider), ['gemini', 'openrouter', 'nvidia', 'groq']);
  assert.ok(calls[0].url.includes('key=test-gemini-key'), 'Gemini key is used server-side');
});

test('falls through provider failures and returns the first successful response', async () => {
  const calls = [];
  globalThis.fetch = async (url) => {
    const provider = providerFor(url);
    calls.push(provider);
    if (provider !== 'groq') return response(503, { error: { message: 'upstream secret should not escape' } });
    return response(200, { choices: [{ message: { content: 'Groq fallback OK' } }] });
  };

  const res = result();
  await handler(request('fallback-test'), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content[0].text, 'Groq fallback OK');
  assert.deepEqual(calls, ['gemini', 'openrouter', 'nvidia', 'groq']);
});

test('does not return upstream provider error bodies', async () => {
  globalThis.fetch = async () => response(401, { error: { message: 'secret test-groq-key account detail' } });
  const res = result();
  await handler(request('error-redaction-test', { preferredProvider: 'groq' }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error.message, /Groq\/llama-3\.3-70b-versatile: HTTP 401/);
  assert.doesNotMatch(res.body.error.message, /secret test-groq-key|account detail/);
});
