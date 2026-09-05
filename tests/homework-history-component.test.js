import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'pages', 'homework.jsx'), 'utf8');

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
