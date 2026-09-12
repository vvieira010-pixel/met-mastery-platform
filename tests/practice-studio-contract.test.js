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
const evaluateWriting = fs.readFileSync(path.join(root, 'api', '_routes', 'evaluate-writing.js'), 'utf8');
const evaluateSpeaking = fs.readFileSync(path.join(root, 'api', '_routes', 'evaluate-speaking.js'), 'utf8');
const speakingScale = fs.readFileSync(path.join(root, 'api', '_routes', '_met-speaking-scale.js'), 'utf8');

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

test('Practice Studio saves and locks individual questions while preserving AI scoring labels', () => {
  assert.match(practiceStudio, /getPracticeStudioExerciseSubmissions/);
  assert.match(practiceStudio, /createPracticeStudioExerciseKey/);
  assert.match(practiceStudio, /const savedResults = useMemo/);
  assert.match(practiceStudio, /submitPracticeStudioExercise/);
  assert.match(practiceStudio, /onExerciseComplete=\{handleExerciseComplete\}/);
  assert.match(practiceStudio, /record\?\.result \? \{ \.\.\.record\.result, index \} : undefined/);
});

test('Writing stays off AssemblyAI while speaking identifies Practice Studio requests', () => {
  assert.match(exercisePlayer, /practiceStudio=\{practiceStudio\}/);
  assert.match(writing, /scoreWriting\(\{ essay: text, taskPrompt: prompt, practiceStudio, token \}\)/);
  assert.match(shortAnswer, /taskPrompt: prompt \|\| 'Speak on the topic\.', practiceStudio/);
  assert.match(evaluateWriting, /const attempts = \[scoreWithGemini, scoreWithGroq\]/);
  assert.doesNotMatch(evaluateWriting, /callAssemblyAILLMJson|scoreWithAssemblyAI/);
});

test('Practice Studio scored attempts lock only after AI scoring and persist before finalization', () => {
  assert.match(shortAnswer, /const recordingLocked = finalized \|\| \(practiceStudio && Boolean\(evalData\?\.evaluation\)\)/);
  assert.match(shortAnswer, /await persistScoredResult\(data\)/);
  assert.match(shortAnswer, /Retry saving/);
  assert.match(shortAnswer, /transcription: data\?\.transcription \|\| null/);
  assert.match(writing, /await persistScoredResult\(evaluation\)/);
  assert.match(writing, /practiceStudio && result/);
  assert.match(writing, /Retry saving/);
  assert.match(writing, /readStoredSupabaseSession/);
  assert.match(writingScore, /Authorization: `Bearer \$\{token\}`/);
});

test('ExercisePlayer returns persistence success and does not remount a scored child on save failure', () => {
  assert.match(exercisePlayer, /return onComplete\?\.\(\{ \.\.\.answerResult, errorCategory: errorCategory \|\| null \}\)/);
  assert.match(exercisePlayer, /return saveExerciseResult\(result\)/);
  const catchBlock = exercisePlayer.match(/catch \(error\) \{[\s\S]*?return false;\n    \}/)?.[0] || '';
  assert.ok(catchBlock.includes('setSubmissionError'));
  assert.doesNotMatch(catchBlock, /setReviewVersion/);
});

test('Practice Studio shows complete saved speaking feedback and rejects partial AI payloads', () => {
  assert.match(exercisePlayer, /Overall speaking feedback/);
  assert.match(exercisePlayer, /Speaking rubric feedback/);
  assert.match(exercisePlayer, /Speaking strengths/);
  assert.match(exercisePlayer, /Speaking next steps/);
  assert.match(exercisePlayer, /Language corrections/);
  assert.match(exercisePlayer, /isAiScored/);
  assert.match(evaluateSpeaking, /function validSpeakingFeedback/);
  assert.match(evaluateSpeaking, /strengths\.length < 3/);
  assert.match(evaluateSpeaking, /weaknesses\.length < 2/);
  assert.match(evaluateSpeaking, /feedbackComplete: true/);
  assert.match(speakingScale, /At least three specific, evidence-based strengths/);
});

test('Speaking AI scoring remains Practice Studio-only in the student exercise UI', () => {
  assert.match(shortAnswer, /\{practiceStudio && audioPath && \(/);
  assert.match(shortAnswer, /if \(!practiceStudio && onComplete\)/);
});

test('Practice Studio exposes the image-description speaking topic', async () => {
  const bank = await import('../src/lib/vocab-homework-bank.js');
  assert.deepEqual(bank.getTopicList('speaking')[0], { id: 'describe_image', title: 'Describe the Image' });
  const exercises = await bank.getSpeakingExercises('describe_image');
  assert.equal(exercises.length, 44);
  assert.ok(exercises.every(ex => ex.type === 'speak' && ex.imageUrl && ex.metTaskType === 'Q1'));
});

test('every listed Grammar Sprint topic resolves to renderable exercises', async () => {
  const bank = await import('../src/lib/vocab-homework-bank.js');
  const { loadExercises } = await import('../src/components/exercises/validateExercise.js');
  const topics = bank.getTopicList('grammar');

  assert.equal(topics.length, 22);
  for (const topic of topics) {
    const raw = await bank.getGrammarExercises(topic.id);
    const loaded = loadExercises(raw);
    assert.ok(raw.length > 0, `${topic.id} returned no exercises`);
    assert.equal(loaded.errors.length, 0, `${topic.id} returned invalid exercises: ${loaded.errors.join('; ')}`);
    assert.equal(loaded.exercises.length, raw.length, `${topic.id} lost exercises during validation`);
  }
});
