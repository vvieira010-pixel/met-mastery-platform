/**
 * api/_supabase-auth.js — Supabase session verification for serverless routes.
 * 
 * Now delegates to the new auth module in src/lib/auth/index.ts.
 * Maintains backward compatibility by returning the same shape as before:
 *   { id: string, email: string, role: string } | null
 */

import { verifySupabaseSession as verifySessionNew } from '../src/lib/auth/index.ts';

/**
 * Verify the caller's Supabase access token.
 * @returns {Promise<object|null>} the Supabase user object (id, email, role), or null if invalid.
 */
export async function verifySupabaseSession(req) {
  const ctx = await verifySessionNew(req);
  if (!ctx) return null;
  return { id: ctx.userId, email: ctx.email, role: ctx.role };
}