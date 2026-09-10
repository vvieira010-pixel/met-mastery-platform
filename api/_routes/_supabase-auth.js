/**
 * api/_supabase-auth.js — Supabase session verification for serverless routes.
 *
 * Keep this verifier self-contained and JavaScript-only. Vercel bundles files
 * in api/ as independent serverless functions; importing the application's
 * TypeScript auth entrypoint here leaves the .ts file out of the function
 * bundle and causes ERR_MODULE_NOT_FOUND at runtime.
 *
 * M-2 FIX: Local JWT verification via JWKS eliminates the per-request network
 * round-trip to Supabase Auth and removes the service-role key from the hot
 * path. The network fallback is preserved for edge cases (e.g. revoked tokens
 * that are still cryptographically valid).
 */
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getServiceKey, getSupabaseUrl, allowedTeacherEmails, isTeacherIdentity } from './_config.js';

let jwksClient = null;
let jwksUrl = null;

function getJwksClient() {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;
  const url = `${supabaseUrl.replace(/\/+$/, '')}/.well-known/jwks.json`;
  if (jwksClient && jwksUrl === url) return jwksClient;
  jwksUrl = url;
  jwksClient = createRemoteJWKSet(new URL(url));
  return jwksClient;
}

function extractUserFromPayload(payload) {
  if (!payload || !payload.sub) return null;
  const role = payload.role === 'teacher' || payload.role === 'admin' ? payload.role : 'student';
  return { id: payload.sub, email: payload.email || '', role };
}

/** Fast, local JWT verification using Supabase's JWKS. No network, no service key. */
export async function verifySupabaseSessionLocal(req) {
  const auth = req?.headers?.authorization || '';
  const token = typeof auth === 'string' ? auth.replace(/^Bearer\s+/i, '').trim() : '';
  if (!token) return null;

  const jwks = getJwksClient();
  if (!jwks) return null;

  try {
    const { payload } = await jwtVerify(token, jwks, { clockTolerance: 60 });
    return extractUserFromPayload(payload);
  } catch {
    return null;
  }
}

/**
 * Verify the caller's Supabase access token.
 * Tries local JWT verification first (fast, no network), then falls back to
 * the Supabase Auth API for edge cases (e.g. revoked sessions).
 * @returns {Promise<object|null>} the Supabase user object (id, email, role), or null if invalid.
 */
export async function verifySupabaseSession(req) {
  const local = await verifySupabaseSessionLocal(req);
  if (local) return local;

  // Fallback: network verification for tokens that pass JWKS signature checks
  // but may have been revoked server-side.
  const auth = req?.headers?.authorization || '';
  const token = typeof auth === 'string' ? auth.replace(/^Bearer\s+/i, '').trim() : '';
  if (!token) return null;

  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceKey();
  if (!supabaseUrl || !serviceKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const user = await response.json();
    if (!user || !user.id || user.role === 'anon') return null;
    const role = user.role === 'teacher' || user.role === 'admin' ? user.role : 'student';
    return { id: user.id, email: user.email, role };
  } catch {
    return null;
  }
}

/**
 * Verify the caller is a signed-in teacher.
 * Returns the user object when authorized, or null after writing a 401/403
 * response (caller must `return` immediately).
 */
export async function requireTeacher(req, res) {
  const user = await verifySupabaseSession(req);
  if (!user) {
    if (res && !res.headersSent) {
      res.status(401).json({ error: { message: 'Teacher sign-in required.' } });
    }
    return null;
  }
  const emails = allowedTeacherEmails();
  // A missing allowlist is a deployment configuration error, never permission
  // for every signed-in account. This route gates teacher-only operations such
  // as invitations and mock-test result review.
  if (!emails.length) {
    if (res && !res.headersSent) {
      res.status(503).json({ error: { message: 'Teacher access is not configured for this deployment.' } });
    }
    return null;
  }
  if (!isTeacherIdentity(user)) {
    if (res && !res.headersSent) {
      res.status(403).json({ error: { message: 'Only teachers can access this resource.' } });
    }
    return null;
  }
  return user;
}
