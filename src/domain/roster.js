import { K, load, loadObj, save, uid, dbReady, listVia, saveVia } from '../lib/workflow-core.js';
import { dbList, dbUpsert, dbRemove } from '../lib/supabase-db.js';
import { initSchedule, markSRMastered } from '../lib/spaced-repetition.js';

/* ─── PROGRESS ───────────────────────────────────────────────── */
export async function getProgress(studentId) {
  const obj = loadObj(K.progress);
  return obj[studentId] || null;
}
export async function saveProgress(studentId, data) {
  const obj = loadObj(K.progress);
  obj[studentId] = { ...obj[studentId], ...data, updatedAt: new Date().toISOString() };
  save(K.progress, obj);
}

export async function getStudentGoal(studentId) {
  const progress = await getProgress(studentId);
  return progress?.goal || null;
}
export async function saveStudentGoal(studentId, goal) {
  return saveProgress(studentId, { goal });
}

/* ─── REPORTS ────────────────────────────────────────────────── */
export async function getReports(studentId) {
  return listVia('reports', K.reports, studentId ? (r => r.studentId === studentId) : null);
}
export async function saveReport(data) {
  return saveVia('reports', K.reports, data, { studentId: null, diagnosisIds: data?.diagnosisIds || [], feedbackIds: data?.feedbackIds || [], homeworkIds: data?.homeworkIds || [], content: data?.content || data?.report || null });
}

/* ─── STUDENT CRUD ───────────────────────────────────────────── */
export async function getStudents() {
  return listVia('studentsCrud', K.studentsCrud, null);
}
export async function getStudent(id) {
  return (await getStudents()).find(s => s.id === id) || null;
}
function withoutRosterPassword(student) {
  if (!student || !Object.prototype.hasOwnProperty.call(student, 'password')) return student;
  const { password, ...safeStudent } = student;
  return safeStudent;
}
export async function saveStudent(data) {
  const all = load(K.studentsCrud);
  const now = new Date().toISOString();
  const existing = all.findIndex(s => s.id === data.id);
  const record = { id: data.id || uid(), name: data.name || '', firstName: data.firstName || (typeof data.name === 'string' ? data.name.split(' ')[0] : '') || '', email: data.email || '', currentLevel: data.currentLevel || data.band || 'B1', targetLevel: data.targetLevel || data.bandTarget || 'B2', examGoal: data.examGoal || data.goal || 'Pass MET B2', professionalContext: data.professionalContext || '', notes: data.notes || '', activeTargetProfileId: data.activeTargetProfileId || null, cohort: data.cohort || '', band: data.currentLevel || data.band || 'B1', bandTarget: data.targetLevel || data.bandTarget || 'B2', goal: data.examGoal || data.goal || 'Pass MET B2', session: data.session || 1, totalSessions: data.totalSessions || 24, track: data.track || 'MET', timezone: data.timezone || 'America/Sao_Paulo', createdAt: data.createdAt || now, updatedAt: now };
  if (dbReady('studentsCrud')) { try { const saved = await dbUpsert('studentsCrud', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveStudent via Supabase failed, using localStorage:', e.message); } }
  if (existing >= 0) all[existing] = { ...withoutRosterPassword(all[existing]), ...record };
  else all.unshift(record);
  save(K.studentsCrud, all);
  return record;
}
export async function deleteStudent(id) {
  if (dbReady('studentsCrud')) {
    try {
      const scoped = ['reviews', 'submissions', 'homework', 'diagnoses', 'reports', 'progressNotes', 'vocabularyBank', 'practiceSubmissions', 'practiceAssignments', 'classEvidence', 'classEvents', 'targetProfiles'];
      for (const entity of scoped) { try { const rows = (await dbList(entity)) || []; for (const r of rows.filter(r => r.studentId === id)) await dbRemove(entity, r.id); } catch { /* ignore */ } }
      await dbRemove('studentsCrud', id);
      return;
    } catch (e) { console.warn('[workflow] deleteStudent via Supabase failed, using localStorage:', e.message); }
  }
  save(K.studentsCrud, load(K.studentsCrud).filter(s => s.id !== id));
  const entities = [K.targetProfiles, K.classEvents, K.classEvidence, K.diagnoses, K.feedback, K.homework, K.submissions, K.reviews, K.reports, K.progressNotes, K.vocabularyBank, K.practiceAssignments, K.practiceSubmissions];
  for (const key of entities) save(key, load(key).filter(r => r.studentId !== id));
  save(K.inbox, load(K.inbox).filter(m => m.toStudentId !== id && m.fromStudentId !== id));
  const errorBank = loadObj(K.errorBankGlobal); delete errorBank[id]; save(K.errorBankGlobal, errorBank);
  const progress = loadObj(K.progress); delete progress[id]; save(K.progress, progress);
  const drafts = loadObj(K.drafts);
  Object.keys(drafts).forEach(key => { if (key.startsWith(`${id}:`)) delete drafts[key]; });
  save(K.drafts, drafts);
}
export async function seedStudentsIfEmpty(STUDENTS) {
  const existing = load(K.studentsCrud);
  if (existing.length > 0) {
    const patched = existing.map(withoutRosterPassword);
    const changed = patched.some((student, index) => student !== existing[index]);
    if (changed) save(K.studentsCrud, patched);
    const local = changed ? patched : existing;
    if (dbReady('studentsCrud')) { try { const sbStudents = await dbList('studentsCrud'); if (Array.isArray(sbStudents) && sbStudents.length === 0) { for (const s of local) await saveVia('studentsCrud', K.studentsCrud, s); } } catch { /* Supabase unavailable */ } }
    return local;
  }
  const seeded = STUDENTS.map(s => ({ id: s.id, name: s.name, firstName: s.firstName, email: s.email || '', currentLevel: s.band || s.currentBand || 'B1', targetLevel: s.bandTarget || s.targetBand || 'B2', examGoal: s.goal || 'Pass MET B2', professionalContext: '', notes: '', activeTargetProfileId: null, cohort: s.cohort || '', band: s.band || 'B1', bandTarget: s.bandTarget || 'B2', goal: s.goal || 'Pass MET B2', session: s.session || 1, totalSessions: s.totalSessions || 24, track: s.track || 'MET', timezone: s.timezone || 'America/Sao_Paulo', createdAt: s.createdAt || new Date().toISOString(), updatedAt: s.updatedAt || new Date().toISOString() }));
  save(K.studentsCrud, seeded);
  if (dbReady('studentsCrud')) { try { for (const s of seeded) await saveVia('studentsCrud', K.studentsCrud, s); } catch { /* ignore */ } }
  return seeded;
}

/* ─── COHORTS ──────────────────────────────────────────────────── */
export function getCohorts() {
  const students = load(K.studentsCrud);
  const map = {};
  for (const s of students) {
    const c = (s.cohort || '').trim();
    if (!c) { map[''] ??= { name: 'Unassigned', studentIds: [] }; map[''].studentIds.push(s.id); continue; }
    map[c] ??= { name: c, studentIds: [] };
    map[c].studentIds.push(s.id);
  }
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
}
export function getStudentCohorts(studentId) {
  const s = load(K.studentsCrud).find(st => st.id === studentId);
  return s?.cohort || '';
}
export async function setStudentCohort(studentId, cohort) {
  const all = load(K.studentsCrud);
  const idx = all.findIndex(s => s.id === studentId);
  if (idx < 0) return;
  all[idx].cohort = cohort;
  all[idx].updatedAt = new Date().toISOString();
  save(K.studentsCrud, all);
}
