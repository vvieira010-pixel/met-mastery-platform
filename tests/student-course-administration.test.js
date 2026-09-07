import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('course administration shows a discreet class count without financial fields', async () => {
  const source = await readFile(new URL('../src/pages/student-course-administration.jsx', import.meta.url), 'utf8');

  assert.match(source, /getClassEvents/);
  assert.match(source, /calculateCourseCredits/);
  assert.match(source, /Classes remaining/);
  assert.match(source, /classes remaining/);
  assert.doesNotMatch(source, /formatMoney|payment\.amount|payment\.currency|payment\.method|payment\.reference/);
});
