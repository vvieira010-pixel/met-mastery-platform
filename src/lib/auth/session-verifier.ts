import type { AuthContext, AuthRequestLike, AuthUser } from './types.ts';
import { buildContext } from './types.ts';
import { getServiceKey, getSupabaseUrl } from '../../../api/_config.js';

function getAuthConfig() {
  return {
    supabaseUrl: getSupabaseUrl(),
    serviceKey: getServiceKey(),
  };
}

export async function verifySupabaseSession(req: AuthRequestLike): Promise<AuthContext | null> {
  const auth = req.headers['authorization'] || '';
  const token = typeof auth === 'string' ? auth.replace(/^Bearer\s+/i, '').trim() : '';
  if (!token) return null;
  const { supabaseUrl, serviceKey } = getAuthConfig();
  if (!supabaseUrl || !serviceKey) return null;
  try {
    const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const user = (await r.json()) as AuthUser | null;
    if (!user || !user.id || user.role === 'anon') return null;
    return buildContext(user);
  } catch {
    return null;
  }
}

export function isConfigured(): boolean {
  const { supabaseUrl, serviceKey } = getAuthConfig();
  return Boolean(supabaseUrl && serviceKey);
}
