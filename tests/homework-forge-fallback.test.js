/**
 * Regression contracts for the Homework Forge fallback behaviour.
 *
 * Two real defects this locks down:
 *
 *  1. The specialist batch was awaited with Promise.all, so ONE task type that
 *     exhausted its two attempts rejected the whole call and discarded every task
 *     type that had already succeeded. A teacher asking for six MET task types and
 *     getting five lost all five.
 *
 *  2. The blueprint fallback list was ['reading', 'grammar']. mapAiType() resolves
 *     'grammar' to 'short' (writing) because no branch matches it, so a blueprint
 *     with no task types silently produced reading + writing instead of reading +
 *     grammar.
 *
 * Run: node --test tests/homework-forge-fallback.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FALLBACK_TASK_TYPES,
  collectForgedTasks,
  describePartialForge,
} from '../src/lib/homework-forge-tasks.js';
import { mapAiType } from '../src/lib/exercise-ai-helpers.js';

const fulfilled = (value) => ({ status: 'fulfilled', value });
const rejected = (reason) => ({ status: 'rejected', reason });

// --- collectForgedTasks: partial success survives ---------------------------

test('one failed task type does not discard the successful ones', () => {
  const settled = [
    fulfilled({ taskType: 'speak', exercise: { id: 'ex-1', type: 'speak' } }),
    fulfilled({ taskType: 'listen', exercise: { id: 'ex-2', type: 'listen' } }),
    fulfilled({ taskType: 'fix', error: 'Audit review flagged item' }),
    fulfilled({ taskType: 'mcq', exercise: { id: 'ex-3', type: 'mcq' } }),
  ];

  const { exercises, failedTaskTypes, firstError } = collectForgedTasks(settled);

  assert.equal(exercises.length, 3, 'the three forged exercises must survive');
  assert.deepEqual(exercises.map((e) => e.id), ['ex-1', 'ex-2', 'ex-3']);
  assert.deepEqual(failedTaskTypes, ['fix']);
  assert.equal(firstError, 'Audit review flagged item');
});

test('a fully successful batch reports no failures', () => {
  const settled = [
    fulfilled({ taskType: 'read', exercise: { id: 'ex-1' } }),
    fulfilled({ taskType: 'short', exercise: { id: 'ex-2' } }),
  ];

  const { exercises, failedTaskTypes, firstError } = collectForgedTasks(settled);

  assert.equal(exercises.length, 2);
  assert.deepEqual(failedTaskTypes, []);
  assert.equal(firstError, '');
});

test('a fully failed batch yields zero exercises and names every task type', () => {
  const settled = [
    fulfilled({ taskType: 'speak', error: 'Generation error' }),
    fulfilled({ taskType: 'listen', error: 'No valid exercise generated' }),
  ];

  const { exercises, failedTaskTypes } = collectForgedTasks(settled);

  assert.equal(exercises.length, 0, 'caller must be able to detect total failure');
  assert.deepEqual(failedTaskTypes, ['speak', 'listen']);
});

test('an unexpectedly rejected promise is treated as a failure, not a crash', () => {
  // withSkills() and the prompt builders can throw outside the inner try/catch.
  const settled = [
    rejected(new Error('withSkills exploded')),
    fulfilled({ taskType: 'read', exercise: { id: 'ex-1' } }),
  ];

  const { exercises, failedTaskTypes, firstError } = collectForgedTasks(settled);

  assert.equal(exercises.length, 1);
  assert.deepEqual(failedTaskTypes, ['unknown']);
  assert.equal(firstError, 'withSkills exploded');
});

test('malformed input degrades to an empty result instead of throwing', () => {
  for (const input of [null, undefined, [], 'nope', 42]) {
    const result = collectForgedTasks(input);
    assert.deepEqual(result.exercises, []);
    assert.deepEqual(result.failedTaskTypes, []);
  }
});

// --- FALLBACK_TASK_TYPES: the canonical-type invariant ----------------------

test('every fallback task type is canonical under mapAiType', () => {
  // This is the invariant that would have caught the 'grammar' defect: a fallback
  // type must map to itself, otherwise the forge silently builds a different skill.
  for (const type of FALLBACK_TASK_TYPES) {
    assert.equal(
      mapAiType(type),
      type,
      `fallback entry ${type} is not canonical: mapAiType rewrites it to ${mapAiType(type)}`,
    );
  }
});

test('grammar is not used as a fallback type because it maps to writing', () => {
  // Documents the exact defect, so a future edit cannot reintroduce it by accident.
  assert.equal(mapAiType('grammar'), 'short');
  assert.ok(!FALLBACK_TASK_TYPES.includes('grammar'));
  assert.ok(!FALLBACK_TASK_TYPES.includes('reading'), 'reading is non-canonical too');
});

// --- describePartialForge: teacher-facing summary ---------------------------

test('no summary is produced when every task type was forged', () => {
  assert.equal(describePartialForge(3, { exercises: [{}, {}, {}], failedTaskTypes: [] }), null);
});

test('the summary names the missing task types and the counts', () => {
  const note = describePartialForge(4, {
    exercises: [{}, {}, {}],
    failedTaskTypes: ['fix'],
  });

  assert.match(note, /Generated 3 of 4 exercises/);
  assert.match(note, /fix/);
});
