import { K, load, loadObj, save, dbReady } from '../lib/workflow-core.js';
import { dbUpsert, dbList, getDbContext } from '../lib/supabase-db.js';
import { getDiagnoses, getFeedback, getHomework, getSubmissions, getReviews } from '../lib/workflow-academic.js';
import { getPracticeAssignments, getPracticeSubmissions } from './practice.js';
import { getTargetProfiles, getClassEvents, getClassEvidence, getVocabularyBank, getProgressNotes } from './academic-records.js';
import { getReports } from './roster.js';
import { listVia, removeVia } from '../lib/workflow-core.js';

/* ─── ONE-TIME LOCAL → CLOUD IMPORT ──────────────────────────── */
export async function syncLocalToCloud() {
  if (!getDbContext()) throw new Error('Sign in with Supabase first to sync to the cloud.');
  const order = ['studentsCrud', 'diagnoses', 'targetProfiles', 'classEvents', 'classEvidence', 'vocabularyBank', 'progressNotes', 'reports', 'practiceResources', 'practiceAssignments', 'practiceSubmissions', 'homework', 'submissions', 'reviews'];
  const synced = new Set(loadObj('vv:syncedIds').ids || []);
  const counts = {};
  for (const entity of order) {
    if (!dbReady(entity)) continue;
    const list = load(K[entity]);
    let n = 0;
    for (const rec of list) {
      if (!rec || !rec.id) continue;
      const tag = `${entity}:${rec.id}`;
      if (synced.has(tag)) continue;
      try { await dbUpsert(entity, rec); synced.add(tag); n++; } catch (e) { console.warn(`[sync] ${tag} failed:`, e.message); }
    }
    counts[entity] = n;
  }
  if (dbReady('errorBank')) {
    const obj = loadObj(K.errorBankGlobal);
    let n = 0;
    for (const [sid, entries] of Object.entries(obj)) {
      for (const entry of (entries || [])) {
        if (!entry?.id) continue;
        const tag = `errorBank:${entry.id}`;
        if (synced.has(tag)) continue;
        try { await dbUpsert('errorBank', { ...entry, studentId: entry.studentId || sid }); synced.add(tag); n++; } catch (e) { console.warn(`[sync] ${tag} failed:`, e.message); }
      }
    }
    counts.errorBank = n;
  }
  save('vv:syncedIds', { ids: [...synced] });
  return counts;
}

/* ─── EXPORT STUDENT DATA ────────────────────────────────────── */
export async function exportStudentData(studentId) {
  if (!studentId) throw new Error('studentId is required for export.');
  const studentScopedEntities = [
    { key: K.diagnoses, label: 'diagnoses', fn: getDiagnoses },
    { key: K.feedback, label: 'feedback', fn: getFeedback },
    { key: K.homework, label: 'homework', fn: getHomework },
    { key: K.practiceAssignments, label: 'practiceAssignments', fn: getPracticeAssignments },
    { key: K.practiceSubmissions, label: 'practiceSubmissions', fn: getPracticeSubmissions },
    { key: K.reports, label: 'reports', fn: getReports },
    { key: K.submissions, label: 'submissions', fn: getSubmissions },
    { key: K.reviews, label: 'reviews', fn: getReviews },
    { key: K.vocabularyBank, label: 'vocabularyBank', fn: getVocabularyBank },
    { key: K.progressNotes, label: 'progressNotes', fn: getProgressNotes },
  ];
  const exportPackage = { exportDate: new Date().toISOString(), studentId, data: {} };
  for (const entity of studentScopedEntities) {
    const items = await entity.fn(studentId);
    exportPackage.data[entity.label] = items;
  }
  const errorBankObj = loadObj(K.errorBankGlobal);
  exportPackage.data.errorBank = errorBankObj[studentId] || [];
  const profiles = await getTargetProfiles(studentId);
  exportPackage.data.targetProfiles = profiles;
  const allEvidence = await listVia('classEvidence', K.classEvidence, null);
  const studentClassEvents = await getClassEvents(studentId);
  const studentEventIds = new Set(studentClassEvents.map(e => e.id));
  exportPackage.data.classEvidence = allEvidence.filter(ev => studentEventIds.has(ev.classEventId));
  return exportPackage;
}
