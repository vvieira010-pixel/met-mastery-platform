/**
 * supabase-db.js — dual-mode persistence adapter.
 *
 * The app's data layer (workflow.js) keeps its existing record shapes: string
 * `id`s, camelCase fields. This module stores those records in Supabase when the
 * user has a live session, otherwise workflow.js falls back to localStorage.
 *
 * STRATEGY (mirrors exercise-library.js):
 *   - The full app record is stored in a `content jsonb` column (for tables that
 *     have one) or mapped onto typed columns (submissions, students, …).
 *   - Relational columns (teacher_id, student_id, homework_id, local_id) are
 *     populated to satisfy RLS + foreign keys and to let the teacher query by
 *     student. They are write-side obligations — on read we return the preserved
 *     `content`, so workflow.js's existing in-memory `.filter(s => s.studentId …)`
 *     keeps working unchanged.
 *   - Reads fetch all rows the RLS lets you see (teacher: their students' data;
 *     student: their own) and reconstruct app records. Data volumes are small
 *     (one teacher, a handful of students), so in-memory filtering is fine.
 *
 * Any network failure THROWS so the caller can fall back to localStorage.
 */
import {
  contentEntity, sbSelect, idFilter, resolveTeacherId, invalidateRefs, getRefs,
  sbFetch, sbDelete, sbInsert, sbUpdate, studentUuid,
} from './supabase-db/_helpers.js';
import {
  setSessionRole, getDbContext, dbEnabled, ensureProfile, claimStudentByEmail,
} from './supabase-db/auth.js';
import { studentsCrud } from './supabase-db/students.js';
import { homework } from './supabase-db/homework.js';
import { submissions } from './supabase-db/submissions.js';
import { reviews } from './supabase-db/reviews.js';
import { readStoredSupabaseSession, refreshSupabaseSession } from './supabase-storage.js';

export { setSessionRole, getDbContext, dbEnabled, ensureProfile, claimStudentByEmail };
export { sbSelect, invalidateRefs };

/* ─── entity registry ────────────────────────────────────────── */
const ENTITIES = {
  studentsCrud,
  diagnoses: {
    table: 'diagnoses', key: 'content',
    async toRow(record, ctx) {
      return { teacher_id: ctx.teacherId, student_id: await studentUuid(ctx, record.studentId), status: record.status || 'draft', cycle_stage: record.cycleStage || null, content: record };
    },
    fromRow(row) { return { ...(row.content || {}), id: row.content?.id || row.id }; },
  },
  homework,
  submissions,
  reviews,
  reports: contentEntity('reports'),
  practiceAssignments: contentEntity('practice_assignments'),
  practiceResources: contentEntity('practice_resources', { student: false }),
  practiceSubmissions: contentEntity('practice_submissions'),
  targetProfiles: {
    ...contentEntity('target_profiles'),
    async toRow(record, ctx) {
      return { teacher_id: ctx.teacherId, student_id: await studentUuid(ctx, record.studentId), is_active: Boolean(record.isActive), content: record };
    },
  },
  classEvents: {
    table: 'class_events', key: 'local_id',
    async toRow(record, ctx) {
      return { teacher_id: ctx.teacherId, student_id: await studentUuid(ctx, record.studentId), student_local_id: record.studentId || null, local_id: record.id, date: record.date || new Date().toISOString().slice(0, 10), status: record.status || 'scheduled', diagnostic_status: record.diagnosticStatus || null, homework_status: record.homeworkStatus || null, metadata: record };
    },
    fromRow(row) { return { ...(row.metadata || {}), id: row.local_id || row.id }; },
  },
  classEvidence: contentEntity('class_evidence'),
  vocabularyBank: contentEntity('vocabulary_entries'),
  progressNotes: contentEntity('progress_notes'),
  errorBank: contentEntity('error_bank_entries'),
  seedsStages: {
    ...contentEntity('seeds_stages'),
    async toRow(record, ctx) {
      return { teacher_id: ctx.teacherId, student_id: await studentUuid(ctx, record.studentId), stage: record.stage || '', note: record.note || '', started_at: record.startedAt || null, content: record };
    },
  },
  listeningExercises: contentEntity('listening_exercises', { student: false }),
  mockTestResults: contentEntity('mock_test_results'),
  payments: contentEntity('payment_records'),
  writingEvaluations: contentEntity('writing_evaluations'),
  assignments: contentEntity('assignments'),
};
export function dbHasEntity(key) { return Boolean(ENTITIES[key]); }

