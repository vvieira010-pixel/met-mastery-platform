import assert from 'node:assert/strict';
import test from 'node:test';
import { refreshForFailedDynamicImport } from '../src/lib/utils.js';

test('a stale dynamic import refreshes once and does not loop', () => {
  const originalWindow = globalThis.window;
  const originalWarn = console.warn;
  const values = new Map();
  let reloads = 0;
  globalThis.window = {
    sessionStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    location: { reload: () => { reloads += 1; } },
  };
  console.warn = () => {};

  try {
    const error = new TypeError('Failed to fetch dynamically imported module: https://example.test/assets/registry-feedback.js');
    assert.equal(refreshForFailedDynamicImport(error), true);
    assert.equal(reloads, 1);
    assert.equal(refreshForFailedDynamicImport(error), false);
    assert.equal(reloads, 1);
    assert.equal(refreshForFailedDynamicImport(new Error('AI generation is unavailable')), false);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    console.warn = originalWarn;
  }
});
