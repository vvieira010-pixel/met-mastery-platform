import test from 'node:test';
import assert from 'node:assert/strict';

import { isStrictJsonResponse } from '../api/_routes/ai.js';

test('AI JSON validation rejects provider prose that merely quotes a JSON example', () => {
  assert.equal(isStrictJsonResponse('Here is my reasoning about {"ok":true}.'), false);
});

test('AI JSON validation accepts complete object, array, and fenced JSON responses', () => {
  assert.equal(isStrictJsonResponse('{"ok":true}'), true);
  assert.equal(isStrictJsonResponse('[{"ok":true}]'), true);
  assert.equal(isStrictJsonResponse('```json\n{"ok":true}\n```'), true);
});
