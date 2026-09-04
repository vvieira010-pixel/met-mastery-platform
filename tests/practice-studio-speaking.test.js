import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { getPracticeStudioSpeakingTopics, getPracticeStudioSpeakingExercises, getTopicList } from '../src/lib/vocab-homework-bank.js';

const root = path.resolve(import.meta.dirname, '..');
const audioRoot = path.join(root, 'public', 'audio', 'speaking');

test('practice studio speaking pack topics come first', () => {
  const topics = [...getPracticeStudioSpeakingTopics(), ...getTopicList('speaking')];
  assert.equal(topics[0].id, 'spk_audio_prompts');
  assert.equal(topics[1].id, 'spk_quiz');
  assert.ok(topics.length > 2);
});

test('speaking pack has 10 playable exercises', async () => {
  const audio = await getPracticeStudioSpeakingExercises('spk_audio_prompts');
  const quiz = await getPracticeStudioSpeakingExercises('spk_quiz');
  assert.equal(audio.length, 5);
  assert.equal(quiz.length, 5);

  for (const ex of audio) {
    assert.equal(ex.type, 'speak');
    assert.ok(ex.prompt && ex.prompt.length > 10, ex.id);
    assert.ok(ex.audioSrc, ex.id);
    assert.ok(ex.transcript && ex.transcript.length > 20, ex.id);
    assert.ok(fs.existsSync(path.join(audioRoot, decodeURIComponent(ex.audioSrc.split('/').pop()))), ex.audioSrc);
  }
  for (const ex of quiz) {
    assert.equal(ex.type, 'speak');
    assert.ok(ex.prompt && ex.prompt.length > 10, ex.id);
    assert.ok(ex.sampleAnswer && ex.sampleAnswer.length > 50, ex.id);
    assert.equal(ex.followUps.length, 2, ex.id);
  }
});

test('non-pack speaking topics still use the standard bank', async () => {
  const ex = await getPracticeStudioSpeakingExercises('general');
  assert.ok(ex.length > 0);
});
