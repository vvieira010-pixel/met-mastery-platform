import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import {
  createAiTestApp,
  useGeminiKeyOnly,
  useNoProviderKeys,
  uniqueIp,
  mockGeminiSuccess,
  mockAllProvidersFail,
  mockNonJsonProse,
} from './helpers.js';

/**
 * Contract matrix for POST /api/ai:
 * 200 shape, 503 no-keys, 502 provider-failure mapping (incl. provider 401
 * and non-JSON prose), and no-leak guarantee.
 */
describe('POST /api/ai - contract (200 / 502 / 503 + no-leak)', () => {
  const app = createAiTestApp();
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...savedEnv };
    delete process.env.APP_ORIGIN;
  });

  afterEach(() => {
    process.env = savedEnv;
    vi.unstubAllGlobals();
  });

  it('returns 200 with { content: [{ text }] } on provider success', async () => {
    useGeminiKeyOnly();
    vi.stubGlobal('fetch', mockGeminiSuccess());
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(Array.isArray(res.body.content)).toBe(true);
    expect(typeof res.body.content[0].text).toBe('string');
  });

  it('returns 503 when no provider keys are configured', async () => {
    useNoProviderKeys();
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(503);
    expect(res.body.error.message).toMatch(/no ai provider keys/i);
  });

  it('maps provider 500s to generic 502 without leaking internals', async () => {
    useGeminiKeyOnly();
    vi.stubGlobal('fetch', mockAllProvidersFail(500));
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    expect(res.status).toBe(502);
    expect(res.body.error.message).toMatch(/temporarily unavailable/i);
    const raw = JSON.stringify(res.body).toLowerCase();
    expect(raw).not.toContain('gemini');
    expect(raw).not.toContain('test-gemini-key');
  });

  it('maps provider 401s (bad key) to generic 502, never 401', async () => {
    useGeminiKeyOnly('invalid-key');
    vi.stubGlobal('fetch', mockAllProvidersFail(401));
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"ok":true}' });
    // Client sees 502 even though the upstream cause was 401 — locks the
    // "do not return upstream provider error bodies" contract.
    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('401');
    expect(JSON.stringify(res.body).toLowerCase()).not.toContain('invalid-key');
  });

  it('maps non-JSON provider prose to 502 (strict-JSON gate)', async () => {
    useGeminiKeyOnly();
    vi.stubGlobal('fetch', mockNonJsonProse());
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({ prompt: 'Return ONLY VALID JSON: {"classFocus":"x"}' });
    expect(res.status).toBe(502);
  });

  it('round-trips the diagnostic feedback shape providers must return', async () => {
    useGeminiKeyOnly();
    const feedback = JSON.stringify({
      classFocus: 'Speaking task went well.',
      whatYouDidWell: [
        { strength: 's1', explanation: 'e1', evidence: 'q1' },
        { strength: 's2', explanation: 'e2', evidence: 'q2' },
        { strength: 's3', explanation: 'e3', evidence: 'q3' },
      ],
      whatToImprove: [],
      finalNote: 'Done.',
    });
    vi.stubGlobal('fetch', mockGeminiSuccess(feedback));
    const res = await request(app)
      .post('/api/ai')
      .set('X-Forwarded-For', uniqueIp())
      .send({
        prompt: 'Return ONLY VALID JSON: {"classFocus":"..."}',
        max_tokens: 2600,
        temperature: 0.3,
      });
    expect(res.status).toBe(200);
    const parsed = JSON.parse(res.body.content[0].text);
    expect(parsed.whatYouDidWell.length).toBeGreaterThanOrEqual(3);
  });
});
