import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MET_B2_MULTIPLE_CHOICE,
  MET_B2_MULTIPLE_CHOICE_SECTIONS,
  getMetB2MultipleChoice,
} from '../src/lib/met-b2-multiple-choice-data.js';

test('the MET B2 skills pack includes the base and Platform 0.2 exercise families', () => {
  assert.equal(MET_B2_MULTIPLE_CHOICE_SECTIONS.length, 6);

  for (const section of MET_B2_MULTIPLE_CHOICE_SECTIONS) {
    assert.ok(getMetB2MultipleChoice(section.id).length >= 10, section.title);
  }

  assert.equal(Object.values(MET_B2_MULTIPLE_CHOICE).flat().length, 76);
});

test('every exercise matches its supported scoring or review schema', () => {
  for (const exercise of Object.values(MET_B2_MULTIPLE_CHOICE).flat()) {
    assert.ok(['mcq', 'listen', 'read', 'short', 'speak'].includes(exercise.type), exercise.id);

    if (['mcq', 'listen'].includes(exercise.type)) {
      assert.ok(exercise.explanation.trim().length > 0, exercise.id);
      assert.equal(exercise.options.length, 4, exercise.id);
      assert.ok(exercise.correct >= 0 && exercise.correct < exercise.options.length, exercise.id);
    } else if (exercise.type === 'read') {
      assert.ok(exercise.passage.trim().length > 0, exercise.id);
      assert.ok(Array.isArray(exercise.questions) && exercise.questions.length > 0, exercise.id);
      for (const question of exercise.questions) {
        assert.equal(question.options.length, 4, `${exercise.id}:${question.id}`);
        assert.ok(question.correct >= 0 && question.correct < question.options.length, `${exercise.id}:${question.id}`);
        assert.ok(question.explanation.trim().length > 0, `${exercise.id}:${question.id}`);
      }
    } else if (exercise.type === 'short') {
      assert.ok(exercise.explanation.trim().length > 0, exercise.id);
      assert.ok(exercise.prompt.trim().length > 0, exercise.id);
      assert.ok(exercise.targetWords > 0, exercise.id);
      assert.ok(exercise.rubric.trim().length > 0, exercise.id);
    } else if (exercise.type === 'speak') {
      assert.ok(exercise.explanation.trim().length > 0, exercise.id);
      assert.ok(exercise.prompt.trim().length > 0, exercise.id);
      assert.ok(exercise.targetSeconds > 0, exercise.id);
    }
  }
});

test('listening exercises use two-speaker audio conversations with two plays', () => {
  for (const exercise of MET_B2_MULTIPLE_CHOICE.listening) {
    assert.equal(exercise.type, 'listen', exercise.id);
    assert.equal(exercise.plays, 2, exercise.id);
    assert.ok(Array.isArray(exercise.script) && exercise.script.length >= 2, exercise.id);
    assert.ok(exercise.script.every(line => ['A', 'B'].includes(line.speaker) && line.text), exercise.id);
    assert.ok(exercise.audioText.trim().length > 0, exercise.id);
  }
});

test('unknown section ids return an empty exercise list', () => {
  assert.deepEqual(getMetB2MultipleChoice('unknown'), []);
});
