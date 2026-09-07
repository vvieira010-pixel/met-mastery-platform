import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'pages', 'student-profile.jsx'), 'utf8');

test('student profile shell and not-found branch forward data-testid', () => {
  assert.match(
    source,
    /<div className="page-shell-lg" data-testid=\{testId\}>Student not found\.<\/div>/,
    'the not-found branch must forward data-testid={testId}',
  );
  assert.match(
    source,
    /<div className="page-shell-lg" data-testid=\{testId\}>\s*<style>/,
    'the loaded profile shell must forward data-testid={testId}',
  );
});

test('student profile has an explicit loading state and never flashes "Student not found"', () => {
  assert.match(source, /if \(loading\)/, 'expected a loading state guard');
  assert.match(source, /setLoading\(false\)/, 'expected loading to be cleared');
  assert.match(source, /finally \{[^}]*setLoading\(false\)/, 'expected loading to clear even on failure');
});

test('student profile does not import dead symbols', () => {
  for (const dead of ['saveStudent', 'deleteTargetProfile', 'markErrorPracticed', 'deleteVocabularyEntry', 'deleteProgressNote']) {
    assert.ok(!source.includes(dead), `${dead} should no longer be imported`);
  }
});