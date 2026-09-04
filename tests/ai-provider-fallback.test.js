import test from 'node:test';
import assert from 'node:assert/strict';

process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
process.env.NVIDIA_API_KEY = 'test-nvidia-key';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.GEMINI_MODELS = 'gemini-2.5-flash';
process.env.OPENROUTER_MODELS = 'openrouter/free';
process.env.NVIDIA_MODELS = 'deepseek-ai/deepseek-v4-flash,meta/llama-3.3-70b-instruct';
process.env.GROQ_MODELS = 'llama-3.3-70b-versatile';
process.env.APP_ORIGIN = 'https://app.example.test';

const { default: handler, MAX_AI_PROMPT_CHARS } = await import('../api/ai.js');

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
  assert.equal(calls[0], 'gemini');
  assert.equal(calls[1], 'nvidia');
  assert.ok(calls.slice(1, -2).every((provider) => provider === 'nvidia'));
  assert.deepEqual(calls.slice(-2), ['openrouter', 'groq']);
});

test('puts NVIDIA second and uses its evidence model for a large diagnostic request', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const provider = providerFor(url);
    const body = JSON.parse(init.body);
    calls.push({ provider, model: body.model || null });
    if (provider === 'gemini') return response(503, { error: { message: 'temporarily unavailable' } });
    if (provider === 'nvidia') return response(200, { choices: [{ message: { content: 'NVIDIA diagnostic OK' } }] });
    return response(503, { error: { message: 'should not be reached' } });
  };

  const res = result();
  await handler(request('nvidia-evidence-priority', { prompt: 'evidence '.repeat(3_000), max_tokens: 6_000 }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content[0].text, 'NVIDIA diagnostic OK');
  assert.deepEqual(calls, [
    { provider: 'gemini', model: null },
    { provider: 'nvidia', model: 'deepseek-ai/deepseek-v4-flash' },
  ]);
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
    return response(503, {});
  };

  const res = result();
  await handler(request('json-fallback-test', { prompt: 'Return only valid JSON with the diagnosis.' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.content[0].text, '{"skillDiagnosis":"ok"}');
  assert.equal(calls[0].provider, 'gemini');
  assert.equal(calls[1].provider, 'nvidia');
});

test('does not return upstream provider error bodies', async () => {
  globalThis.fetch = async () => response(401, { error: { message: 'secret test-groq-key account detail' } });
  const res = result();
  await handler(request('error-redaction-test', { preferredProvider: 'groq' }), res);
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error.message, /Groq\/llama-3\.3-70b-versatile: HTTP 401/);
  assert.doesNotMatch(res.body.error.message, /secret test-groq-key|account detail/);
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
