import assert from 'node:assert/strict';
import test from 'node:test';
import { MET_TASK_CONFIG } from '../src/lib/met-task-spec.js';
import { getPracticeStudioSpeakingExercises, getPracticeStudioSpeakingTopics } from '../src/lib/vocab-homework-bank.js';

test('MET speaking timing uses a preparation phase and official response lengths', () => {
  assert.deepEqual(
    Object.fromEntries(['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map(question => [
      question,
      {
        preparationSeconds: MET_TASK_CONFIG[question].preparationSeconds,
        responseSeconds: MET_TASK_CONFIG[question].responseSeconds,
      },
    ])),
    {
      Q1: { preparationSeconds: 15, responseSeconds: 60 },
      Q2: { preparationSeconds: 15, responseSeconds: 60 },
      Q3: { preparationSeconds: 15, responseSeconds: 60 },
      Q4: { preparationSeconds: 20, responseSeconds: 90 },
      Q5: { preparationSeconds: 20, responseSeconds: 90 },
    },
  );
});

test('every learner-facing Practice Studio speaking prompt has preparation and response timing', async () => {
  for (const question of ['Q1', 'Q2', 'Q3', 'Q4', 'Q5']) {
    const topics = await getPracticeStudioSpeakingTopics(question);
    const exercises = (await Promise.all(topics.map(topic => getPracticeStudioSpeakingExercises(topic.id)))).flat();
    assert.ok(exercises.length > 0, question);
    assert.ok(exercises.every(exercise => Number.isInteger(exercise.preparationSeconds) && exercise.preparationSeconds > 0), question);
    assert.ok(exercises.every(exercise => exercise.targetSeconds === MET_TASK_CONFIG[question].responseSeconds), question);
  }
});
