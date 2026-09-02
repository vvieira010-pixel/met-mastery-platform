import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const shellSource = fs.readFileSync(path.join(root, 'src', 'components', 'shared.jsx'), 'utf8');
const iconsSource = fs.readFileSync(path.join(root, 'src', 'components', 'ui', 'icons.jsx'), 'utf8');

test('every icon rendered by the shared shell exists in the Icon registry', () => {
  const shellIcons = [...shellSource.matchAll(/<Icon\.([A-Za-z0-9_]+)/g)].map((match) => match[1]);
  const iconNames = new Set([...iconsSource.matchAll(/^\s*([A-Za-z0-9_]+):\s*\(/gm)].map((match) => match[1]));

  assert.ok(shellIcons.length > 0, 'expected the shared shell to render at least one icon');
  for (const name of shellIcons) {
    assert.ok(iconNames.has(name), `Icon.${name} is rendered by Shell but is missing from the Icon registry`);
  }
});
