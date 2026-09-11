/**
 * Boot smoke test — every serverless module must be importable.
 *
 * Regression guard for a real outage: `api/_routes/_zoom.js` used CommonJS
 * `require('crypto')` inside this ESM package (`"type": "module"`). Both
 * `server.ts` and `api/[...path].js` import every handler at module scope, so
 * that one line killed the whole process during module loading:
 *
 *   ReferenceError: require is not defined in ES module scope
 *
 * The failure was total and silent — `npm run dev` exited before binding a
 * port, so the browser got a connection refused and the UI read as
 * "the AI feature is not working" with no error surfaced anywhere.
 *
 * Importing the catch-all router exercises the entire handler graph in a single
 * assertion, which is exactly the check that was missing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../api');
const routesDir = path.join(apiDir, '_routes');

const importModule = (absPath) => import(pathToFileURL(absPath).href);

test('api/[...path].js (the catch-all router) imports without throwing', async () => {
  const mod = await importModule(path.join(apiDir, '[...path].js'));
  assert.equal(typeof mod.default, 'function', 'the catch-all must default-export a handler');
});

test('every public route handler in api/_routes/ default-exports a function', async () => {
  const names = (await readdir(routesDir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.js') && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort();

  assert.ok(names.length > 0, 'expected at least one route handler in api/_routes/');

  for (const name of names) {
    const mod = await importModule(path.join(routesDir, name));
    assert.equal(typeof mod.default, 'function', `api/_routes/${name} must default-export a handler`);
  }
});

test('every shared helper in api/_routes/ imports without throwing', async () => {
  // Underscore-prefixed modules are not deployed as functions, but the handlers
  // import them at module scope — a syntax or module-format error here takes
  // down whichever route reaches it, so they get the same import check.
  const names = (await readdir(routesDir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith('.js') && e.name.startsWith('_'))
    .map((e) => e.name)
    .sort();

  assert.ok(names.length > 0, 'expected at least one shared helper in api/_routes/');

  for (const name of names) {
    await assert.doesNotReject(
      () => importModule(path.join(routesDir, name)),
      `api/_routes/${name} must be importable`,
    );
  }
});

test('no CommonJS require() in api/ — the package is ESM ("type": "module")', async () => {
  // Static grep rather than a runtime import: `require` inside a function body
  // would not throw until that code path executes, so an import check alone
  // cannot catch it. This is the exact defect that caused the outage.
  const { readFile } = await import('node:fs/promises');

  async function collect(dir) {
    const out = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await collect(full)));
      else if (entry.name.endsWith('.js')) out.push(full);
    }
    return out;
  }

  const files = await collect(apiDir);
  assert.ok(files.length > 0, 'expected to find .js files under api/');

  const offenders = [];
  for (const file of files) {
    const src = await readFile(file, 'utf8');
    // Ignore matches inside comments and string literals used in messages.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/(^|[^.\w])require\s*\(/.test(code)) {
      offenders.push(path.relative(apiDir, file));
    }
  }

  assert.deepEqual(offenders, [], `api/ is an ES module tree; replace require() with import in: ${offenders.join(', ')}`);
});