/* ─── public ops (used by workflow.js) ───────────────────────── */

export async function dbList(entityKey) {
  const ctx = getDbContext();
  const cfg = ENTITIES[entityKey];
  if (!ctx || !cfg) return null;
  const refs = await getRefs(ctx);
  const rows = await sbSelect(ctx, cfg.table, 'select=*&order=created_at.desc');
  return rows.map(r => cfg.fromRow(r, refs));
}

export async function dbGet(entityKey, appId) {
  const ctx = getDbContext();
  const cfg = ENTITIES[entityKey];
  if (!ctx || !cfg || !appId) return null;
  const refs = await getRefs(ctx);
  const rows = await sbSelect(ctx, cfg.table, `${idFilter(cfg, appId)}&limit=1`);
  return rows.length ? cfg.fromRow(rows[0], refs) : null;
}

export async function dbUpsert(entityKey, record) {
  const baseCtx = getDbContext();
  const cfg = ENTITIES[entityKey];
  if (!baseCtx || !cfg) return null;
  const ctx = { ...baseCtx, teacherId: await resolveTeacherId(baseCtx) };
  const row = await cfg.toRow(record, ctx);
  let saved;
  if (cfg.uuidAsId && record.id && /^[0-9a-f-]{36}$/i.test(record.id)) {
    saved = await sbUpdate(ctx, cfg.table, `id=eq.${record.id}`, row);
    if (!saved) saved = await sbInsert(ctx, cfg.table, row);
  } else if (cfg.uuidAsId) {
    saved = await sbInsert(ctx, cfg.table, row);
  } else {
    const existing = await sbSelect(ctx, cfg.table, `${idFilter(cfg, record.id)}&select=id&limit=1`);
    if (existing.length) saved = await sbUpdate(ctx, cfg.table, idFilter(cfg, record.id), row);
    else saved = await sbInsert(ctx, cfg.table, row);
  }
  if (cfg.refEntity) invalidateRefs();
  const refs = await getRefs(ctx);
  return cfg.fromRow(saved, refs);
}

export async function dbRemove(entityKey, appId) {
  const ctx = getDbContext();
  const cfg = ENTITIES[entityKey];
  if (!ctx || !cfg) return false;
  await sbDelete(ctx, cfg.table, idFilter(cfg, appId));
  if (cfg.refEntity) invalidateRefs();
  return true;
}

/* ─── Realtime subscriptions ────────────────────────────────── */

export function subscribeToTable(table, onChange, { event, filter } = {}) {
  const ctx = getDbContext();
  if (!ctx) return () => {};
  const channelName = `${table}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const subUrl = `${ctx.url}/realtime/v1/websocket?apikey=${ctx.anonKey}&token=${ctx.token}`;
  let ws = null;
  let closed = false;
  function connect() {
    if (closed) return;
    try { ws = new WebSocket(subUrl); } catch { return; }
    ws.onopen = () => {
      ws.send(JSON.stringify({ topic: `realtime:${table}`, event: 'phx_join', payload: { config: { broadcast: { self: false } } }, ref: '1' }));
    };
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        if (data.event === 'postgres_changes' && data.payload) {
          const change = data.payload;
          if (!event || change.type === event) {
            onChange({ eventType: change.type, new: change.record || change.new, old: change.old_record || change.old });
          }
        }
      } catch {}
    };
    ws.onclose = () => { if (!closed) setTimeout(connect, 5000); };
    ws.onerror = () => { ws?.close(); };
  }
  connect();
  return () => { closed = true; ws?.close(); };
}

/* ─── Storage (student speaking audio) ───────────────────────── */

const AUDIO_BUCKET = 'submission-audio';
const MOCK_AUDIO_BUCKET = 'mock-test-audio';

export async function uploadSubmissionAudio(blob, path) {
  const ctx = getDbContext();
  if (!ctx) throw new Error('Not signed in.');
  const res = await fetch(`${ctx.url}/storage/v1/object/${AUDIO_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': blob.type || 'audio/webm' },
    body: blob,
  });
  if (!res.ok) throw new Error(`audio upload → ${res.status} ${await res.text().catch(() => '')}`);
  return path;
}

