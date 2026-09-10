import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'pages', 'homework.jsx'), 'utf8');
const createSource = fs.readFileSync(path.join(root, 'src', 'pages', 'homework-create.jsx'), 'utf8');
const createFormSource = fs.readFileSync(path.join(root, 'src', 'pages', 'homework-create', 'homework-form.jsx'), 'utf8');
const studentSource = fs.readFileSync(path.join(root, 'src', 'pages', 'student-homework.jsx'), 'utf8');
const academicSource = fs.readFileSync(path.join(root, 'src', 'lib', 'workflow-academic.js'), 'utf8');

test('Homework keeps assigned work available in a teacher view', () => {
  assert.match(source, /getHomework, getSubmissions, deleteHomework/);
  assert.match(source, /const \[selectedHomework, setSelectedHomework\] = useState\(null\)/);
  assert.match(source, /title=\{selectedHomework\?\.title \|\| 'Untitled Homework'\}/);
  assert.match(source, /<strong>Instructions<\/strong>/);
  assert.match(source, /<strong>Exercises \(\{selectedActivities\.length\}\)<\/strong>/);
});

test('Homework only opens a review when a matching submission exists', () => {
  assert.match(source, /const submission = submissions\.find\(s => s\.homeworkId === h\.id\)/);
  assert.match(source, /\{submission && \(/);
  assert.match(source, /submissionId: submission\.id/);
  assert.doesNotMatch(source, /submissionId: h\.submissionId/);
});

test('Homework authoring exposes presets, diagnostic explanations, and durable listening audio', () => {
  assert.match(createFormSource, /title="Preset Homework"/);
  assert.match(createFormSource, /data-testid="homework-presets"/);
  assert.match(createSource, /const seededTopics =/);
  assert.match(createSource, /fetchAudioWithProvider/);
  assert.match(createSource, /uploadTeacherResource\(file, 'audio'\)/);
  assert.match(createSource, /saveExerciseToLibrary\(updated\)/);
});

test('Homework submission requires a fresh remote check and never hides a Supabase write failure', () => {
  assert.match(academicSource, /dbList\('submissions', \{ fresh: true \}\)/);
  assert.match(academicSource, /Could not submit this homework to your teacher/);
  assert.match(studentSource, /submitting=\{submitting\}/);
});
