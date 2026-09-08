import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import {
  createAiTestApp,
  useGeminiKeyOnly,
  uniqueIp,
  mockGeminiSuccess,
} from './helpers.js';

/** Input-validation matrix for POST /api/ai (400s + pass-through behavior). */
describe('POST /api/ai - input validation', () => {
  const app = createAiTestApp();
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...savedEnv };
    delete process.env.APP_ORIGIN;
    useGeminiKeyOnly();
    vi.stubGlobal('fetch', mockGeminiSuccess());
  });

  afterEach(() => {
    process.env = savedEnv;
    vi.unstubAllGlobals();
  });

  it('returns 400 when prompt is missing', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/missing "prompt"/i);
  });

  it('returns 400 when prompt is not a string', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 12345 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when system is not a string', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'hello', system: { role: 'x' } });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/"system" must be a string/i);
  });

  it('returns 400 when prompt exceeds 120000 chars', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'a'.repeat(120001) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/prompt too long/i);
  });

  it('accepts a prompt at exactly the limit', async () => {
    const prompt = 'Return ONLY VALID JSON: {"ok":true} ' + 'a'.repeat(119960);
    expect(prompt.length).toBeLessThanOrEqual(120000);
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt });
    expect(res.status).toBe(200);
  });

  it('passes SQL/XSS payloads to the provider (no proxy-level sanitizer)', async () => {
    const seen = [];
    vi.stubGlobal(
      'fetch',
      mockGeminiSuccess(JSON.stringify({ ok: true })),
    );
    const evil = `'; DROP TABLE diagnoses; -- <script>alert("xss")</script>`;
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: `Return ONLY VALID JSON: {"echo":"${evil}"}` });
    // Proxy does not block adversarial input; shape/escaping is the prompt contract's job.
    expect(res.status).toBe(200);
    expect(seen).toEqual([]);
  });

  it('accepts string body (raw JSON text) as well as parsed objects', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ prompt: 'Return ONLY VALID JSON: {"ok":true}' }));
    expect(res.status).toBe(200);
  });
});
