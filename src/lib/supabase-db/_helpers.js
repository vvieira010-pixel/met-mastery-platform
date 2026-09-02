import { buildSupabaseHeaders } from '../supabase-storage.js';

const cache = new Map();
const CACHE_TTL = 30000;

function invalidateCache(table) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${table}:`)) {
      cache.delete(key);
    }
  }
}

export async function sbFetch(ctx, path, init = {}) {
  const res = await fetch(`${ctx.url}/rest/v1/${path}`, {
    ...init,
    headers: buildSupabaseHeaders(ctx.anonKey, ctx.token, init.headers),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${init.method || 'GET'} ${path} → ${res.status} ${body}`);
  }
  return res;
}

export async function sbSelect(ctx, table, query = '') {
  const cacheKey = `${table}:${query}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const res = await sbFetch(ctx, `${table}${query ? `?${query}` : ''}`);
  const data = await res.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function sbInsert(ctx, table, row) {
  const res = await sbFetch(ctx, table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  invalidateCache(table);
  return (await res.json())[0];
}

export async function sbUpdate(ctx, table, filter, patch) {
  const res = await sbFetch(ctx, `${table}?${filter}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });
  invalidateCache(table);
  return (await res.json())[0] || null;
}

export async function sbDelete(ctx, table, filter) {
  await sbFetch(ctx, `${table}?${filter}`, { method: 'DELETE' });
  invalidateCache(table);
}

let refsCache = null;

async function loadRefs(ctx) {
  const [students, homework] = await Promise.all([
    sbSelect(ctx, 'students', 'select=id,local_id'),
    sbSelect(ctx, 'homework', 'select=id,local_id'),
  ]);
  const r = {
    studentByLocal: new Map(), studentByUuid: new Map(),
    hwByLocal: new Map(), hwByUuid: new Map(),
  };
  for (const s of students) {
    if (s.local_id) r.studentByLocal.set(s.local_id, s.id);
    r.studentByUuid.set(s.id, s.local_id || s.id);
  }
  for (const h of homework) {
    if (h.local_id) r.hwByLocal.set(h.local_id, h.id);
    r.hwByUuid.set(h.id, h.local_id || h.id);
  }
  refsCache = r;
  return r;
}

export async function getRefs(ctx, force = false) {
  if (!refsCache || force) await loadRefs(ctx);
  return refsCache;
}

export function invalidateRefs() { refsCache = null; teacherIdCache = null; }

let teacherIdCache = null;

export async function resolveTeacherId(ctx) {
  if (teacherIdCache && teacherIdCache.authUid === ctx.authUid) return teacherIdCache.teacherId;
  try {
    const rows = await sbSelect(ctx, 'students', `auth_user_id=eq.${ctx.authUid}&select=teacher_id&limit=1`);
    if (rows.length && rows[0].teacher_id) {
      teacherIdCache = { authUid: ctx.authUid, teacherId: rows[0].teacher_id };
      return rows[0].teacher_id;
    }
  } catch {}
  teacherIdCache = { authUid: ctx.authUid, teacherId: ctx.authUid };
  return ctx.authUid;
}

export async function studentUuid(ctx, localId) {
  if (!localId) return null;
  let refs = await getRefs(ctx);
  if (refs.studentByLocal.has(localId)) return refs.studentByLocal.get(localId);
  refs = await getRefs(ctx, true);
  return refs.studentByLocal.get(localId) || null;
}

export async function homeworkUuid(ctx, localId) {
  if (!localId) return null;
  let refs = await getRefs(ctx);
  if (refs.hwByLocal.has(localId)) return refs.hwByLocal.get(localId);
  refs = await getRefs(ctx, true);
  return refs.hwByLocal.get(localId) || null;
}

export function studentLocal(refs, uuid) { return uuid ? (refs.studentByUuid.get(uuid) || uuid) : null; }
export function homeworkLocal(refs, uuid) { return uuid ? (refs.hwByUuid.get(uuid) || uuid) : null; }

export function idFilter(cfg, appId) {
  if (cfg.key === 'local_id') return `local_id=eq.${encodeURIComponent(appId)}`;
  if (cfg.key === 'uuid') return `id=eq.${encodeURIComponent(appId)}`;
  return `content->>id=eq.${encodeURIComponent(appId)}`;
}

export function contentEntity(table, { student = true, extra } = {}) {
  return {
    table,
    key: 'content',
    refEntity: false,
    async toRow(record, ctx) {
      const row = { teacher_id: ctx.teacherId, content: record };
      if (student && record.studentId) row.student_id = await studentUuid(ctx, record.studentId);
      if (extra) Object.assign(row, extra(record));
      return row;
    },
    fromRow(row) { return { ...(row.content || {}), id: row.content?.id || row.id }; },
  };
}
