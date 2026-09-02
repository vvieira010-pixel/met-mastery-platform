import {
  getSupabaseConfig,
  readStoredSupabaseSession,
  parseJwtClaims,
} from '../supabase-storage.js';
import { sbFetch, sbSelect, invalidateRefs } from './_helpers.js';

const ROLE_KEY = 'vv:db_role';

export function setSessionRole(role) {
  try {
    if (role) localStorage.setItem(ROLE_KEY, role);
    else localStorage.removeItem(ROLE_KEY);
  } catch { /* ignore */ }
}

export function getDbContext() {
  const cfg = getSupabaseConfig();
  if (!cfg.isConfigured) return null;
  const session = readStoredSupabaseSession();
  if (!session?.access_token) return null;
  const claims = parseJwtClaims(session.access_token) || {};
  const authUid = session.user?.id || claims.sub || null;
  if (!authUid) return null;
  let role = 'teacher';
  try { role = localStorage.getItem(ROLE_KEY) || 'teacher'; } catch {}
  return { url: cfg.url, anonKey: cfg.anonKey, token: session.access_token, authUid, role };
}

export function dbEnabled() {
  return Boolean(getDbContext());
}

export async function ensureProfile(role, { displayName, studentUuid } = {}) {
  const ctx = getDbContext();
  if (!ctx) return;
  const row = { id: ctx.authUid, role };
  if (displayName) row.display_name = displayName;
  if (studentUuid) row.student_id = studentUuid;
  try {
    await sbFetch(ctx, 'profiles', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.warn('[supabase-db] ensureProfile failed:', e.message);
  }
}

export async function claimStudentByEmail(email) {
  const ctx = getDbContext();
  if (!ctx) return null;
  try {
    const res = await sbFetch(ctx, 'rpc/claim_student_by_email', { method: 'POST', body: '{}' });
    const rows = await res.json();
    invalidateRefs();
    if (Array.isArray(rows) && rows[0]) return rows[0];
  } catch (e) {
    console.warn('[supabase-db] claimStudentByEmail RPC failed:', e.message);
  }
  try {
    const mine = await sbSelect(ctx, 'students', `auth_user_id=eq.${ctx.authUid}&select=id,local_id&limit=1`);
    invalidateRefs();
    return mine[0] || null;
  } catch (e) {
    console.warn('[supabase-db] claimStudentByEmail select failed:', e.message);
    return null;
  }
}
