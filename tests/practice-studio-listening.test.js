import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  getPracticeStudioListeningGroups,
  getPracticeStudioListeningParts,
  getPracticeStudioListeningTopics,
  getPracticeStudioListeningExercises,
} from '../src/lib/vocab-homework-bank.js';

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
    if (/^conversation_\d+\.(wav|mp3)$/.test(file)) assert.equal(list.length, 2, id);
    else if (/^listening-(L\d+|1min-).+\.mp3$/.test(file)) assert.equal(list.length, 3, id);
    else if (/^met_audio_\d+_.+\.(wav|mp3)$/.test(file)) assert.equal(list.length, 3, id);
    else if (/^listening-(89|9\d|100)-.+\.mp3$/.test(file)) assert.equal(list.length, 2, id);
    else if (/^listening-(7[6-9]|8\d|9\d|100)-.+\.mp3$/.test(file)) assert.equal(list.length, 1, id);
    else assert.fail(`unexpected group file ${id}`);
  }
});

test('short-conversation questions name the speaker heard in the audio', async () => {
  const expectedQuestions = {
    'ps-conv-01-q1': 'Why did the woman miss the lecture?',
    'ps-conv-01-q2': 'What does the man say about the lecture?',
    'ps-conv-02-q1': 'What is the man worried about?',
    'ps-conv-02-q2': 'What will the woman do?',
    'ps-conv-03-q1': 'What does the woman need to do?',
    'ps-conv-03-q2': 'What does the man suggest?',
    'ps-conv-04-q1': "Why can't the man have lunch now?",
    'ps-conv-04-q2': 'What does the woman suggest instead?',
    'ps-conv-05-q1': 'Where does the man think he left his sunglasses?',
    'ps-conv-05-q2': 'What does the woman offer?',
    'ps-conv-06-q1': "What is the woman's problem?",
    'ps-conv-06-q2': 'What does the man suggest?',
    'ps-conv-07-q1': 'Why is the man happy?',
    'ps-conv-07-q2': 'How does the woman respond?',
  };

  const groups = await getPracticeStudioListeningGroups();
  const exercises = (await Promise.all(
    groups.map(group => getPracticeStudioListeningExercises(group.id)),
  )).flat();
  const questionById = new Map(exercises.map(exercise => [exercise.id, exercise.question]));

  assert.deepEqual(
    Object.fromEntries(Object.keys(expectedQuestions).map(id => [id, questionById.get(id)])),
    expectedQuestions,
  );

  assert.deepEqual(questionById.get('ps-conv-01-q1'), 'Why did the woman miss the lecture?');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-01-q1').options[1], 'She missed the bus.');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-04-q1').options[1], 'The library closes soon and he must finish a chapter.');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-05-q2').options[1], 'To lend him her sunglasses.');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-06-q1').options[1], 'She is stuck on question three.');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-07-q1').options[1], 'His manager praised his presentation.');
  assert.equal(exercises.find(exercise => exercise.id === 'ps-conv-07-q2').options[1], 'She says the hard work paid off.');
});

test('listening is organised by MET part before students choose a topic', async () => {
  const parts = await getPracticeStudioListeningParts();
  assert.deepEqual(parts.map(({ id, clipCount }) => ({ id, clipCount })), [
    { id: 'listening_part_1', clipCount: 7 },
    { id: 'listening_part_2', clipCount: 15 },
    { id: 'listening_part_3', clipCount: 41 },
  ]);

  const selectedAudioGroups = new Set();
  for (const part of parts) {
    const topics = await getPracticeStudioListeningTopics(part.id);
    assert.ok(topics.length > 0, part.id);

    for (const topic of topics) {
      const exercises = await getPracticeStudioListeningExercises(topic.id);
      assert.ok(exercises.length > 0, topic.id);
      assert.ok(exercises.every(exercise => exercise.listeningPart === part.id), topic.id);
      assert.ok(exercises.every(exercise => exercise.listeningTopicTitle === topic.title), topic.id);
      exercises.forEach(exercise => selectedAudioGroups.add(exercise.audioSrc));
    }
  }

  assert.equal(selectedAudioGroups.size, 63);
});
