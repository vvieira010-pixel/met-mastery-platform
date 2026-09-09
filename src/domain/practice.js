import { K, load, loadObj, save, uid, dbReady, listVia, saveVia, removeVia } from '../lib/workflow-core.js';
import { dbList, dbUpsert } from '../lib/supabase-db.js';
import { initSchedule, markSRMastered } from '../lib/spaced-repetition.js';
import { getDiagnoses } from '../lib/workflow-academic.js';

/* ─── PRACTICE ASSIGNMENTS ───────────────────────────────────── */
export async function getPracticeAssignments(studentId) {
  return listVia('practiceAssignments', K.practiceAssignments, studentId ? (p => p.studentId === studentId) : null);
}
export async function savePracticeAssignment(data) {
  return saveVia('practiceAssignments', K.practiceAssignments, data, { studentId: null, diagnosisId: null, resourceIds: data?.resourceIds || [], skillFocus: data?.skillFocus || data?.type || '', status: 'assigned' });
}
export async function deletePracticeAssignment(id) {
  return removeVia('practiceAssignments', K.practiceAssignments, id);
}

/* ─── PRACTICE RESOURCES ─────────────────────────────────────── */
export async function getPracticeResources(filters = {}) {
  const all = await listVia('practiceResources', K.practiceResources, null);
  if (!filters || Object.keys(filters).length === 0) return all;
  return all.filter(r => {
    if (filters.skill && r.skill !== filters.skill) return false;
    if (filters.level && r.level !== filters.level) return false;
    if (filters.met_task_type && r.met_task_type !== filters.met_task_type) return false;
    if (filters.topic && !String(r.topic || '').toLowerCase().includes(String(filters.topic).toLowerCase())) return false;
    if (filters.grammar_focus && r.grammar_focus !== filters.grammar_focus) return false;
    if (filters.vocabulary_focus && r.vocabulary_focus !== filters.vocabulary_focus) return false;
    if (filters.source && r.source !== filters.source) return false;
    if (filters.search) { const q = String(filters.search).toLowerCase(); const hay = `${r.title} ${(r.tags || []).join(' ')} ${r.instructions || ''}`.toLowerCase(); if (!hay.includes(q)) return false; }
    return true;
  });
}
export async function savePracticeResource(data) {
  const record = { id: data?.id || uid(), title: data?.title || 'Untitled resource', skill: data?.skill || 'mixed', level: data?.level || 'B1-B2', met_task_type: data?.met_task_type || '', topic: data?.topic || '', grammar_focus: data?.grammar_focus || '', vocabulary_focus: data?.vocabulary_focus || '', instructions: data?.instructions || '', content: data?.content || '', questions: Array.isArray(data?.questions) ? data.questions : [], answer_key: data?.answer_key || '', teacher_notes: data?.teacher_notes || '', student_self_check: Array.isArray(data?.student_self_check) ? data.student_self_check : [], estimated_time: data?.estimated_time || '', tags: Array.isArray(data?.tags) ? data.tags : [], created_by: data?.created_by || 'teacher', source: data?.source || 'manual', createdAt: data?.createdAt || new Date().toISOString(), ...data };
  if (dbReady('practiceResources')) { try { const saved = await dbUpsert('practiceResources', record); if (saved) return saved; } catch (e) { console.warn('[workflow] savePracticeResource via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.practiceResources);
  const existing = all.findIndex(r => r.id === record.id);
  if (existing >= 0) all[existing] = { ...all[existing], ...record };
  else all.unshift(record);
  save(K.practiceResources, all);
  return record;
}
export async function deletePracticeResource(id) {
  return removeVia('practiceResources', K.practiceResources, id);
}

/* ─── PRACTICE SUBMISSIONS ───────────────────────────────────── */
export async function getPracticeSubmissions(query = {}) {
  const all = await listVia('practiceSubmissions', K.practiceSubmissions, null);
  if (typeof query === 'string') return all.filter(s => s.assignmentId === query || s.studentId === query);
  if (query.assignmentId) return all.filter(s => s.assignmentId === query.assignmentId);
  if (query.studentId) return all.filter(s => s.studentId === query.studentId);
  return all;
}
export async function savePracticeSubmission(data) {
  const existingForAssignment = await listVia('practiceSubmissions', K.practiceSubmissions, s => s.assignmentId === data.assignmentId);
  const record = { id: data?.id || uid(), assignmentId: data?.assignmentId || null, studentId: data?.studentId || null, attempt: data?.attempt || existingForAssignment.length + 1, answer: data?.answer || '', ai_feedback: data?.ai_feedback || null, teacher_feedback: data?.teacher_feedback || null, score: data?.score ?? null, xpAwarded: data?.xpAwarded || 0, errors_observed: Array.isArray(data?.errors_observed) ? data.errors_observed : [], strengths_observed: Array.isArray(data?.strengths_observed) ? data.strengths_observed : [], status: data?.status || 'submitted', submittedAt: data?.submittedAt || new Date().toISOString(), ...data };
  if (dbReady('practiceSubmissions')) { try { const saved = await dbUpsert('practiceSubmissions', record); if (saved) return saved; } catch (e) { console.warn('[workflow] savePracticeSubmission via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.practiceSubmissions);
  all.unshift(record);
  save(K.practiceSubmissions, all);
  return record;
}

export async function savePracticeSession(studentId, data) {
  const record = {
    id: uid(), studentId, type: 'free_practice',
    mode: data?.mode || null, topicId: data?.topicId || null, topicTitle: data?.topicTitle || null,
    score: data?.score ?? null,
    exerciseCount: data?.exerciseCount || 0, correctCount: data?.correctCount || 0,
    maxHintLevel: data?.maxHintLevel || 0, hintUsed: !!data?.hintUsed, quality: data?.quality || null,
    results: data?.results || null, submittedAt: new Date().toISOString(),
    confidenceBefore: data?.confidenceBefore ?? null,
    errorCategories: data?.errorCategories || null,
    status: data?.status || 'completed',
  };
  if (dbReady('practiceSubmissions')) {
    try { const saved = await dbUpsert('practiceSubmissions', record); if (saved) return saved; }
    catch (e) { console.warn('[workflow] savePracticeSession via Supabase failed, using localStorage:', e.message); }
  }
  const all = load(K.practiceSubmissions);
  all.unshift(record);
  save(K.practiceSubmissions, all);
  return record;
}

/* ─── PRACTICE STUDIO FINAL SUBMISSIONS ──────────────────────── */

/**
 * A student gets exactly one final submission for a Practice Studio topic.
 * The key deliberately excludes browser state and timestamps, so refreshing,
 * changing device, or reopening the topic cannot create another attempt.
 */
export function createPracticeStudioSessionKey({ mode, topicId, listeningPart, speakingQuestion }) {
  return [
    'practice-studio',
    String(mode || 'unknown'),
    String(listeningPart || 'all'),
    String(speakingQuestion || 'all'),
    String(topicId || 'all'),
  ].join(':');
}

/**
 * A Practice Studio question must be identifiable without browser state. The
 * exercise id is content-owned, so this key remains the same after a refresh
 * or on a different device. The index is only a safe fallback for legacy
 * content that has not yet been given an id.
 */
export function createPracticeStudioExerciseKey(selection, exercise, index = 0) {
  const sessionKey = createPracticeStudioSessionKey(selection);
  const exerciseId = exercise?.id || `position-${index + 1}`;
  return `${sessionKey}:exercise:${exerciseId}`;
}

function isFinalStudioSubmission(record, studentId, sessionKey) {
  return record?.type === 'practice_studio'
    && record?.studentId === studentId
    && record?.sessionKey === sessionKey
    && record?.status === 'submitted';
}

function isStudioExerciseSubmission(record, studentId, sessionKey) {
  return record?.type === 'practice_studio_exercise'
    && record?.studentId === studentId
    && record?.sessionKey === sessionKey
    && record?.status === 'submitted';
}

/**
 * Read only from Supabase. Practice Studio deliberately does not fall back to
 * localStorage here: a local-only "submitted" result would not reach the
 * teacher and would let the same student submit again on another device.
 */
export async function getPracticeStudioSubmission(studentId, sessionKey) {
  if (!studentId || !sessionKey) return null;
  if (!dbReady('practiceSubmissions')) {
    throw new Error('Sign in to Supabase before submitting Practice Studio work.');
  }
  const records = await dbList('practiceSubmissions', { fresh: true });
  return records.find(record => isFinalStudioSubmission(record, studentId, sessionKey)) || null;
}

/** Read all saved questions for one selected Practice Studio path. */
export async function getPracticeStudioExerciseSubmissions(studentId, selection) {
  if (!studentId) return [];
  if (!dbReady('practiceSubmissions')) {
    throw new Error('Sign in to Supabase before opening Practice Studio work.');
  }
  const prefix = `${createPracticeStudioSessionKey(selection)}:exercise:`;
  const records = await dbList('practiceSubmissions', { fresh: true });
  return records.filter(record => isStudioExerciseSubmission(record, studentId, record?.sessionKey)
    && String(record.sessionKey || '').startsWith(prefix));
}

/**
 * Save exactly one answer (or skip) for one question. The same database unique
 * index used for final attempts makes a second device or a duplicate click a
 * normal locked state instead of a second submission.
 */
export async function submitPracticeStudioExercise(studentId, data) {
  const sessionKey = data?.sessionKey;
  if (!studentId || !sessionKey) throw new Error('Missing Practice Studio question details.');

  const records = await getPracticeStudioExerciseSubmissions(studentId, data?.selection || {});
  const existing = records.find(record => record.sessionKey === sessionKey);
  if (existing) return { record: existing, alreadySubmitted: true };

  const record = {
    id: uid(),
    type: 'practice_studio_exercise',
    studentId,
    sessionKey,
    mode: data?.mode || null,
    topicId: data?.topicId || null,
    topicTitle: data?.topicTitle || null,
    listeningPart: data?.listeningPart || null,
    speakingQuestion: data?.speakingQuestion || null,
    exerciseId: data?.exerciseId || null,
    exerciseIndex: data?.exerciseIndex ?? null,
    result: data?.result || null,
    results: data?.result ? [data.result] : [],
    submittedAt: data?.submittedAt || new Date().toISOString(),
    status: 'submitted',
  };

  try {
    const saved = await dbUpsert('practiceSubmissions', record);
    if (!saved) throw new Error('Supabase did not confirm the Practice Studio question.');
    return { record: saved, alreadySubmitted: false };
  } catch (error) {
    if (/23505|duplicate key|unique constraint/i.test(String(error?.message || error))) {
      const duplicate = (await getPracticeStudioExerciseSubmissions(studentId, data?.selection || {}))
        .find(item => item.sessionKey === sessionKey);
      if (duplicate) return { record: duplicate, alreadySubmitted: true };
    }
    throw error;
  }
}

/**
 * Save a final Practice Studio attempt exactly once. The matching database
 * migration adds a unique student/session index; the second lookup below turns
 * a cross-device race into a normal locked state rather than a second attempt.
 */
export async function submitPracticeStudioSession(studentId, data) {
  const sessionKey = data?.sessionKey;
  if (!studentId || !sessionKey) throw new Error('Missing Practice Studio submission details.');

  const existing = await getPracticeStudioSubmission(studentId, sessionKey);
  if (existing) return { record: existing, alreadySubmitted: true };

  const record = {
    id: uid(),
    type: 'practice_studio',
    studentId,
    sessionKey,
    mode: data?.mode || null,
    topicId: data?.topicId || null,
    topicTitle: data?.topicTitle || null,
    listeningPart: data?.listeningPart || null,
    speakingQuestion: data?.speakingQuestion || null,
    score: data?.score ?? null,
    exerciseCount: data?.exerciseCount || 0,
    correctCount: data?.correctCount || 0,
    maxHintLevel: data?.maxHintLevel || 0,
    hintUsed: Boolean(data?.hintUsed),
    quality: data?.quality || null,
    results: data?.results || [],
    confidenceBefore: data?.confidenceBefore ?? null,
    errorCategories: data?.errorCategories || null,
    submittedAt: data?.submittedAt || new Date().toISOString(),
    status: 'submitted',
  };

  try {
    const saved = await dbUpsert('practiceSubmissions', record);
    if (!saved) throw new Error('Supabase did not confirm the Practice Studio submission.');
    return { record: saved, alreadySubmitted: false };
  } catch (error) {
    // PostgreSQL duplicate-key error 23505 is the database enforcing the
    // one-submission rule. Re-read the authoritative row for this student.
    if (/23505|duplicate key|unique constraint/i.test(String(error?.message || error))) {
      const duplicate = await getPracticeStudioSubmission(studentId, sessionKey);
      if (duplicate) return { record: duplicate, alreadySubmitted: true };
    }
    throw error;
  }
}

/* ─── ERROR BANK ─────────────────────────────────────────────── */
export async function getErrorBank(studentId) {
  if (dbReady('errorBank')) { try { return (await dbList('errorBank') || []).filter(e => e.studentId === studentId); } catch (e) { console.warn('[workflow] getErrorBank via Supabase failed, using localStorage:', e.message); } }
  const obj = loadObj(K.errorBankGlobal);
  return obj[studentId] || [];
}
export async function promoteErrorToLongTerm(diagnosisId, errorIndex, studentId) {
  const diags = await getDiagnoses();
  const diag = diags.find(d => d.id === diagnosisId);
  if (!diag) return null;
  const sourceItem = diag.content?.error_bank?.[errorIndex];
  if (!sourceItem) return null;
  const sid = studentId || diag.studentId;
  if (!sid) return null;
  const existing = await getErrorBank(sid);
  const dupe = existing.find(it => it.error === sourceItem.error && it.correct === sourceItem.correct);
  if (dupe) return dupe;
  const record = { id: uid(), studentId: sid, error: sourceItem.error || '', correct: sourceItem.correct || '', type: sourceItem.type || 'grammar', explanation: sourceItem.explanation || '', example_sentence: sourceItem.example_sentence || '', sourceDiagnosisId: diagnosisId, status: 'active', practiceCount: 0, lastPracticed: null, submissionAppearances: 0, createdAt: new Date().toISOString() };
  if (dbReady('errorBank')) { try { const saved = await dbUpsert('errorBank', record); if (saved) return saved; } catch (e) { console.warn('[workflow] promoteErrorToLongTerm via Supabase failed, using localStorage:', e.message); } }
  const obj = loadObj(K.errorBankGlobal);
  obj[sid] = [record, ...(obj[sid] || [])];
  save(K.errorBankGlobal, obj);
  return record;
}
export async function markErrorPracticed(studentId, errorId) {
  if (dbReady('errorBank')) {
    try {
      const entry = (await dbList('errorBank') || []).find(e => e.id === errorId);
      if (!entry) return null;
      const wasFirst = (entry.practiceCount || 0) === 0;
      const practiceCount = (entry.practiceCount || 0) + 1;
      const saved = await dbUpsert('errorBank', { ...entry, practiceCount, status: practiceCount >= 3 ? 'solved' : 'practicing', lastPracticed: new Date().toISOString() });
      if (wasFirst) initSchedule(studentId, { ...entry, id: errorId });
      if (practiceCount >= 3) markSRMastered(studentId, errorId);
      return saved;
    } catch (e) { console.warn('[workflow] markErrorPracticed via Supabase failed, using localStorage:', e.message); }
  }
  const obj = loadObj(K.errorBankGlobal);
  const list = obj[studentId] || [];
  const idx = list.findIndex(e => e.id === errorId);
  if (idx < 0) return null;
  const wasFirst = (list[idx].practiceCount || 0) === 0;
  const newCount = (list[idx].practiceCount || 0) + 1;
  list[idx] = { ...list[idx], practiceCount: newCount, status: newCount >= 3 ? 'solved' : 'practicing', lastPracticed: new Date().toISOString() };
  obj[studentId] = list;
  save(K.errorBankGlobal, obj);
  if (wasFirst) initSchedule(studentId, { ...list[idx], id: errorId });
  if (newCount >= 3) markSRMastered(studentId, errorId);
  return list[idx];
}
export async function markErrorSolved(studentId, errorId) {
  if (dbReady('errorBank')) {
    try {
      const entry = (await dbList('errorBank') || []).find(e => e.id === errorId);
      if (!entry) return null;
      const saved = await dbUpsert('errorBank', { ...entry, status: 'solved', lastPracticed: new Date().toISOString() });
      markSRMastered(studentId, errorId);
      return saved;
    } catch (e) { console.warn('[workflow] markErrorSolved via Supabase failed, using localStorage:', e.message); }
  }
  const obj = loadObj(K.errorBankGlobal);
  const list = obj[studentId] || [];
  const idx = list.findIndex(e => e.id === errorId);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], status: 'solved', lastPracticed: new Date().toISOString() };
  obj[studentId] = list;
  save(K.errorBankGlobal, obj);
  markSRMastered(studentId, errorId);
  return list[idx];
}
export async function incrementErrorAppearance(studentId, errorId) {
  if (dbReady('errorBank')) {
    try {
      const entry = (await dbList('errorBank') || []).find(e => e.id === errorId);
      if (!entry) return null;
      return await dbUpsert('errorBank', { ...entry, submissionAppearances: (entry.submissionAppearances || 0) + 1 });
    } catch (e) { console.warn('[workflow] incrementErrorAppearance via Supabase failed, using localStorage:', e.message); }
  }
  const obj = loadObj(K.errorBankGlobal);
  const list = obj[studentId] || [];
  const idx = list.findIndex(e => e.id === errorId);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], submissionAppearances: (list[idx].submissionAppearances || 0) + 1 };
  obj[studentId] = list;
  save(K.errorBankGlobal, obj);
  return list[idx];
}
export async function seedErrorBankFromProfile(studentId, profile) {
  if (!studentId || !profile?.error_categories) return [];
  const existingEntries = await getErrorBank(studentId);
  const existingKeys = new Set(existingEntries.map(e => `${e.error}|${e.correct}`));
  const added = [];
  for (const cat of profile.error_categories) {
    for (const pattern of cat.common_error_patterns || []) {
      const errorText = pattern.error || pattern.problem || '';
      const correctText = pattern.correction || pattern.solution || '';
      if (!errorText || !correctText) continue;
      const key = `${errorText}|${correctText}`;
      if (existingKeys.has(key)) continue;
      const record = { id: uid(), studentId, error: errorText, correct: correctText, type: 'grammar', category: cat.category_id, categoryName: cat.category_name, explanation: pattern.explanation || pattern.solution || cat.definition || '', example_sentence: '', priority: cat.priority || 'medium', feedbackTemplate: cat.teacher_feedback_template || '', studentAction: cat.student_action || '', suggestedHomework: cat.suggested_homework || [], sourceDiagnosisId: null, sourceProfile: true, status: 'active', practiceCount: 0, lastPracticed: null, createdAt: new Date().toISOString() };
      existingKeys.add(key);
      added.push(record);
    }
  }
  if (dbReady('errorBank')) { try { for (const rec of added) await dbUpsert('errorBank', rec); return added; } catch (e) { console.warn('[workflow] seedErrorBankFromProfile via Supabase failed, using localStorage:', e.message); } }
  const obj = loadObj(K.errorBankGlobal);
  obj[studentId] = [...(obj[studentId] || []), ...added];
  save(K.errorBankGlobal, obj);
  return added;
}
