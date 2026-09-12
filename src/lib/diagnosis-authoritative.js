import { K, dbReady, load, save, uid } from './workflow-core.js';
import { dbUpsert } from './supabase-db.js';

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

  const now = new Date().toISOString();
  const id = data?.id || uid();
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

  // Cache only the confirmed cloud record for offline reads. This is not a
  // fallback path and never changes a failed cloud write into a success.
  const cached = load(K.diagnoses);
  const index = cached.findIndex(item => item?.id === savedRecord.id);
  if (index >= 0) cached[index] = { ...cached[index], ...savedRecord };
  else cached.unshift(savedRecord);
  save(K.diagnoses, cached);

  return savedRecord;
}
