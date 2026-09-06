import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { REQUIRED_APPROVAL_KEYS } from '../src/domain/assessment/constants.js';
import { buildFeedbackDraft } from '../src/domain/assessment/feedback-draft.js';

test('only personalized student feedback blocks diagnosis approval', () => {
  assert.deepEqual(REQUIRED_APPROVAL_KEYS, ['studentFeedback']);
});

test('feedback-first flow saves feedback and opens review without downstream AI', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');
  const feedbackDraft = source.indexOf('buildFeedbackDraft({');
  const feedbackSave = source.indexOf('await saveDraft(feedbackSections, fallbackDiagnosis)');
  const review = source.indexOf("setStep('review');", feedbackSave);
  const downstreamDiagnosis = source.indexOf('generateDiagnosisJson(');

  assert.ok(feedbackDraft >= 0, 'feedback is created locally');
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
  assert.match(draft.whatYouDidWell[0].example, /night shift/);
  assert.match(draft.finalNote, /editable first draft/);
});
