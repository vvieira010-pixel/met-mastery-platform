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
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const isDevelopment = process.env.NODE_ENV !== 'production';
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-inline'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.fontshare.com",
  `connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com https://api.anthropic.com https://api.groq.com https://openrouter.ai https://api.deepgram.com https://api.elevenlabs.io${isDevelopment ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
  "media-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function cspMiddleware(req, res, next) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.all('/api/ai', (req, res) => aiHandler(req, res));
  app.all('/api/tts', (req, res) => ttsHandler(req, res));
  app.all('/api/generate-image', (req, res) => generateImageHandler(req, res));
  app.all('/api/get-submissions', (req, res) => getSubmissionsHandler(req, res));
  app.all('/api/save-submission', (req, res) => saveSubmissionHandler(req, res));
  app.all('/api/send-invite', (req, res) => sendInviteHandler(req, res));
  app.all('/api/evaluate-speaking', (req, res) => evaluateSpeakingHandler(req, res));

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
