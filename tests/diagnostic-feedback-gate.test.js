import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { REQUIRED_APPROVAL_KEYS } from '../src/domain/assessment/constants.js';
import { buildFeedbackDraft } from '../src/domain/assessment/feedback-draft.js';

test('only personalized student feedback blocks diagnosis approval', () => {
  assert.deepEqual(REQUIRED_APPROVAL_KEYS, ['studentFeedback']);
});

test('diagnosis-first flow requires valid AI analysis before feedback, persistence, and review', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');
  const handleGenerate = source.indexOf('async function handleGenerate()');
  const diagnosisCall = source.indexOf('generateDiagnosisJson(promptData, setGeneratingStatus)', handleGenerate);
  const feedbackDraft = source.indexOf('buildFeedbackDraft({', diagnosisCall);
  const aiFeedback = source.indexOf('callAI(buildStudentFeedbackPrompt({', feedbackDraft);
  const cloudSave = source.indexOf('await persistDiagnosisDraft({', aiFeedback);
  const setDiagnosis = source.indexOf('setAiResult(diagnosis);', cloudSave);
  const review = source.indexOf("setStep('review');", setDiagnosis);

  assert.ok(handleGenerate >= 0, 'diagnosis creation handler exists');
  assert.ok(diagnosisCall > handleGenerate, 'structured AI diagnosis is the first AI result');
  assert.ok(feedbackDraft > diagnosisCall, 'fallback feedback is derived only after diagnosis succeeds');
  assert.ok(aiFeedback > diagnosisCall, 'personalized AI feedback is generated from a valid diagnosis');
  assert.match(source.slice(aiFeedback), /diagnosis,/);
  assert.match(source.slice(aiFeedback), /max_tokens: 2600, temperature: 0\.3/, 'feedback keeps its focused prompt budget');
  assert.match(source, /readStudentFeedbackResponse\(aiFeedback\)/, 'AI feedback must satisfy the student feedback contract');
  assert.match(source, /content\.whatYouDidWell\.length < 3/, 'AI feedback must contain at least three strengths');
  assert.ok(cloudSave > aiFeedback, 'diagnosis and feedback are persisted after generation');
  assert.ok(setDiagnosis > cloudSave, 'AI result is exposed only after persistence succeeds');
  assert.ok(review > setDiagnosis, 'review opens only after cloud-confirmed persistence');
  assert.doesNotMatch(source.slice(handleGenerate, review), /normalizeDiagnosisJson\(\{\}/, 'normalizer defaults cannot stand in for an AI diagnosis');
  assert.match(source, /sort\(\(a, b\) => Number\(b\.studentFacing\) - Number\(a\.studentFacing\)\)/, 'student-facing feedback remains prominent in review');
});

