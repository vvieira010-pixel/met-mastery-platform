/**
 * api/_supabase-auth.js — Supabase session verification for serverless routes.
 *
 * Keep this verifier self-contained and JavaScript-only. Vercel bundles files
 * in api/ as independent serverless functions; importing the application's
 * TypeScript auth entrypoint here leaves the .ts file out of the function
 * bundle and causes ERR_MODULE_NOT_FOUND at runtime.
 */
import { getServiceKey, getSupabaseUrl } from './_config.js';

/**
 * Verify the caller's Supabase access token.
 * @returns {Promise<object|null>} the Supabase user object (id, email, role), or null if invalid.
 */
export async function verifySupabaseSession(req) {
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
