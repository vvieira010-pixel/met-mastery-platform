import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  autoGrade,
  createExercise,
  parseBlankTemplate,
  isStructuredExercise,
  getExType,
} from '../src/lib/exercise-types.js';

describe('autoGrade — mcq', () => {
  const ex = { type: 'mcq', correct: 2, options: ['a', 'b', 'c', 'd'] };

  test('correct selection scores 1', () => {
    const r = autoGrade(ex, { selected: 2 });
    assert.equal(r.correct, true);
    assert.equal(r.score, 1);
  });

  test('wrong selection scores 0', () => {
    const r = autoGrade(ex, { selected: 0 });
    assert.equal(r.correct, false);
    assert.equal(r.score, 0);
  });

  test('unanswered selection (selected:null) scores 0, not null', () => {
    const r = autoGrade(ex, { selected: null });
    assert.equal(r.correct, false);
    assert.equal(r.score, 0);
  });
});

describe('autoGrade — blank (pipe-separated alternatives)', () => {
  const ex = { type: 'blank', blanks: ['have been working|have worked'] };

  test('accepts first alternative', () => {
    const r = autoGrade(ex, { blanks: ['have been working'] });
    assert.equal(r.correct, true);
  });

  test('accepts second alternative', () => {
    const r = autoGrade(ex, { blanks: ['have worked'] });
    assert.equal(r.correct, true);
  });

  test('rejects wrong answer', () => {
    const r = autoGrade(ex, { blanks: ['have ate'] });
    assert.equal(r.correct, false);
    assert.equal(r.score, 0);
  });
});

describe('autoGrade — fix (curly-quote / punctuation normalization)', () => {
  test('curly apostrophe matches straight', () => {
    const ex = { type: 'fix', correctedText: "It's a test." };
    const r = autoGrade(ex, { text: 'It’s a test' });
    assert.equal(r.correct, true);
  });

  test('trailing punctuation ignored', () => {
    const ex = { type: 'fix', correctedText: 'Close the door.' };
    const r = autoGrade(ex, { text: 'Close the door!!!' });
    assert.equal(r.correct, true);
  });
});

describe('exercise factories & helpers', () => {
  test('createExercise(mcq) yields 4 options, correct null', () => {
    const ex = createExercise('mcq');
    assert.equal(ex.type, 'mcq');
    assert.equal(ex.options.length, 4);
    assert.equal(ex.correct, null);
  });

  test('createExercise throws on unknown type', () => {
    assert.throws(() => createExercise('nope'));
  });

  test('parseBlankTemplate counts blanks', () => {
    const segs = parseBlankTemplate('The ___ cat ___ here');
    const blanks = segs.filter(s => s.type === 'blank');
    assert.equal(blanks.length, 2);
  });

  test('isStructuredExercise / getExType', () => {
    assert.equal(isStructuredExercise({ type: 'mcq' }), true);
    assert.equal(isStructuredExercise({ type: 'xyz' }), false);
    assert.equal(getExType('read').label, 'Reading');
    assert.equal(getExType('nope'), null);
  });
});
