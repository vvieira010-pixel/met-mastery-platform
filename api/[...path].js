// api/[...path].js — single catch-all serverless function.
//
// Vercel deploys every non-underscore-prefixed .js file under api/ as its own
// Serverless Function. The Hobby plan allows 12; a flat api/ folder produced 14.
// This file is the single deployment target: it routes every /api/* request to
// the corresponding handler in ./_routes/ (which Vercel does NOT deploy, because
// directory names starting with "_" are ignored).
//
// Handlers live in api/_routes/*.js and are imported below.

import health from './_routes/health.js';
import info from './_routes/info.js';
import ai from './_routes/ai.js';
import tts from './_routes/tts.js';
import generateImage from './_routes/generate-image.js';
import getSubmissions from './_routes/get-submissions.js';
import saveSubmission from './_routes/save-submission.js';
import sendInvite from './_routes/send-invite.js';
import evaluateSpeaking from './_routes/evaluate-speaking.js';
import evaluateWriting from './_routes/evaluate-writing.js';
import createStudentAccount from './_routes/create-student-account.js';
import logLearningEvents from './_routes/log-learning-events.js';
import markdownHomepage from './_routes/markdown-homepage.js';
import mcp from './_routes/mcp.js';

const routes = {
  health,
  'v1/info': info,
  ai,
  tts,
  'generate-image': generateImage,
  'get-submissions': getSubmissions,
  'save-submission': saveSubmission,
  'send-invite': sendInvite,
  'evaluate-speaking': evaluateSpeaking,
  'evaluate-writing': evaluateWriting,
  'create-student-account': createStudentAccount,
  'log-learning-events': logLearningEvents,
  'markdown-homepage': markdownHomepage,
  mcp,
};

/**
 * Resolve the sub-path (e.g. "ai", "v1/info") for this request.
 *
 * `req.query.path` is the documented way to read a catch-all segment, but it
 * is not populated on every runtime/rewrite path — when it is missing the key
 * becomes "" and every /api/* request returns 404 with no other symptom. Fall
 * back to parsing req.url (always present) and finally to matching any known
 * route name inside the URL, so a request never fails purely on segment
 * extraction.
 */
function resolveRouteKey(req) {
  const raw = req.query?.path;
  const fromQuery = (Array.isArray(raw) ? raw : [raw]).filter(Boolean).join('/');
  if (fromQuery) return fromQuery.replace(/^\/+|\/+$/g, '');

  const pathname = String(req.url || req.originalUrl || '').split(/[?#]/)[0];
  const afterApi = pathname.match(/^\/api\/(.*)$/);
  const fromUrl = afterApi ? afterApi[1].replace(/^\/+|\/+$/g, '') : '';
  if (fromUrl) return fromUrl;

  return '';
}

export default async function handler(req, res) {
  let key = resolveRouteKey(req);
  let route = routes[key];

  // Last resort: if the resolved key is unknown, look for a known route name
  // anywhere in the request path. Covers proxies/rewrites that hand the
  // function a rewritten URL such as "/" while keeping the original path in a
  // Vercel-specific header.
  if (!route) {
    const candidates = [
      req.url, req.originalUrl,
      req.headers?.['x-original-url'], req.headers?.['x-vercel-original-path'],
      req.headers?.['x-rewrite-path'],
    ].map(v => String(v || '')).join(' ');
    const match = Object.keys(routes)
      .sort((a, b) => b.length - a.length)
      .find(name => candidates.includes(`/${name}`));
    if (match) { key = match; route = routes[match]; }
  }

  if (!route) {
    return res.status(404).json({ error: 'Not found', route: key || '(unresolved)' });
  }

  try {
    await route(req, res);
  } catch (e) {
    console.error(`[api] route error [${key}]:`, e);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}