test('diagnosis persistence is Supabase-authoritative and never falls back to local-only success', async () => {
  const [pageSource, persistenceSource] = await Promise.all([
    readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/diagnosis-authoritative.js', import.meta.url), 'utf8'),
  ]);

  assert.match(pageSource, /saveDiagnosisAuthoritative\(buildDiagnosisRecord\(options\)\)/);
  assert.doesNotMatch(pageSource, /saveDiagnosis\(buildDiagnosisRecord\(options\)\)/);
  assert.match(persistenceSource, /if \(!dbReady\('diagnoses'\)\)/);
  assert.match(persistenceSource, /await dbUpsert\('diagnoses', record\)/);
  assert.match(persistenceSource, /Cloud diagnosis save failed/);
  assert.match(persistenceSource, /Cloud diagnosis save was not confirmed by Supabase/);
  assert.doesNotMatch(persistenceSource, /saveVia\(/);
});

test('feedback draft uses supplied evidence and clearly requires teacher review', () => {
  const draft = buildFeedbackDraft({
    student: { name: 'Ana' },
    classEvent: { classFocus: 'speaking fluency' },
    classEvidence: { studentTranscript: 'I worked the night shift yesterday.' },
    evaluatedSkills: ['speaking'],
  });

  assert.match(draft.classFocus, /speaking fluency/);
  assert.equal(draft.whatYouDidWell.length, 3);
  assert.match(draft.whatYouDidWell[0].strength, /Speaking/);
  assert.match(draft.whatYouDidWell[0].evidence, /night shift/);
  assert.match(draft.whatYouDidWell[1].strength, /class evidence/i);
  assert.match(draft.finalNote, /editable first draft/);
});

test('feedback view presents evidence separately and keeps older examples readable', async () => {
  const source = await readFile(new URL('../src/components/domain-ui.jsx', import.meta.url), 'utf8');

  assert.match(source, /win\?\.evidence \|\| win\?\.quote \|\| win\?\.example/);
  assert.match(source, />Evidence<\/div>/);
});

test('regeneration restores saved session evidence and rejects empty AI responses', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');

  assert.match(source, /await loadClassData\(dx\.classEventId\)/);
  assert.match(source, /targetProfileId\);/);
  assert.doesNotMatch(source, /diagnosticEvidence: normalizedEvidence/);
  assert.match(source, /AI returned an empty response\. Try Regen again\./);
  assert.match(source, /Section regenerated\. Review it, then save the diagnosis\./);
  assert.match(source, /setRegenerationError\(\{ key, message \}\)/);
  assert.match(source, /role="alert"/);
  assert.match(source, /key === 'studentFeedback'/);
  assert.match(source, /refreshForFailedDynamicImport\(e\)/);
});

test('diagnostic creation records analysis first, then feedback, then optional language targets', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');

  assert.match(source, /id: 'analysis', number: 1, title: 'AI diagnosis'/);
  assert.match(source, /id: 'feedback', number: 2, title: 'Student feedback', requires: \['analysis'\]/);
  assert.match(source, /id: 'targets', number: 3, title: 'Language targets', requires: \['feedback'\]/);
  assert.doesNotMatch(source, /id: 'homework', number: 4/);
  assert.match(source, /const nextCompletedPhases = \['analysis', 'feedback'\]/);
  assert.match(source, /completedPhases: nextCompletedPhases/);
  assert.match(source, /Finish and save the earlier phase first\./);

  const persist = source.indexOf('await persistDiagnosisDraft({ nextSections, nextAiResult, nextCompletedPhases });');
  const updateUi = source.indexOf('setSections(nextSections);', persist);
  assert.ok(persist >= 0, 'each later phase is persisted');
  assert.ok(updateUi > persist, 'a later phase becomes visible only after its save succeeds');
  assert.match(source, /generateDiagnosisJson\(promptData, setGeneratingStatus\)/, 'analysis uses the guarded direct AI request path');
});

test('diagnosis creation requires evidence text, not only evaluated-skill flags', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');

  assert.match(source, /const inlineReady = evaluatedSkills\.length > 0 && hasUsableEvidenceText\(normalizedEvidence\)/);
  assert.match(source, /no transcript, student answer, or teacher notes/i);
  assert.match(source, /Create AI Diagnosis/);
});

test('the feedback improvement matrix uses real lesson targets instead of seeded examples', async () => {
  const [matrixSource, promptSource] = await Promise.all([
    readFile(new URL('../src/components/ImprovementMatrix.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/prompts.js', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(matrixSource, /DEFAULT_IMPROVEMENT_ENTRIES/);
  assert.match(matrixSource, /if \(entries\.length === 0\) return null/);
  assert.match(matrixSource, /isPlaceholder\(currentLanguage\)/);
  assert.match(promptSource, /IMPROVEMENT MATRIX: include 0-3 entries only when the class evidence contains a real phrase/);
  assert.match(promptSource, /"skill": "writing\|speaking\|reading\|listening\|grammar\|vocabulary\|testStrategy"/);
});
