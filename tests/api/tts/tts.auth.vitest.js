import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import ttsHandler from '../../../api/_routes/tts.js';

/**
 * Auth / access matrix for POST /api/tts (audit AUTH-4).
 * TTS drives paid providers, so it must require a session (or the shared
 * AI_INTERNAL_TOKEN). Unauthenticated calls return 401; the Origin allowlist
 * stays as defense-in-depth.
 */
const AI_TEST_TOKEN = process.env.AI_INTERNAL_TOKEN || 'vitest-internal-token';
process.env.AI_INTERNAL_TOKEN = AI_TEST_TOKEN;
const authHeaders = () => ({ 'x-internal-token': AI_TEST_TOKEN });

function createTtsTestApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.all('/api/tts', (req, res) => ttsHandler(req, res));
  return app;
}

/** Mock Deepgram returning a small audio payload so the cascade succeeds. */
function mockDeepgramAudio() {
  return async (url) => {
    if (String(url).includes('api.deepgram.com')) {
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => new Uint8Array([82, 73, 70, 70]).buffer, // "RIFF"
      };
    }
    return { ok: false, status: 500, json: async () => ({}) };
  };
}

describe('POST /api/tts - access (405 / 401 / 403)', () => {
  const app = createTtsTestApp();
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...savedEnv };
    process.env.AI_INTERNAL_TOKEN = AI_TEST_TOKEN;
    process.env.DEEPGRAM_API_KEY = 'test-deepgram-key';
    delete process.env.APP_ORIGIN;
    vi.stubGlobal('fetch', mockDeepgramAudio());
  });

  afterEach(() => {
    process.env = savedEnv;
    vi.unstubAllGlobals();
  });

  it('returns 405 for non-POST methods', async () => {
    const res = await request(app).get('/api/tts').set('X-Forwarded-For', '10.200.0.1');
    expect(res.status).toBe(405);
  });

  it('returns 401 when neither a session nor the internal token is present', async () => {
    const res = await request(app)
      .post('/api/tts')
      .set('X-Forwarded-For', '10.200.0.2')
      .send({ text: 'Hello there.' });
    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/sign-in required/i);
  });

  it('synthesizes audio for an internal (server-to-server) caller', async () => {
    const res = await request(app)
      .post('/api/tts')
      .set('X-Forwarded-For', '10.200.0.3')
      .set(authHeaders())
      .send({ text: 'Hello there.' });
    expect(res.status).toBe(200);
    expect(typeof res.body.audioB64).toBe('string');
    expect(res.body.audioB64).toMatch(/^data:audio/);
  });

  it('rejects a foreign Origin when unauthenticated (open-proxy hole closed)', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/tts')
      .set('X-Forwarded-For', '10.200.0.4')
      .set('Origin', 'https://evil.example')
      .send({ text: 'Hello there.' });
    expect(res.status).toBe(401);
  });

  it('allows a foreign Origin when the internal token is presented', async () => {
    process.env.APP_ORIGIN = 'https://allowed.example';
    const res = await request(app)
      .post('/api/tts')
      .set('X-Forwarded-For', '10.200.0.5')
      .set('Origin', 'https://evil.example')
      .set(authHeaders())
      .send({ text: 'Hello there.' });
    expect(res.status).toBe(200);
  });
});
