import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { REQUIRED_APPROVAL_KEYS } from '../src/domain/assessment/constants.js';

test('only personalized student feedback blocks diagnosis approval', () => {
  assert.deepEqual(REQUIRED_APPROVAL_KEYS, ['studentFeedback']);
});

test('a diagnostic draft is saved before feedback generation and feedback failure opens review', async () => {
  const source = await readFile(new URL('../src/pages/diagnostic-create.jsx', import.meta.url), 'utf8');
  const initialSave = source.indexOf('await saveDraft(initialSections, fallbackDiagnosis)');
  const feedbackRequest = source.indexOf('buildStudentFeedbackPrompt({ ...promptData, diagnosis: fallbackDiagnosis })');
  const feedbackFailure = source.indexOf("setStep('review');\n        return;", feedbackRequest);

  assert.ok(initialSave >= 0, 'the initial evidence draft is saved');
  assert.ok(feedbackRequest > initialSave, 'feedback starts only after the draft save attempt');
  assert.ok(feedbackFailure > feedbackRequest, 'a feedback failure returns directly to review');
});
