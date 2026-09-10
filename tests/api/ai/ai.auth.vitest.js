import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import {
  createAiTestApp,
  useGeminiKeyOnly,
  uniqueIp,
  mockGeminiSuccess,
  authHeaders,
  AI_TEST_TOKEN,
} from './helpers.js';

/**
 * Auth / access matrix for POST /api/ai.
 *
 * NEW contract (audit AUTH-1): the paid AI proxy is no longer anonymously
 * callable. A request must carry either a valid Supabase session OR the
 * shared AI_INTERNAL_TOKEN (server-to-server). Without either, it returns 401.
 * The Origin allowlist (403) and per-IP rate limit (429) remain as
 * defense-in-depth on top of that gate.
 */
describe('POST /api/ai - access (405 / 401 / 403 / 429)', () => {
  const app = createAiTestApp();
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...savedEnv };
    process.env.AI_INTERNAL_TOKEN = AI_TEST_TOKEN;
    delete process.env.APP_ORIGIN;
    useGeminiKeyOnly();
    vi.stubGlobal('fetch', mockGeminiSuccess());
  });

  afterEach(() => {
    process.env = savedEnv;
    vi.unstubAllGlobals();
  });

  it('returns 405 for non-POST methods', async () => {
    const res = await request(app).get('/api/ai').set('X-Forwarded-For', uniqueIp());
    expect(res.status).toBe(405);
    expect(res.body.error.message).toMatch(/method not allowed/i);
  });

  it('returns 401 when neither a session nor the internal token is present', async () => {
    // The old contract "no bearer token => NOT 401" was the open-proxy hole.
    // It must now be 401.
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/sign-in required/i);
  });

  it('accepts an internal token with no Origin header (server-to-server)', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set(authHeaders())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
  });

  it('accepts localhost Origin when authenticated with the internal token', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Origin', 'http://localhost:3000')
      .set(authHeaders())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
  });

  it('rejects a foreign Origin when unauthenticated (open-proxy hole closed)', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Origin', 'https://evil.example')
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(401);
  });

  it('allows a foreign Origin when the internal token is presented', async () => {
    // The internal token is a server-to-server credential; it bypasses the
    // Origin allowlist by design.
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Origin', 'https://evil.example')
      .set(authHeaders())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
  });

  it('returns 429 with Retry-After after 30 req/min from one IP', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 30; i++) {
      await request(app)
        .post('/api/ai')
        .set('X-Forwarded-For', ip)
        .set(authHeaders())
        .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    }
    const limited = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', ip)
      .set(authHeaders())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(limited.status).toBe(429);
    expect(limited.headers['retry-after']).toBe('60');
    expect(limited.body.error).toMatch(/too many requests/i);
  }, 30000);
});
