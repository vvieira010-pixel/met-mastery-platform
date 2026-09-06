import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

test('student page headings use the active text token in dark themes', () => {
  const stylesheet = fs.readFileSync(path.join(root, 'src/styles/hierarchy.css'), 'utf8');
  const headingRule = stylesheet.slice(
    stylesheet.indexOf('.student-page-header h1,'),
    stylesheet.indexOf('.student-page-header h2,'),
  );
  assert.match(headingRule, /color:\s*var\(--text\)\s*!important/);
  assert.doesNotMatch(headingRule, /color:\s*var\(--ink\)\s*!important/);
});
