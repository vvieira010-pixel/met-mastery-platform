import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const practiceStudio = fs.readFileSync(path.join(root, 'src', 'pages', 'practice-studio.jsx'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'src', 'pages', 'student-dashboard.jsx'), 'utf8');
const exercisePlayer = fs.readFileSync(path.join(root, 'src', 'components', 'exercises', 'ExercisePlayer.jsx'), 'utf8');
const writing = fs.readFileSync(path.join(root, 'src', 'components', 'exercises', 'Writing.jsx'), 'utf8');
const writingScore = fs.readFileSync(path.join(root, 'src', 'lib', 'writing-score.js'), 'utf8');
const shortAnswer = fs.readFileSync(path.join(root, 'src', 'components', 'exercises', 'ShortAnswer.jsx'), 'utf8');
const writingEndpoint = fs.readFileSync(path.join(root, 'api', '_routes', 'evaluate-writing.js'), 'utf8');

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

test('AssemblyAI is reserved for speaking and writing uses its own scorer cascade', () => {
  assert.match(exercisePlayer, /practiceStudio=\{practiceStudio\}/);
  assert.match(shortAnswer, /taskPrompt: prompt \|\| 'Speak on the topic\.', practiceStudio/);
  assert.match(writing, /scoreWriting\(\{ essay: text, taskPrompt: prompt, token \}\)/);
  assert.doesNotMatch(writingScore, /practiceStudio/);
  assert.doesNotMatch(writingEndpoint, /callAssemblyAI|ASSEMBLYAI_API_KEY|assemblyai-llm/);
  assert.match(writingEndpoint, /const attempts = \[scoreWithGemini, scoreWithGroq\]/);
});

test('Practice Studio waits for persistence before marking speaking or writing finalized', () => {
  assert.match(exercisePlayer, /return onComplete\?\.\(/);
  assert.match(exercisePlayer, /return saveExerciseResult\(result\)/);
  assert.match(shortAnswer, /const saved = await onComplete\(/);
  assert.match(shortAnswer, /if \(saved !== true\)/);
  assert.match(shortAnswer, /setFinalized\(true\)/);
  assert.match(writing, /const saved = await onComplete\(/);
  assert.match(writing, /if \(saved !== true\)/);
  assert.match(writing, /setFinalized\(true\)/);
  assert.match(writingScore, /Authorization: `Bearer \$\{token\}`/);
});

test('Practice Studio preserves an AI result when persistence fails so retry does not rescore', () => {
  assert.match(shortAnswer, /if \(practiceStudio && evalData\?\.evaluation\)/);
  assert.match(shortAnswer, /Retry saving/);
  assert.match(writing, /if \(practiceStudio && result\)/);
  assert.match(writing, /Retry saving result/);
});

test('Practice Studio exposes the image-description speaking topic', async () => {
  const bank = await import('../src/lib/vocab-homework-bank.js');
  assert.deepEqual(bank.getTopicList('speaking')[0], { id: 'describe_image', title: 'Describe the Image' });
  const exercises = await bank.getSpeakingExercises('describe_image');
  assert.equal(exercises.length, 15);
  assert.ok(exercises.every(ex => ex.type === 'speak' && ex.imageUrl && ex.metTaskType === 'Q1'));
});
