import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('student dashboard explains and shares the referral benefit', async () => {
  const source = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'src', 'pages', 'student-home.jsx'), 'utf8');

  assert.match(source, /data-testid="student-referral-card"/);
  assert.match(source, /both receive one extra class/);
  assert.match(source, /register the referral before the new student starts/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /navigator\.clipboard\?\.writeText/);
  assert.match(source, /Share referral/);
  assert.match(source, /Copy message/);
});
