import { K, dbReady, load, save, uid } from './workflow-core.js';
import { dbUpsert } from './supabase-db.js';
import { hasUsefulDiagnosis } from '../domain/assessment/diagnosis-utils.js';

const DIAGNOSIS_DEFAULTS = {
  studentId: null,
  sessionId: null,
  strengths: [],
  weaknesses: [],
  grammarIssues: [],
  vocabularyIssues: [],
  skillIssues: [],
  metConnections: [],
  nextSteps: [],
  content: null,
  isBaseline: false,
  interventionNote: '',
  inquiryHypothesis: '',
  approvedBy: null,
  approvedAt: null,
};

// Keep an attempted diagnosis ID stable across a transient cloud failure. If
// Supabase commits but the response is lost, retrying the same diagnosis will
// update the committed row instead of inserting a duplicate record.
const pendingDiagnosisIds = new Map();

function pendingDiagnosisKey(data) {
  const aiSummary = typeof data?.aiRaw?.classSummary === 'string' ? data.aiRaw.classSummary.trim() : '';
  return [
    data?.studentId || '',
    data?.classEventId || '',
    data?.sessionId || '',
    data?.targetProfileId || '',
    aiSummary,
  ].join('|');
}

/**
 * Save a diagnosis only when Supabase confirms the write.
 *
 * Diagnose is an authoritative academic record. Unlike the app's generic
 * dual-mode workflow helpers, this path must never turn a cloud failure into a
 * local-only "success". A local cache is updated only after Supabase succeeds.
 */
export async function saveDiagnosisAuthoritative(data) {
  if (!dbReady('diagnoses')) {
    throw new Error('Cloud diagnosis storage is unavailable. Reconnect Supabase and retry; this diagnosis was not saved.');
  }
  if (!Array.isArray(data?.completedPhases) || !data.completedPhases.includes('analysis')) {
    throw new Error('Create and save a valid AI diagnosis before saving or approving this draft.');
  }
  if (!hasUsefulDiagnosis(data?.aiRaw)) {
    throw new Error('The AI diagnosis is incomplete. Recreate the AI diagnosis before saving or approving this draft.');
  }

  const now = new Date().toISOString();
  const pendingKey = pendingDiagnosisKey(data);
  const id = data?.id || pendingDiagnosisIds.get(pendingKey) || uid();
  if (!data?.id) pendingDiagnosisIds.set(pendingKey, id);
  const record = {
    ...DIAGNOSIS_DEFAULTS,
    ...data,
    id,
    createdAt: data?.createdAt || now,
    updatedAt: now,
  };

  let savedRecord;
  try {
    savedRecord = await dbUpsert('diagnoses', record);
  } catch (error) {
    throw new Error(`Cloud diagnosis save failed: ${error?.message || 'unknown Supabase error'}`, { cause: error });
  }

  if (!savedRecord?.id) {
    throw new Error('Cloud diagnosis save was not confirmed by Supabase. Retry before continuing.');
  }

  pendingDiagnosisIds.delete(pendingKey);

  // Cache only the confirmed cloud record for offline reads. This is not a
  // fallback path and never changes a failed cloud write into a success.
  const cached = load(K.diagnoses);
  const index = cached.findIndex(item => item?.id === savedRecord.id);
  if (index >= 0) cached[index] = { ...cached[index], ...savedRecord };
  else cached.unshift(savedRecord);
  save(K.diagnoses, cached);

  return savedRecord;
}
