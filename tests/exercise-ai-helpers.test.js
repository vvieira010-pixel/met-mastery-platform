// Regression tests for AI-output normalizers that REPAIR instead of DROP.
// Pure ASCII only (node --test cannot parse non-ASCII in source).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createCompleteExercise,
  isStructuredAiExerciseComplete,
  normalizeMcq,
} from '../src/lib/exercise-ai-helpers.js';
import { autoGrade, createExercise } from '../src/lib/exercise-types.js';

// --- MCQ repair: 3 real options are padded to 4 with a safe distractor ---

test('MCQ with 3 options is repaired to 4 and stays complete', () => {
  const ex = createCompleteExercise({
    type: 'mcq',
    question: 'Pick the best answer.',
    options: ['Alpha', 'Beta', 'Gamma'],
    correct: 'B',
    explanation: 'Because.',
  });
  assert.ok(ex, 'exercise should not be dropped');
  assert.equal(ex.options.length, 4, 'padded to 4 options');
  assert.equal(ex.correct, 1, 'correct index maps to real option B');
  assert.ok(isStructuredAiExerciseComplete(ex));
});

test('MCQ repaired options never include an empty string', () => {
  const { options } = normalizeMcq(['One', 'Two'], 'A');
  assert.equal(options.length, 4);
  assert.ok(options.every(o => typeof o === 'string' && o.length > 0));
});

test('MCQ with correct past last real option is dropped as a broken key', () => {
  // 3 real options but the AI keyed "D" (index 3) -> broken key -> dropped.
  const { correct } = normalizeMcq(['Alpha', 'Beta', 'Gamma'], 'D');
  assert.equal(correct, null, 'key resolved against real count, not padded length');
  const ex = createCompleteExercise({
    type: 'mcq',
    question: 'Pick the best answer.',
    options: ['Alpha', 'Beta', 'Gamma'],
    correct: 'D',
    explanation: 'Because.',
  });
  assert.equal(ex, null, 'must not mis-grade toward a synthetic distractor');
});

test('MCQ with zero options stays dropped (no real content)', () => {
  const ex = createCompleteExercise({
    type: 'mcq',
    question: 'Pick the best answer.',
    options: [],
    correct: null,
    explanation: 'Because.',
  });
  assert.equal(ex, null);
});

test('fully valid 4-option MCQ is unchanged', () => {
  const ex = createCompleteExercise({
    type: 'mcq',
    question: 'Pick the best answer.',
    options: ['A1', 'A2', 'A3', 'A4'],
    correct: 2,
    explanation: 'Because.',
  });
  assert.ok(ex);
  assert.deepEqual(ex.options, ['A1', 'A2', 'A3', 'A4']);
  assert.equal(ex.correct, 2);
});

// --- listen + read sub-questions also repaired via normalizeMcq ---

test('listening MCQ with 2 options is repaired to 4', () => {
  const ex = createCompleteExercise({
    type: 'listen',
    audioText: 'Speaker A: Hello. Speaker B: Hi.',
    question: 'What happens?',
    options: ['They meet', 'They leave'],
    correct: 'A',
    explanation: 'Because.',
  });
  assert.ok(ex, 'listening exercise should not be dropped');
  assert.equal(ex.options.length, 4);
  assert.ok(isStructuredAiExerciseComplete(ex));
});

test('reading sub-question with 3 options is repaired to 4', () => {
  const ex = createCompleteExercise({
    type: 'read',
    passage: 'The cat sat.',
    questions: [
      { question: 'Who sat?', options: ['Cat', 'Dog', 'Bird'], correct: 'A' },
    ],
  });
  assert.ok(ex, 'reading exercise should not be dropped');
  assert.equal(ex.questions[0].options.length, 4);
  assert.equal(ex.questions[0].correct, 0);
  assert.ok(isStructuredAiExerciseComplete(ex));
});

// --- blank repair: partial answer key yields, alignment preserved ---

test('blank with 1 answer of 2 blanks is kept and aligned', () => {
  const ex = createCompleteExercise({
    type: 'blank',
    template: 'The ___ sat on the ___',
    blanks: ['cat'],
  });
  assert.ok(ex, 'partial blank exercise should not be dropped');
  assert.equal(ex.blanks.length, 2, 'one slot per ___ in template');
  assert.deepEqual(ex.blanks, ['cat', '']);
  assert.ok(isStructuredAiExerciseComplete(ex));
});

test('blank with 2 of 3 answers is kept and aligned', () => {
  const ex = createCompleteExercise({
    type: 'blank',
    template: 'A ___ B ___ C ___',
    blanks: ['x', 'y'],
  });
  assert.ok(ex);
  assert.equal(ex.blanks.length, 3);
  assert.deepEqual(ex.blanks, ['x', 'y', '']);
});

test('blank with no answers is still dropped', () => {
  const ex = createCompleteExercise({
    type: 'blank',
    template: 'A ___ B ___',
    blanks: [],
  });
  assert.equal(ex, null);
});

// --- autoGrade blank hardens empty answer keys (no false "must be empty") ---

test('autoGrade blank skips blanks without an answer key', () => {
  const ex = createExercise('blank');
  ex.template = 'A ___ B ___ C ___';
  ex.blanks = ['cat', '', 'dog']; // middle blank has no key
  const graded = autoGrade(ex, { blanks: ['cat', 'fox', 'dog'] });
  assert.equal(graded.correct, true, 'only keyed blanks are graded');
  assert.equal(graded.feedback, 'All blanks correct!');
});

test('autoGrade blank with all keys present still works', () => {
  const ex = createExercise('blank');
  ex.template = 'A ___ B ___';
  ex.blanks = ['cat', 'dog'];
  const graded = autoGrade(ex, { blanks: ['cat', 'dog'] });
  assert.equal(graded.correct, true);
  const wrong = autoGrade(ex, { blanks: ['cat', 'fish'] });
  assert.equal(wrong.correct, false);
  assert.equal(wrong.feedback, '1/2 blanks correct.');
});

test('repaired MCQ never auto-grades a synthetic distractor as correct', () => {
  const { options, correct } = normalizeMcq(['Alpha', 'Beta', 'Gamma'], 'A');
  const ex = createExercise('mcq');
  ex.question = 'Q';
  ex.options = options;
  ex.correct = correct; // 0
  ex.explanation = 'E';
  const pickedDistractor = autoGrade(ex, { selected: 3 }); // last is a fallback distractor
  assert.equal(pickedDistractor.correct, false);
  const pickedReal = autoGrade(ex, { selected: 0 });
  assert.equal(pickedReal.correct, true);
});
