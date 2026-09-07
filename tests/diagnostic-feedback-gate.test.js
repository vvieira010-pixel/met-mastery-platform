import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { REQUIRED_APPROVAL_KEYS } from '../src/domain/assessment/constants.js';
import { buildFeedbackDraft } from '../src/domain/assessment/feedback-draft.js';

test('only personalized student feedback blocks diagnosis approval', () => {
  assert.deepEqual(REQUIRED_APPROVAL_KEYS, ['studentFeedback']);
});

test('feedback-first flow generates personalized AI feedback before saving and opening review', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');
  const feedbackDraft = source.indexOf('buildFeedbackDraft({');
  const aiFeedback = source.indexOf('callAI(buildStudentFeedbackPrompt({', feedbackDraft);
  const feedbackSave = source.indexOf("nextCompletedPhases: ['feedback']", feedbackDraft);
  const review = source.indexOf("setStep('review');", feedbackSave);
  const downstreamDiagnosis = source.indexOf('generateDiagnosisJson(');

  assert.ok(feedbackDraft >= 0, 'an honest fallback is prepared');
  assert.ok(aiFeedback > feedbackDraft, 'AI feedback is generated before the feedback draft is saved');
  assert.match(source.slice(aiFeedback), /max_tokens: 2600, temperature: 0\.3/, 'initial feedback avoids oversized skill augmentations');
  assert.match(source, /readStudentFeedbackResponse\(aiFeedback\)/, 'initial feedback must meet the student feedback contract');
  assert.match(source, /content\.whatYouDidWell\.length < 3/, 'AI feedback must contain at least three strengths');
  assert.ok(feedbackSave > feedbackDraft, 'feedback is persisted');
  assert.ok(review > feedbackSave, 'the teacher reaches review after feedback persistence');
  assert.equal(downstreamDiagnosis, -1, 'the initial flow does not block on downstream diagnosis generation');
  assert.match(source, /sort\(\(a, b\) => Number\(b\.studentFacing\) - Number\(a\.studentFacing\)\)/, 'student-facing feedback is rendered before teacher analysis');
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

test('diagnostic creation saves feedback and then unlocks separate saved phases', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');

  assert.match(source, /id: 'feedback', number: 1/);
  assert.match(source, /id: 'analysis', number: 2, title: 'Evidence analysis', requires: \['feedback'\]/);
  assert.match(source, /id: 'targets', number: 3, title: 'Language targets', requires: \['analysis'\]/);
  assert.match(source, /id: 'homework', number: 4, title: 'Homework plan', requires: \['targets'\]/);
  assert.match(source, /completedPhases: nextCompletedPhases/);
  assert.match(source, /Finish and save the earlier phase first\./);

  const persist = source.indexOf('await persistDiagnosisDraft({ nextSections, nextAiResult, nextCompletedPhases });');
  const updateUi = source.indexOf('setSections(nextSections);', persist);
  assert.ok(persist >= 0, 'each later phase is persisted');
  assert.ok(updateUi > persist, 'a later phase becomes visible only after its save succeeds');
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
