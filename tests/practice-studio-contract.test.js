import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const practiceStudio = fs.readFileSync(path.join(root, 'src', 'pages', 'practice-studio.jsx'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'src', 'pages', 'student-dashboard.jsx'), 'utf8');
const exercisePlayer = fs.readFileSync(path.join(root, 'src', 'components', 'exercises', 'ExercisePlayer.jsx'), 'utf8');

test('Practice Studio provides recovery UI for failed and empty exercise loads', () => {
  assert.match(practiceStudio, /const \[loadError, setLoadError\] = useState\(false\)/);
  assert.match(practiceStudio, /\) : loadError \? \(/);
  assert.match(practiceStudio, /\) : exercises\.length === 0 \? \(/);
  assert.match(practiceStudio, /title="Exercises unavailable"/);
  assert.match(practiceStudio, /title="No exercises available"/);
});

test('student dashboard uses a main landmark instead of an incomplete tab-panel pattern', () => {
  assert.match(dashboard, /<main id="student-content" className="dash-body"/);
  assert.doesNotMatch(dashboard, /role="tabpanel"/);
});

test('Dialogue exercise triggers completion when the final line is revealed', () => {
  const dialogueCode = fs.readFileSync(path.join(root, 'src', 'components', 'exercises', 'Dialogue.jsx'), 'utf8');
  assert.match(dialogueCode, /next >= lines\.length - 1 && onComplete/);
  assert.match(dialogueCode, /✓ Dialogue complete/);
});

test('Practice Studio does not ask a confidence question after each answer', () => {
  assert.doesNotMatch(exercisePlayer, /After seeing the answer|ConfidenceSlider|confidenceAfter|showConfidenceAfter/);
});

test('Practice Studio exposes the image-description speaking topic', async () => {
  const bank = await import('../src/lib/vocab-homework-bank.js');
  assert.deepEqual(bank.getTopicList('speaking')[0], { id: 'describe_image', title: 'Describe the Image' });
  const exercises = await bank.getSpeakingExercises('describe_image');
  assert.equal(exercises.length, 15);
  assert.ok(exercises.every(ex => ex.type === 'speak' && ex.imageUrl && ex.metTaskType === 'picture_description'));
});

