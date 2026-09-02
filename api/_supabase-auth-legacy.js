import { verifySupabaseSession } from '../lib/auth/index.ts';

export async function verifySession(req) {
  const ctx = await verifySupabaseSession(req);
  if (!ctx) return null;
  return { id: ctx.userId, email: ctx.email, role: ctx.role };
}

export const verifySupabaseSession_legacy = verifySupabaseSession;
