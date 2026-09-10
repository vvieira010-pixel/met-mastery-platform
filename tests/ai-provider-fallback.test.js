import test from 'node:test';
import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.NVIDIA_API_KEY = 'test-nvidia-key';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GEMINI_MODELS = 'gemini-2.5-flash';
process.env.OPENROUTER_MODELS = 'openrouter/free';
process.env.NVIDIA_MODELS = 'deepseek-ai/deepseek-v4-flash,meta/llama-3.3-70b-instruct';
process.env.GROQ_MODELS = 'openai/gpt-oss-120b';
process.env.APP_ORIGIN = 'https://app.example.test';
// The AI proxy requires a session (audit AUTH-1). These contract tests exercise
// the cascade as an internal caller via the shared internal token.
process.env.AI_INTERNAL_TOKEN = 'test-internal-token';
const INTERNAL_TOKEN = process.env.AI_INTERNAL_TOKEN;

const {
  default: handler,
  AI_ATTEMPT_TIMEOUT_MS,
  AI_REQUEST_TIMEOUT_MS,
  MAX_AI_PROMPT_CHARS,
} = await import('../api/_routes/ai.js');

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
    headers: {
      'x-forwarded-for': ip,
      origin: 'https://app.example.test',
      'x-internal-token': INTERNAL_TOKEN,
    },
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
  if (url.includes('llm-gateway.assemblyai.com')) return 'assemblyai';
  if (url.includes('openrouter.ai')) return 'openrouter';
  if (url.includes('integrate.api.nvidia.com')) return 'nvidia';
  if (url.includes('api.groq.com')) return 'groq';
  return 'unknown';
}

test('gives a provider enough time without letting fallback attempts exceed the request budget', () => {
  assert.equal(AI_ATTEMPT_TIMEOUT_MS, 18_000);
  assert.equal(AI_REQUEST_TIMEOUT_MS, 30_000);
  assert.ok(AI_ATTEMPT_TIMEOUT_MS < AI_REQUEST_TIMEOUT_MS);
});

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
  assert.equal(calls[0], 'gemini');
  assert.equal(calls[1], 'groq');
});

test('reaches NVIDIA after the faster providers fail and uses its configured model for a large diagnostic request', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const provider = providerFor(url);
    const body = JSON.parse(init.body);
    calls.push({ provider, model: body.model || null });
    if (provider === 'gemini' || provider === 'groq' || provider === 'openrouter') return response(503, { error: { message: 'temporarily unavailable' } });
    if (provider === 'nvidia') return response(200, { choices: [{ message: { content: 'NVIDIA diagnostic OK' } }] });
    return response(503, { error: { message: 'should not be reached' } });
  };

  const res = result();
  await handler(request('nvidia-evidence-priority', { prompt: 'evidence '.repeat(3_000), max_tokens: 6_000 }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content[0].text, 'NVIDIA diagnostic OK');
  assert.equal(calls[0].provider, 'gemini');
  assert.equal(calls[1].provider, 'groq');
  assert.equal(calls[2].provider, 'openrouter');
  assert.equal(calls[3].provider, 'nvidia');
  assert.equal(calls[3].model, 'deepseek-ai/deepseek-v4-flash');
});

test('rejects malformed JSON and continues to the next model in the cascade', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const provider = providerFor(url);
    const body = JSON.parse(init.body);
    calls.push({ provider, body });
    if (provider === 'gemini') {
      assert.equal(body.generationConfig.responseMimeType, 'application/json');
      return response(200, { candidates: [{ content: { parts: [{ text: 'I cannot format this.' }] } }] });
    }
    if (provider === 'nvidia') {
      assert.deepEqual(body.response_format, { type: 'json_object' });
      return response(200, { choices: [{ message: { content: '{"skillDiagnosis":"ok"}' } }] });
    }
    return response(200, { choices: [{ message: { content: 'not-valid-json' } }] });
  };

  const res = result();
  await handler(request('json-fallback-test', { prompt: 'Return only valid JSON with the diagnosis.' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content[0].text, '{"skillDiagnosis":"ok"}');
  assert.equal(calls[0].provider, 'gemini');
  assert.equal(calls[calls.length - 1].provider, 'nvidia');
});

test('does not return upstream provider error bodies', async () => {
  globalThis.fetch = async () => response(401, { error: { message: 'secret test-groq-key account detail' } });
  const res = result();
  await handler(request('error-redaction-test', { preferredProvider: 'groq' }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error.message, /AI generation is temporarily unavailable/);
  assert.doesNotMatch(res.body.error.message, /secret test-groq-key|account detail/);
});

test('attempts every configured model of a provider, not only the first one', async () => {
  const original = process.env.GEMINI_MODELS;
  process.env.GEMINI_MODELS = 'gemini-3.7-flash,gemini-2.5-flash,gemini-2.5-pro';
  try {
    const tried = [];
    globalThis.fetch = async (url) => {
      const model = String(url).match(/models\/([^:]+):generateContent/)?.[1];
      if (model) tried.push(model);
      return response(503, { error: { message: 'unavailable' } });
    };

    const res = result();
    await handler(request('all-models-test', { preferredProvider: 'gemini' }), res);
    assert.deepEqual(tried, ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.5-pro']);
  } finally {
    process.env.GEMINI_MODELS = original;
  }
});

test('reports quota exhaustion with HTTP 429 when every provider is rate limited', async () => {
  globalThis.fetch = async () => response(429, { error: { message: 'quota exceeded for model' } });
  const res = result();
  await handler(request('all-rate-limited-test'), res);
  assert.equal(res.statusCode, 429);
  assert.match(res.body.error.message, /rate limited|quota/i);
});



test('accepts long diagnostic prompts and retains a bounded request guard', async () => {
  const receivedPrompts = [];
  globalThis.fetch = async (_url, init) => {
    receivedPrompts.push(JSON.parse(init.body).contents?.[0]?.parts?.[0]?.text || '');
    return response(200, { candidates: [{ content: { parts: [{ text: 'Long diagnostic OK' }] } }] });
  };

  const longDiagnosticPrompt = 'student evidence '.repeat(1_500); // 25,500 characters
  const accepted = result();
  await handler(request('long-diagnostic-test', { prompt: longDiagnosticPrompt, preferredProvider: 'gemini' }), accepted);
  assert.equal(accepted.statusCode, 200);
  assert.equal(accepted.body.content[0].text, 'Long diagnostic OK');
  assert.equal(receivedPrompts[0], longDiagnosticPrompt);

  const tooLong = result();
  await handler(request('too-long-diagnostic-test', { prompt: 'x'.repeat(MAX_AI_PROMPT_CHARS + 1) }), tooLong);
  assert.equal(tooLong.statusCode, 400);
  assert.match(tooLong.body.error.message, /120,000 characters/);
});
