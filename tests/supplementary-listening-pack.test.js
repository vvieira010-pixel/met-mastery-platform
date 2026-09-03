import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import listeningPack from '../met_listening_section_76_100.json' with { type: 'json' };
import { getListeningAudioGroups, getListeningExercises } from '../src/lib/vocab-homework-bank.js';

const root = path.resolve(import.meta.dirname, '..');
const audioRoot = path.join(root, 'public', 'exercises', 'audio', 'listening');

test('supplementary listening pack contains 25 playable source records', async () => {
  assert.equal(listeningPack.exercises.length, 25);

  const groups = await getListeningAudioGroups();
  const packGroups = groups.filter(group => /\/listening\/listening-(?:7[6-9]|8\d|9\d|100)-/.test(group.id));
  assert.equal(packGroups.length, listeningPack.exercises.length);

  const exercises = (await Promise.all(packGroups.map(group => getListeningExercises(group.id)))).flat();
  assert.equal(exercises.length, listeningPack.exercises.length);
  assert.deepEqual(exercises.map(exercise => exercise.id), listeningPack.exercises.map(item => item.id));

  for (const exercise of exercises) {
    assert.equal(exercise.type, 'listen');
    assert.equal(exercise.plays, 2);
    assert.equal(exercise.listeningFormat, 'multiple_choice');
    assert.equal(exercise.options.length, 4);
    assert.ok(exercise.correct >= 0 && exercise.correct < 4);
    assert.ok(fs.existsSync(path.join(audioRoot, decodeURIComponent(exercise.audioSrc.split('/').pop()))));
  }
});
