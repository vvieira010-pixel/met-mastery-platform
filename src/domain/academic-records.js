import { K, load, save, uid, dbReady, listVia, saveVia, removeVia } from '../lib/workflow-core.js';
import { dbList, dbUpsert, dbRemove } from '../lib/supabase-db.js';
import { getStudent, saveStudent } from './roster.js';

/* ─── TARGET PROFILES ────────────────────────────────────────── */
export const TARGET_PROFILE_PRESETS = { endorsement: { profileName: 'endorsement', label: 'Endorsement Minimum', overallTarget: 55, speakingTarget: 55, writingTarget: null, readingTarget: null, listeningTarget: null }, visascreen: { profileName: 'visascreen', label: 'VisaScreen / Work Visa', overallTarget: 58, speakingTarget: 59, writingTarget: null, readingTarget: null, listeningTarget: null }, healthcare: { profileName: 'healthcare', label: 'Healthcare Professional Preparation', overallTarget: 58, speakingTarget: 59, writingTarget: null, readingTarget: null, listeningTarget: null } };
export async function getTargetProfiles(studentId) {
  return listVia('targetProfiles', K.targetProfiles, studentId ? (p => p.studentId === studentId) : null);
}
export async function getActiveTargetProfile(studentId) {
  const profiles = await getTargetProfiles(studentId);
  return profiles.find(p => p.isActive) || profiles[0] || null;
}
export async function saveTargetProfile(data) {
  const record = { id: data.id || uid(), studentId: data.studentId || null, profileName: data.profileName || 'custom', label: data.label || data.profileName || 'Custom', overallTarget: data.overallTarget ?? null, speakingTarget: data.speakingTarget ?? null, writingTarget: data.writingTarget ?? null, readingTarget: data.readingTarget ?? null, listeningTarget: data.listeningTarget ?? null, isActive: data.isActive ?? false, createdAt: data.createdAt || new Date().toISOString() };
  if (dbReady('targetProfiles')) { try { const saved = await dbUpsert('targetProfiles', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveTargetProfile via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.targetProfiles);
  const existing = all.findIndex(p => p.id === record.id);
  if (existing >= 0) all[existing] = { ...all[existing], ...record };
  else all.unshift(record);
  save(K.targetProfiles, all);
  return record;
}
export async function setActiveTargetProfile(studentId, profileId) {
  if (dbReady('targetProfiles')) {
    try {
      const profiles = await getTargetProfiles(studentId);
      for (const p of profiles) { if (Boolean(p.isActive) !== (p.id === profileId)) await dbUpsert('targetProfiles', { ...p, isActive: p.id === profileId }); }
      const student = await getStudent(studentId);
      if (student) await saveStudent({ ...student, activeTargetProfileId: profileId });
      return;
    } catch (e) { console.warn('[workflow] setActiveTargetProfile via Supabase failed, using localStorage:', e.message); }
  }
  const all = load(K.targetProfiles);
  all.forEach(p => { if (p.studentId === studentId) p.isActive = p.id === profileId; });
  save(K.targetProfiles, all);
  const students = load(K.studentsCrud);
  const si = students.findIndex(s => s.id === studentId);
  if (si >= 0) { students[si].activeTargetProfileId = profileId; save(K.studentsCrud, students); }
}
export async function deleteTargetProfile(id) {
  return removeVia('targetProfiles', K.targetProfiles, id);
}

/* ─── CLASS EVENTS ───────────────────────────────────────────── */
export async function getClassEvents(studentId) {
  return listVia('classEvents', K.classEvents, studentId ? (e => e.studentId === studentId) : null);
}
export async function getClassEvent(id) {
  return (await getClassEvents()).find(e => e.id === id) || null;
}
export async function saveClassEvent(data) {
  const record = { id: data.id || uid(), studentId: data.studentId || null, date: data.date || new Date().toISOString().slice(0, 10), startTime: data.startTime || '', endTime: data.endTime || '', title: data.title || 'English Class', classFocus: data.classFocus || '', metSkillFocus: data.metSkillFocus || '', timezone: data.timezone || 'America/Sao_Paulo', status: data.status || 'scheduled', diagnosticStatus: data.diagnosticStatus || 'not-started', homeworkStatus: data.homeworkStatus || 'not-generated', createdAt: data.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (dbReady('classEvents')) { try { const saved = await dbUpsert('classEvents', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveClassEvent via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.classEvents);
  const existing = all.findIndex(e => e.id === record.id);
  if (existing >= 0) all[existing] = { ...all[existing], ...record };
  else all.unshift(record);
  save(K.classEvents, all);
  return record;
}
export async function deleteClassEvent(id) {
  return removeVia('classEvents', K.classEvents, id);
}

/* ─── CLASS EVIDENCE ─────────────────────────────────────────── */
export async function getClassEvidence(classEventId) {
  const all = await listVia('classEvidence', K.classEvidence, null);
  return classEventId ? all.find(e => e.classEventId === classEventId) || null : all;
}
export async function saveClassEvidence(data) {
  const priorList = await listVia('classEvidence', K.classEvidence, null);
  const prior = priorList.find(e => e.classEventId === data.classEventId || e.id === data.id);
  const record = { id: data.id || prior?.id || uid(), classEventId: data.classEventId || null, studentId: data.studentId || null, evaluatedSpeaking: data.evaluatedSpeaking ?? false, evaluatedWriting: data.evaluatedWriting ?? false, evaluatedReading: data.evaluatedReading ?? false, evaluatedListening: data.evaluatedListening ?? false, evaluatedGrammar: data.evaluatedGrammar ?? false, evaluatedVocabulary: data.evaluatedVocabulary ?? false, evaluatedTestStrategy: data.evaluatedTestStrategy ?? false, testStrategyEvidenceCount: data.testStrategyEvidenceCount ?? 0, speakingEvidenceCount: data.speakingEvidenceCount ?? 0, writingEvidenceCount: data.writingEvidenceCount ?? 0, readingEvidenceCount: data.readingEvidenceCount ?? 0, listeningEvidenceCount: data.listeningEvidenceCount ?? 0, grammarEvidenceCount: data.grammarEvidenceCount ?? 0, vocabularyEvidenceCount: data.vocabularyEvidenceCount ?? 0, teacherNotes: data.teacherNotes || '', studentPerformance: data.studentPerformance || '', studentTranscript: data.studentTranscript || '', studentAnswer: data.studentAnswer || '', homeworkReviewed: data.homeworkReviewed || '', studentMood: data.studentMood || '', additionalNotes: data.additionalNotes || '', createdAt: data.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
  if (dbReady('classEvidence')) { try { const saved = await dbUpsert('classEvidence', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveClassEvidence via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.classEvidence);
  const existing = all.findIndex(e => e.classEventId === record.classEventId || e.id === record.id);
  if (existing >= 0) all[existing] = { ...all[existing], ...record };
  else all.push(record);
  save(K.classEvidence, all);
  return record;
}
export async function updateClassEvidence(id, patch) {
  if (dbReady('classEvidence')) {
    try { const ev = (await listVia('classEvidence', K.classEvidence, null)).find(e => e.id === id); if (!ev) return null; return await dbUpsert('classEvidence', { ...ev, ...patch }); }
    catch (e) { console.warn('[workflow] updateClassEvidence via Supabase failed, using localStorage:', e.message); }
  }
  const all = load(K.classEvidence);
  const idx = all.findIndex(e => e.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  save(K.classEvidence, all);
  return all[idx];
}

/* ─── VOCABULARY BANK ────────────────────────────────────────── */
export async function getVocabularyBank(studentId) {
  return listVia('vocabularyBank', K.vocabularyBank, studentId ? (v => v.studentId === studentId) : null);
}
export async function saveVocabularyEntry(data) {
  const record = { id: data.id || uid(), studentId: data.studentId || null, wordOrPhrase: data.wordOrPhrase || data.word || '', category: data.category || 'general', meaning: data.meaning || '', exampleSentence: data.exampleSentence || '', status: data.status || 'active', evidenceSource: data.evidenceSource || {}, createdAt: data.createdAt || new Date().toISOString() };
  if (dbReady('vocabularyBank')) { try { const saved = await dbUpsert('vocabularyBank', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveVocabularyEntry via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.vocabularyBank);
  const existing = all.findIndex(v => v.id === record.id);
  if (existing >= 0) all[existing] = { ...all[existing], ...record };
  else all.unshift(record);
  save(K.vocabularyBank, all);
  return record;
}
export async function updateVocabularyEntry(id, patch) {
  if (dbReady('vocabularyBank')) {
    try { const v = (await listVia('vocabularyBank', K.vocabularyBank, null)).find(x => x.id === id); if (!v) return null; return await dbUpsert('vocabularyBank', { ...v, ...patch }); }
    catch (e) { console.warn('[workflow] updateVocabularyEntry via Supabase failed, using localStorage:', e.message); }
  }
  const all = load(K.vocabularyBank);
  const idx = all.findIndex(v => v.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  save(K.vocabularyBank, all);
  return all[idx];
}
export async function deleteVocabularyEntry(id) {
  return removeVia('vocabularyBank', K.vocabularyBank, id);
}

/* ─── PROGRESS NOTES ─────────────────────────────────────────── */
export async function getProgressNotes(studentId) {
  return listVia('progressNotes', K.progressNotes, studentId ? (n => n.studentId === studentId) : null);
}
export async function saveProgressNote(data) {
  const record = { id: data.id || uid(), studentId: data.studentId || null, sourceType: data.sourceType || 'teacher', sourceId: data.sourceId || null, note: data.note || '', createdAt: data.createdAt || new Date().toISOString() };
  if (dbReady('progressNotes')) { try { const saved = await dbUpsert('progressNotes', record); if (saved) return saved; } catch (e) { console.warn('[workflow] saveProgressNote via Supabase failed, using localStorage:', e.message); } }
  const all = load(K.progressNotes);
  all.unshift(record);
  save(K.progressNotes, all);
  return record;
}
export async function deleteProgressNote(id) {
  return removeVia('progressNotes', K.progressNotes, id);
}
