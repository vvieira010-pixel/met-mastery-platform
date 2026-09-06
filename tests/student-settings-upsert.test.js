import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

test('student setting writes target the student-and-key uniqueness rule for upsert', () => {
  const source = fs.readFileSync(path.join(root, 'src/lib/supabase-db.js'), 'utf8');
  const functionSource = source.slice(source.indexOf('export async function setStudentSetting'), source.indexOf('export async function getAllStudentSettings'));
  assert.match(functionSource, /student_settings\?on_conflict=student_id%2Ckey/);
  assert.match(functionSource, /resolution=merge-duplicates/);
});
