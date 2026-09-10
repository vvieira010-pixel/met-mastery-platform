import express from 'express';
import { existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import aiHandler from './api/_routes/ai.js';
import aiStatusHandler from './api/_routes/ai-status.js';
import ttsHandler from './api/_routes/tts.js';
import generateImageHandler from './api/_routes/generate-image.js';
import getSubmissionsHandler from './api/_routes/get-submissions.js';
import saveSubmissionHandler from './api/_routes/save-submission.js';
import sendInviteHandler from './api/_routes/send-invite.js';
import evaluateSpeakingHandler from './api/_routes/evaluate-speaking.js';
import evaluateWritingHandler from './api/_routes/evaluate-writing.js';
import createStudentAccountHandler from './api/_routes/create-student-account.js';
import logLearningEventsHandler from './api/_routes/log-learning-events.js';
import markdownHomepageHandler from './api/_routes/markdown-homepage.js';
import healthHandler from './api/_routes/health.js';
import infoHandler from './api/_routes/info.js';

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
  `connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai https://api.deepgram.com https://api.elevenlabs.io${isDevelopment ? ' ws://localhost:* ws://127.0.0.1:*' : ''}`,
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

  app.all('/api/health', wrap(healthHandler));
  app.all('/api/v1/info', wrap(infoHandler));

  app.all('/api/ai', wrap(aiHandler));
  app.all('/api/tts', wrap(ttsHandler));
  app.all('/api/generate-image', wrap(generateImageHandler));
  app.all('/api/get-submissions', wrap(getSubmissionsHandler));
  app.all('/api/save-submission', wrap(saveSubmissionHandler));
  app.all('/api/send-invite', wrap(sendInviteHandler));
  app.all('/api/evaluate-speaking', wrap(evaluateSpeakingHandler));
  app.all('/api/evaluate-writing', wrap(evaluateWritingHandler));
  app.all('/api/ai-status', wrap(aiStatusHandler));
  app.all('/api/log-learning-events', wrap(logLearningEventsHandler));
  app.all('/api/markdown-homepage', wrap(markdownHomepageHandler));
  app.all('/api/create-student-account', wrap(createStudentAccountHandler));
  const { default: mcpHandler } = await import('./api/_routes/mcp.js');
  app.all('/mcp', wrap(mcpHandler));
  app.all('/.well-known/mcp', wrap(mcpHandler));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: 'mpa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // The normal production build renames Vite's entry to app.html so the
    // public Markdown index can coexist with the application. If a build is
    // interrupted after Vite writes index.html but before that rename, keep
    // the local production server usable instead of returning a 404 at '/'.
    const appEntryPath = path.join(distPath, 'app.html');
    const fallbackEntryPath = path.join(distPath, 'index.html');
    const entryPath = existsSync(appEntryPath) ? appEntryPath : fallbackEntryPath;
    app.use((req, res, next) => {
      if (req.path === '/' && /text\/markdown/i.test(req.headers.accept || '')) {
        res.setHeader('Vary', 'Accept, Accept-Encoding');
        res.type('text/markdown').sendFile(path.join(distPath, 'index.md'));
        return;
      }
      next();
    });
    app.get('/', (req, res, next) => {
      res.sendFile(entryPath, (err) => {
        if (err) next(err);
      });
    });
    app.use((req, res, next) => {
      if (req.path === '/.well-known/mcp/server-card.json') {
        res.setHeader('Content-Type', 'application/mcp-server-card+json');
      }
      if (req.path === '/.well-known/ai-catalog.json') {
        res.setHeader('Content-Type', 'application/ai-catalog+json');
      }
      next();
    });
    app.use(express.static(distPath));
    app.use((req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).type('application/problem+json').json({
          type: 'https://met-mastery.vercel.app/problems/api-route-not-found',
          title: 'API route not found',
          status: 404,
          code: 'api_route_not_found',
          detail: 'The requested API route does not exist.',
          resolution: 'Read /openapi.json for the public API contract.',
        });
        return;
      }
      res.status(404).type('text/markdown').send('# Page not found\n\nThe requested page does not exist. See /sitemap.xml or /docs for public resources.');
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
