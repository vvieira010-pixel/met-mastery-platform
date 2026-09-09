import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import {
  createAiTestApp,
  useGeminiKeyOnly,
  uniqueIp,
  mockGeminiSuccess,
} from './helpers.js';

/**
 * Auth / access matrix for POST /api/ai.
 * Truth: this proxy has NO bearer-token 401. Access is gated by
 * method (405), Origin allowlist (403), and per-IP rate limit (429).
 * The 401-that-matters (provider key invalid) surfaces as 502 — covered
 * in ai.contract.test.js. The "no 401" test below locks that contract in.
 */
describe('POST /api/ai - access (405 / 403 / 429 + no-401 lock)', () => {
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

  it('returns 405 for non-POST methods', async () => {
    const res = await request(app).get('/api/ai').set('X-Forwarded-For', uniqueIp());
    expect(res.status).toBe(405);
    expect(res.body.error.message).toMatch(/method not allowed/i);
  });

  it('documents: no bearer token => NOT 401 (proxy has no auth layer)', async () => {
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    // No Authorization header sent; proxy still processes the request.
    expect([200, 400, 502, 503]).toContain(res.status);
    expect(res.status).not.toBe(401);
  });

  it('returns 403 for a foreign Origin when APP_ORIGIN is set', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Origin', 'https://evil.example')
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Forbidden');
  });

  it('allows localhost Origin even when APP_ORIGIN is set', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .set('Origin', 'http://localhost:3000')
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
  });

  it('allows requests with no Origin header (server-to-server)', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
  });

  it('returns 429 with Retry-After after 30 req/min from one IP', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 30; i++) {
      await request(app)
        .post('/api/ai')
        .set('X-Forwarded-For', ip)
        .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    }
    const limited = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', ip)
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(limited.status).toBe(429);
    expect(limited.headers['retry-after']).toBe('60');
    expect(limited.body.error).toMatch(/too many requests/i);
  }, 30000);
});