export async function createSignedAudioUrl(path, expiresIn = 3600) {
  const ctx = getDbContext();
  if (!ctx || !path) return null;
  try {
    const res = await fetch(`${ctx.url}/storage/v1/object/sign/${AUDIO_BUCKET}/${path}`, {
      method: 'POST',
      headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn }),
    });
    if (!res.ok) return null;
    const { signedURL } = await res.json();
    return signedURL ? `${ctx.url}/storage/v1${signedURL}` : null;
  } catch { return null; }
}

export async function uploadMockTestAudio(blob, path) {
  const ctx = getDbContext();
  if (!ctx) throw new Error('Not signed in.');
  const res = await fetch(`${ctx.url}/storage/v1/object/${MOCK_AUDIO_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': blob.type || 'audio/webm' },
    body: blob,
  });
  if (!res.ok) throw new Error(`mock audio upload → ${res.status} ${await res.text().catch(() => '')}`);
  return path;
}

export async function getMockTestAudioUrl(path, expiresIn = 86400) {
  return createSignedAudioUrlFromBucket(MOCK_AUDIO_BUCKET, path, expiresIn);
}

async function createSignedAudioUrlFromBucket(bucket, path, expiresIn = 3600) {
  const ctx = getDbContext();
  if (!ctx || !path) return null;
  try {
    const res = await fetch(`${ctx.url}/storage/v1/object/sign/${bucket}/${path}`, {
      method: 'POST',
      headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresIn }),
    });
    if (!res.ok) return null;
    const { signedURL } = await res.json();
    return signedURL ? `${ctx.url}/storage/v1${signedURL}` : null;
  } catch { return null; }
}

/* ─── Storage (exercise images) ──────────────────────────────── */

const IMAGE_BUCKET = 'exercise-images';

export async function uploadExerciseImage(file, path) {
  const stored = readStoredSupabaseSession();
  if (stored && stored.expires_at && stored.expires_at - 300 <= Math.floor(Date.now() / 1000)) {
    await refreshSupabaseSession();
  }
  const ctx = getDbContext();
  if (!ctx) throw new Error('Not signed in.');
  const res = await fetch(`${ctx.url}/storage/v1/object/${IMAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': file.type || 'image/png', 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(`image upload → ${res.status} ${await res.text().catch(() => '')}`);
  return `${ctx.url}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

/* ─── teacher settings ───────────────────────────────────────── */

export async function getTeacherSetting(key) {
  const ctx = getDbContext();
  if (!ctx) return null;
  try {
    const teacherId = await resolveTeacherId(ctx);
    if (!teacherId) return null;
    const rows = await sbSelect(ctx, 'teacher_settings', `teacher_id=eq.${teacherId}&key=eq.${encodeURIComponent(key)}&select=value&limit=1`);
    return rows[0]?.value ?? null;
  } catch (e) {
    console.warn('[supabase-db] getTeacherSetting failed:', e.message);
    return null;
  }
}

export async function setTeacherSetting(key, value) {
  const baseCtx = getDbContext();
  if (!baseCtx) return false;
  try {
    const ctx = { ...baseCtx, teacherId: await resolveTeacherId(baseCtx) };
    if (!ctx.teacherId) return false;
    if (value === null || value === undefined) {
      await sbDelete(ctx, 'teacher_settings', `teacher_id=eq.${ctx.teacherId}&key=eq.${encodeURIComponent(key)}`);
    } else {
      await sbFetch(ctx, 'teacher_settings', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ teacher_id: ctx.teacherId, key, value: String(value) }),
      });
    }
    return true;
  } catch (e) {
    console.warn('[supabase-db] setTeacherSetting failed:', e.message);
    return false;
  }
}

/* ─── review schedule (spaced-repetition persistence) ───────── */

export async function upsertReviewSchedule(localStudentId, list) {
  const ctx = getDbContext();
  if (!ctx || !list?.length) return;
  const sid = await studentUuid(ctx, localStudentId);
  if (!sid) return;
  const rows = list.map(e => ({
    student_id: sid, error_id: e.errorId, error_text: e.errorText || '', correct_text: e.correctText || '',
    interval_days: e.interval || 1, last_seen: e.lastSeen || null, next_due: e.nextDue || null,
    source_diagnosis_id: e.sourceDiagnosisId || null, practice_count: e.practiceCount || 0, mastered: Boolean(e.mastered),
  }));
  await sbFetch(ctx, 'review_schedule?on_conflict=student_id,error_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
}

export async function loadReviewSchedule(localStudentId) {
  const ctx = getDbContext();
  if (!ctx) return [];
  try {
    const sid = await studentUuid(ctx, localStudentId);
    if (!sid) return [];
    const rows = await sbSelect(ctx, 'review_schedule', `student_id=eq.${sid}&select=*&order=created_at.asc`);
    return rows.map(r => ({
      id: r.id, studentId: localStudentId, errorId: r.error_id, errorText: r.error_text || '',
      correctText: r.correct_text || '', interval: r.interval_days || 1, lastSeen: r.last_seen || null,
      nextDue: r.next_due || null, sourceDiagnosisId: r.source_diagnosis_id || null,
      practiceCount: r.practice_count || 0, mastered: Boolean(r.mastered),
    }));
  } catch (e) {
    console.warn('[supabase-db] loadReviewSchedule:', e.message);
    return [];
  }
}

/* ─── Storage: teacher resources (public bucket) ────────────── */

const RESOURCE_BUCKET = 'teacher-resources';

export async function uploadTeacherResource(file, folder = 'images') {
  const stored = readStoredSupabaseSession();
  if (stored && stored.expires_at && stored.expires_at - 300 <= Math.floor(Date.now() / 1000)) {
    await refreshSupabaseSession();
  }
  const ctx = getDbContext();
  if (!ctx) throw new Error('Not signed in.');
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const res = await fetch(`${ctx.url}/storage/v1/object/${RESOURCE_BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
    body: file,
  });
  if (!res.ok) throw new Error(`upload → ${res.status} ${await res.text().catch(() => '')}`);
  return `${ctx.url}/storage/v1/object/public/${RESOURCE_BUCKET}/${path}`;
}

export async function listTeacherResources(folder = 'images') {
  const ctx = getDbContext();
  if (!ctx) return null;
  try {
    const res = await fetch(`${ctx.url}/storage/v1/object/list/${RESOURCE_BUCKET}`, {
      method: 'POST',
      headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: `${folder}/`, sortBy: { column: 'created_at', order: 'desc' } }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function deleteTeacherResource(path) {
  const ctx = getDbContext();
  if (!ctx) throw new Error('Not signed in.');
  const res = await fetch(`${ctx.url}/storage/v1/object/${RESOURCE_BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { apikey: ctx.anonKey, Authorization: `Bearer ${ctx.token}` },
  });
  if (!res.ok) throw new Error(`delete → ${res.status}`);
}

/* ─── Listening Exercises ──────────────────────────────────── */

export async function addListeningExercise(exercise) {
  return dbUpsert('listeningExercises', { id: exercise.id || crypto.randomUUID(), ...exercise, createdAt: new Date().toISOString() });
}

export async function getListeningExercises() {
  return dbList('listeningExercises');
}

/* ─── Student Settings (key-value per student) ───────────── */

export async function getStudentSetting(studentLocalId, key) {
  const ctx = getDbContext();
  if (!ctx) return null;
  try {
    const sid = await studentUuid(ctx, studentLocalId);
    if (!sid) return null;
    const rows = await sbSelect(ctx, 'student_settings', `student_id=eq.${sid}&key=eq.${encodeURIComponent(key)}&select=value&limit=1`);
    return rows[0]?.value ?? null;
  } catch (e) {
    console.warn('[supabase-db] getStudentSetting:', e.message);
    return null;
  }
}

export async function setStudentSetting(studentLocalId, key, value) {
  const ctx = getDbContext();
  if (!ctx) return false;
  try {
    const sid = await studentUuid(ctx, studentLocalId);
    if (!sid) return false;
    await sbFetch(ctx, 'student_settings', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ student_id: sid, key, value }),
    });
    return true;
  } catch (e) {
    console.warn('[supabase-db] setStudentSetting:', e.message);
    return false;
  }
}

export async function getAllStudentSettings(studentLocalId) {
  const ctx = getDbContext();
  if (!ctx) return {};
  try {
    const sid = await studentUuid(ctx, studentLocalId);
    if (!sid) return {};
    const rows = await sbSelect(ctx, 'student_settings', `student_id=eq.${sid}&select=key,value`);
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  } catch (e) {
    console.warn('[supabase-db] getAllStudentSettings:', e.message);
    return {};
  }
}
