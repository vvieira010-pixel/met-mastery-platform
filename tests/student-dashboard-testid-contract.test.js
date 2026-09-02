import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'pages', 'student-home.jsx'), 'utf8');

test('student dashboard TodoRow does not reference an undeclared testId', () => {
  const todoRow = source.match(/function TodoRow\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[0];

  assert.ok(todoRow, 'expected StudentHome to define TodoRow');
  assert.doesNotMatch(
    todoRow,
    /data-testid=\{testId\}/,
    'TodoRow has no testId prop, so it must not render data-testid={testId}',
  );
});
