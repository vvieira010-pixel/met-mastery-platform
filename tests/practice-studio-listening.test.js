import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { getPracticeStudioListeningGroups, getPracticeStudioListeningExercises } from '../src/lib/vocab-homework-bank.js';

const root = path.resolve(import.meta.dirname, '..');
const audioRoot = path.join(root, 'public', 'exercises', 'audio', 'listening');

test('practice studio listening has 63 playable groups', async () => {
  const groups = await getPracticeStudioListeningGroups();
  assert.equal(groups.length, 63);

  const byId = new Map();
  for (const group of groups) {
    const exercises = await getPracticeStudioListeningExercises(group.id);
    assert.ok(exercises.length > 0, group.id);
    byId.set(group.id, exercises);
  }

  const exercises = [...byId.values()].flat();
  // 107 studio questions (7 convos x2 + 28 talks x3 + 3 bonus x3) + 37 supplementary (76-88 x1, 89-100 x2)
  assert.equal(exercises.length, 144);

  for (const exercise of exercises) {
    assert.equal(exercise.type, 'listen');
    assert.equal(exercise.plays, 2);
    assert.equal(exercise.listeningFormat, 'multiple_choice');
    assert.equal(exercise.options.length, 4);
    assert.ok(exercise.correct >= 0 && exercise.correct < 4);
    assert.ok(exercise.audioText && exercise.audioText.length > 10, exercise.id);
    assert.ok(exercise.question && exercise.question.length > 5, exercise.id);
    assert.ok(fs.existsSync(path.join(audioRoot, decodeURIComponent(exercise.audioSrc.split('/').pop()))), exercise.audioSrc);
  }

  // per-group question counts: conversations x2, talks x3, bonus x3, pack 76-88 x1, pack 89-100 x2
  for (const [id, list] of byId) {
    const file = id.split('/').pop();
    if (/^conversation_\d+\.wav$/.test(file)) assert.equal(list.length, 2, id);
    else if (/^listening-(L\d+|1min-).+\.mp3$/.test(file)) assert.equal(list.length, 3, id);
    else if (/^met_audio_\d+_.+\.wav$/.test(file)) assert.equal(list.length, 3, id);
    else if (/^listening-(89|9\d|100)-.+\.mp3$/.test(file)) assert.equal(list.length, 2, id);
    else if (/^listening-(7[6-9]|8\d|9\d|100)-.+\.mp3$/.test(file)) assert.equal(list.length, 1, id);
    else assert.fail(`unexpected group file ${id}`);
  }
});
