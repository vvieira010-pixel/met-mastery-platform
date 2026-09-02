/**
 * api/_config.js — centralized server config for the api/ serverless functions.
 *
 * SECURITY POLICY (fail-closed):
 *  - Never hardcode secrets. The Supabase SERVICE-ROLE key is server-only and
 *    MUST come from the deployment environment (Vercel/Netlify). If it is
 *    missing the functions refuse the request (500) instead of falling back to
 *    a committed key.
 *  - The project URL contains only the public project ref, not a secret, so a
 *    fallback is harmless.
 *  - The service-role key bypasses Row Level Security. It must never reach the
 *    browser and must be rotated if it was ever committed.
 */

// Public project ref only — not a secret.
const PROJECT_URL = 'https://grnzzgzqizoxfcbflnwq.supabase.co';

export function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || PROJECT_URL;
  return (url || '').replace(/\/+$/, '');
}

/** Server-only. Returns '' when unset so callers can fail closed. */
export function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
}

/**
 * Return the service key or refuse the response (fail-closed).
 * Returns null when the key is missing; the caller should `return` immediately.
 */
export function requireServiceKey(res) {
  const key = getServiceKey();
  if (!key) {
    console.error('[api] SUPABASE_SERVICE_ROLE_KEY is not set — refusing request (fail-closed).');
    if (res && !res.headersSent) res.status(500).json({ error: 'Server misconfigured.' });
    return null;
  }
  return key;
}

/** Teacher allowlist (lowercased emails). Empty => no allowlist configured. */
export function allowedTeacherEmails() {
  return (process.env.VITE_TEACHER_EMAIL || process.env.TEACHER_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Same-origin check for unauthenticated submission endpoints.
 * When APP_ORIGIN is configured, the request Origin/Referer must match it.
 * When unset, we still rely on the teacher allowlist enforced by the caller.
 */
export function isSameOrigin(req) {
  const allowed = (process.env.APP_ORIGIN || '').toLowerCase();
  if (!allowed) return true;
  const origin = (req.headers.origin || '').toLowerCase();
  const referer = (req.headers.referer || '').toLowerCase();
  return origin === allowed || referer.startsWith(allowed);
}
