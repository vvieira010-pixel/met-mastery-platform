import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import aiHandler from './api/ai.js';
import ttsHandler from './api/tts.js';
import generateImageHandler from './api/generate-image.js';
import getSubmissionsHandler from './api/get-submissions.js';
import saveSubmissionHandler from './api/save-submission.js';
import sendInviteHandler from './api/send-invite.js';
import evaluateSpeakingHandler from './api/evaluate-speaking.js';
import createStudentAccountHandler from './api/create-student-account.js';

dotenv.config();
// Vite automatically loads .env.local for the browser bundle. Load it here as
// well so local Express API routes receive the same Vercel-pulled variables.
// Existing process environment values (as used by Vercel production) win.
dotenv.config({ path: '.env.local', override: false });

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  // Log but do NOT exit: an unhandled rejection inside a single async request
  // must not take down the whole server (availability / DoS protection).
  // Route handlers are wrapped below so errors become clean 500s instead.
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const isDevelopment = process.env.NODE_ENV !== 'production';
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-inline'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com https://api.groq.com https://openrouter.ai https://api.deepgram.com https://api.elevenlabs.io${isDevelopment ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
  "media-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers. Keep this policy in sync with `vercel.json` — the two
  // deploy targets (express via `npm start`, and Vercel) must enforce the
  // same rules.
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Wrap async API handlers so a thrown/rejected error becomes a clean 500
  // instead of an unhandledRejection that could crash the process.
  const wrap = (handler) => (req, res) => {
    try {
      Promise.resolve(handler(req, res)).catch((err) => {
        console.error('[api] unhandled error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Internal server error.' });
      });
    } catch (err) {
      console.error('[api] synchronous error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error.' });
    }
  };

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.all('/api/ai', wrap(aiHandler));
  app.all('/api/tts', wrap(ttsHandler));
  app.all('/api/generate-image', wrap(generateImageHandler));
  app.all('/api/get-submissions', wrap(getSubmissionsHandler));
  app.all('/api/save-submission', wrap(saveSubmissionHandler));
  app.all('/api/send-invite', wrap(sendInviteHandler));
  app.all('/api/evaluate-speaking', wrap(evaluateSpeakingHandler));
  app.all('/api/create-student-account', wrap(createStudentAccountHandler));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
