import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { getPracticeStudioSpeakingTopics, getPracticeStudioSpeakingExercises, getSpeakingExercises, getTopicList } from '../src/lib/vocab-homework-bank.js';

const root = path.resolve(import.meta.dirname, '..');
const audioRoot = path.join(root, 'public', 'audio', 'speaking');

test('practice studio speaking topics come first with student-facing names', () => {
  const topics = [...getPracticeStudioSpeakingTopics(), ...getTopicList('speaking')];
  assert.deepEqual(topics.slice(0, 2), [
    { id: 'spk_audio_prompts', title: 'Listen and Speak', subtitle: 'Listen · prepare · speak' },
    { id: 'spk_quiz', title: 'Speak and Compare', subtitle: 'Record · compare with a sample answer' },
  ]);
  assert.equal(topics.find(topic => topic.id === 'speaking_full_bank').title, 'Speaking Practice');
  assert.equal(topics.some(topic => topic.id === 'general'), false);
  assert.ok(topics.length > 2);
});

test('speaking topics contain only playable non-image tasks', async () => {
  const audio = await getPracticeStudioSpeakingExercises('spk_audio_prompts');
  const quiz = await getPracticeStudioSpeakingExercises('spk_quiz');
  assert.equal(audio.length, 4);
  assert.equal(quiz.length, 4);

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

  for (const ex of [...audio, ...quiz]) {
    assert.doesNotMatch(ex.prompt, /describe (?:the )?(?:photo|picture|image)/i, ex.id);
    assert.ok(!ex.imageUrl, ex.id);
  }
});

test('every Describe the Image exercise includes a real image asset', async () => {
  const exercises = await getPracticeStudioSpeakingExercises('describe_image');
  assert.equal(exercises.length, 15);

  for (const exercise of exercises) {
    assert.equal(exercise.metTaskType, 'picture_description');
    assert.ok(exercise.imageUrl, exercise.id);
    const relativeImagePath = decodeURIComponent(exercise.imageUrl.replace(/^\//, ''));
    assert.ok(fs.existsSync(path.join(root, 'public', relativeImagePath)), exercise.imageUrl);
  }
});

test('every learner-facing Speaking Mirror topic contains recordable prompts only', async () => {
  const topics = [...getPracticeStudioSpeakingTopics(), ...getTopicList('speaking')];
  const fullBank = await getPracticeStudioSpeakingExercises('speaking_full_bank');

  assert.equal(fullBank.length, 166);
  assert.ok(fullBank.every(exercise => exercise.type === 'speak'));

  for (const topic of topics) {
    const exercises = await getPracticeStudioSpeakingExercises(topic.id);
    assert.ok(exercises.length > 0, topic.id);
    assert.ok(exercises.every(exercise => exercise.type === 'speak'), topic.id);
    assert.ok(exercises.every(exercise => exercise.prompt && exercise.prompt.length > 10), topic.id);
  }

  const writingTasks = await getSpeakingExercises('work_career');
  assert.equal(writingTasks.some(exercise => exercise.type === 'short'), false);
  assert.equal(writingTasks.some(exercise => exercise.type === 'mcq'), false);
});
