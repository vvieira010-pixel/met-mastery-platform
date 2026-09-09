import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  getPracticeStudioSpeakingQuestions,
  getPracticeStudioSpeakingTopics,
  getPracticeStudioSpeakingExercises,
  getSpeakingExercises,
} from '../src/lib/vocab-homework-bank.js';

const root = path.resolve(import.meta.dirname, '..');
const audioRoot = path.join(root, 'public', 'audio', 'speaking');
const speakingPlayerSource = fs.readFileSync(path.join(root, 'src', 'components', 'exercise-player.jsx'), 'utf8');

test('Practice Studio presents the five MET Speaking questions before topics', () => {
  assert.deepEqual(
    getPracticeStudioSpeakingQuestions().map(({ id, number, title }) => ({ id, number, title })),
    [
      { id: 'Q1', number: 1, title: 'Question 1 — Describe a Picture' },
      { id: 'Q2', number: 2, title: 'Question 2 — Personal Experience' },
      { id: 'Q3', number: 3, title: 'Question 3 — Personal Opinion' },
      { id: 'Q4', number: 4, title: 'Question 4 — Advantages and Disadvantages' },
      { id: 'Q5', number: 5, title: 'Question 5 — Persuade an Authority' },
    ],
  );
});

test('each MET Speaking question contains topic categories with matching recordable prompts', async () => {
  const questions = getPracticeStudioSpeakingQuestions();
  let allExercises = [];

  for (const question of questions) {
    const topics = await getPracticeStudioSpeakingTopics(question.id);
    assert.ok(topics.length > 0, question.id);
    assert.ok(topics.every(topic => topic.id.startsWith(`${question.id}::`)), question.id);

    const perTopic = await Promise.all(topics.map(topic => getPracticeStudioSpeakingExercises(topic.id)));
    const exercises = perTopic.flat();
    assert.ok(exercises.length > 0, question.id);
    assert.ok(exercises.every(exercise => exercise.type === 'speak'), question.id);
    assert.ok(exercises.every(exercise => exercise.speakingQuestion === question.id), question.id);
    assert.ok(exercises.every(exercise => exercise.metTaskType === question.id), question.id);
    assert.ok(exercises.every(exercise => exercise.prompt && exercise.prompt.length > 10), question.id);
    // Coverage floor per question, not a magic grand total. An exact total was
    // asserted here before (179) but the bank never shipped that many prompts;
    // it silently drifted and broke the gate. If content is legitimately
    // missing, raise this floor and restore the prompts.
    assert.ok(
      exercises.length >= 15,
      `${question.id} must expose at least 15 recordable prompts, got ${exercises.length}`,
    );
    allExercises = allExercises.concat(exercises);
  }

  assert.ok(allExercises.length >= 75, `expected at least 75 recordable prompts, got ${allExercises.length}`);
});

test('Question 1 contains real image assets and Questions 2–5 contain recordable non-image prompts', async () => {
  const pictureTopics = await getPracticeStudioSpeakingTopics('Q1');
  assert.deepEqual(pictureTopics.map(topic => topic.id), ['Q1::describe_image']);
  const pictures = (await Promise.all(pictureTopics.map(topic => getPracticeStudioSpeakingExercises(topic.id)))).flat();
  assert.equal(pictures.length, 15);

  for (const exercise of pictures) {
    assert.equal(exercise.metTaskType, 'Q1');
    assert.ok(exercise.imageUrl, exercise.id);
    const relativeImagePath = decodeURIComponent(exercise.imageUrl.replace(/^\//, ''));
    assert.ok(fs.existsSync(path.join(root, 'public', relativeImagePath)), exercise.imageUrl);
  }

  for (const question of ['Q2', 'Q3', 'Q4', 'Q5']) {
    const topics = await getPracticeStudioSpeakingTopics(question);
    const exercises = (await Promise.all(topics.map(topic => getPracticeStudioSpeakingExercises(topic.id)))).flat();
    assert.ok(exercises.every(exercise => !exercise.imageUrl), question);
    assert.ok(exercises.every(exercise => exercise.type === 'speak'), question);
  }
});

test('speaking prompt-audio files remain present for the dedicated practice pack', async () => {
  const q2Topics = await getPracticeStudioSpeakingTopics('Q2');
  const q2 = (await Promise.all(q2Topics.map(topic => getPracticeStudioSpeakingExercises(topic.id)))).flat();
  const audioPrompts = q2.filter(exercise => exercise.audioSrc);

  assert.equal(audioPrompts.length, 1);
  for (const exercise of audioPrompts) {
    assert.ok(exercise.transcript && exercise.transcript.length > 20, exercise.id);
    assert.ok(fs.existsSync(path.join(audioRoot, decodeURIComponent(exercise.audioSrc.split('/').pop()))), exercise.audioSrc);
  }
});

test('text-only speaking prompts provide a browser read-aloud control', () => {
  assert.match(speakingPlayerSource, /Read prompt aloud/);
  assert.match(speakingPlayerSource, /SpeechSynthesisUtterance/);
  assert.match(speakingPlayerSource, /aria-pressed=\{isReadingPrompt\}/);
});

test('the raw speaking bank no longer exposes non-recordable short or MCQ tasks', async () => {
  const fullBank = await getSpeakingExercises('speaking_full_bank');
  assert.ok(fullBank.every(exercise => exercise.type === 'speak'));
  assert.ok(fullBank.every(exercise => ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].includes(exercise.metTaskType)));
  assert.equal(fullBank.some(exercise => exercise.type === 'short' || exercise.type === 'mcq'), false);
  // Same reasoning as above: the exact total (156) never matched the shipped
  // bank. Assert that every recordable question actually carries prompts.
  for (const questionId of ['Q2', 'Q3', 'Q4', 'Q5']) {
    const prompts = fullBank.filter(exercise => exercise.metTaskType === questionId);
    assert.ok(prompts.length >= 10, `${questionId} must expose at least 10 prompts, got ${prompts.length}`);
  }
});
