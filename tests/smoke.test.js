// Minimal smoke test — runs on every CI build.
// Add real tests under tests/ alongside this file.

import { test } from 'node:test';
import assert from 'node:assert/strict';

test('Node test runner is wired up', () => {
  assert.equal(1 + 1, 2);
});

test('package.json declares the expected scripts', async () => {
  const { default: pkg } = await import('../package.json', { with: { type: 'json' } });
  assert.ok(typeof pkg.name === 'string' && pkg.name.length > 0);
  assert.ok(['build', 'test', 'lint'].every((s) => s in pkg.scripts));
});
