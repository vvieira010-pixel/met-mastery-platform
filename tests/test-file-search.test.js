import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  DEFAULT_TEST_FILES,
  filterTestFiles,
  highlightSegments,
  getTagTheme,
} from '../src/lib/test-file-search-utils.js';

const root = path.resolve(import.meta.dirname, '..');
const componentSource = fs.readFileSync(
  path.join(root, 'src', 'components', 'TestFileSearch.jsx'),
  'utf8'
);

const MOCK_FILES = [
  { id: 1, filename: 'auth-workflow.test.ts', tag: 'core', path: 'tests/auth.test.ts', status: 'passed' },
  { id: 2, filename: 'payments.test.js', tag: 'finance', path: 'tests/payments.test.js', status: 'passed' },
  { id: 3, filename: 'shell-icon-contract.test.js', tag: 'ui', path: 'tests/ui.test.js', status: 'passed' },
  { id: 4, filename: 'smoke.test.js', tag: 'core', path: 'tests/smoke.test.js', status: 'passed' },
  { id: 5, filename: 'legacy-runner.js', tag: null, path: 'tests/legacy.js', status: 'skipped' }, // file without tag
];

test('filterTestFiles returns all files when query is empty and tag is all', () => {
  const result = filterTestFiles(MOCK_FILES, '');
  assert.equal(result.length, 5);
});

test('filterTestFiles filters by filename with case-insensitive matching', () => {
  const resultLower = filterTestFiles(MOCK_FILES, 'auth');
  assert.equal(resultLower.length, 1);
  assert.equal(resultLower[0].filename, 'auth-workflow.test.ts');

  const resultUpper = filterTestFiles(MOCK_FILES, 'AUTH');
  assert.equal(resultUpper.length, 1);
  assert.equal(resultUpper[0].filename, 'auth-workflow.test.ts');

  const resultPartial = filterTestFiles(MOCK_FILES, 'test.js');
  assert.equal(resultPartial.length, 3);
});

test('filterTestFiles filters by tag in search query', () => {
  const result = filterTestFiles(MOCK_FILES, 'finance');
  assert.equal(result.length, 1);
  assert.equal(result[0].filename, 'payments.test.js');

  const resultCore = filterTestFiles(MOCK_FILES, 'core');
  assert.equal(resultCore.length, 2);
  assert.deepEqual(
    resultCore.map((f) => f.id),
    [1, 4]
  );
});

test('filterTestFiles filters by selectedTag option', () => {
  const resultUi = filterTestFiles(MOCK_FILES, '', { selectedTag: 'ui' });
  assert.equal(resultUi.length, 1);
  assert.equal(resultUi[0].filename, 'shell-icon-contract.test.js');

  const combined = filterTestFiles(MOCK_FILES, 'smoke', { selectedTag: 'core' });
  assert.equal(combined.length, 1);
  assert.equal(combined[0].filename, 'smoke.test.js');

  const noMatchTag = filterTestFiles(MOCK_FILES, 'auth', { selectedTag: 'ui' });
  assert.equal(noMatchTag.length, 0);
});

test('filterTestFiles gracefully handles files without a tag without throwing', () => {
  const filesWithMissingTags = [
    { id: 10, filename: 'unadorned.test.js' },
    { id: 11, filename: 'null-label.test.js', tag: null },
    { id: 12, filename: 'undefined-label.test.js', tag: undefined },
  ];

  assert.doesNotThrow(() => {
    const res = filterTestFiles(filesWithMissingTags, 'security');
    assert.equal(res.length, 0);
  });

  const matched = filterTestFiles(filesWithMissingTags, 'unadorned');
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, 10);
});

test('filterTestFiles supports sorting options (name-asc, name-desc, tag)', () => {
  const sortedAsc = filterTestFiles(MOCK_FILES, '', { sortBy: 'name-asc' });
  assert.equal(sortedAsc[0].filename, 'auth-workflow.test.ts');
  assert.equal(sortedAsc[sortedAsc.length - 1].filename, 'smoke.test.js');

  const sortedDesc = filterTestFiles(MOCK_FILES, '', { sortBy: 'name-desc' });
  assert.equal(sortedDesc[0].filename, 'smoke.test.js');
  assert.equal(sortedDesc[sortedDesc.length - 1].filename, 'auth-workflow.test.ts');
});

test('highlightSegments splits text accurately for visual match feedback', () => {
  const segments = highlightSegments('auth-workflow.test.ts', 'auth');
  assert.equal(segments.length, 2);
  assert.equal(segments[0].text, 'auth');
  assert.equal(segments[0].isMatch, true);
  assert.equal(segments[1].text, '-workflow.test.ts');
  assert.equal(segments[1].isMatch, false);

  const emptyQuery = highlightSegments('auth.test.ts', '');
  assert.equal(emptyQuery.length, 1);
  assert.equal(emptyQuery[0].isMatch, false);
});

test('getTagTheme returns valid CSS classes for recognized and fallback tags', () => {
  const authTheme = getTagTheme('auth');
  assert.ok(authTheme.badgeBg.includes('indigo'));

  const coreTheme = getTagTheme('core');
  assert.ok(coreTheme.badgeBg.includes('blue'));

  const fallbackTheme = getTagTheme('custom-unknown');
  assert.ok(fallbackTheme.badgeBg.includes('slate'));
});

test('DEFAULT_TEST_FILES contains representative project test entries', () => {
  assert.ok(Array.isArray(DEFAULT_TEST_FILES));
  assert.ok(DEFAULT_TEST_FILES.length >= 10);
  for (const item of DEFAULT_TEST_FILES) {
    assert.ok(item.filename, 'each entry must have a filename');
    assert.ok(item.tag, 'each default entry should have a tag');
  }
});

test('TestFileSearch component source code satisfies design and accessibility contract', () => {
  assert.ok(
    componentSource.includes('export default function TestFileSearch'),
    'TestFileSearch must be default exported'
  );
  assert.ok(
    componentSource.includes('useMemo'),
    'TestFileSearch must use useMemo to optimize filtering'
  );
  assert.ok(
    componentSource.includes('useState'),
    'TestFileSearch must use useState for query state'
  );
  assert.ok(
    componentSource.includes('role="search"'),
    'TestFileSearch must include role="search"'
  );
  assert.ok(
    componentSource.includes('aria-live="polite"'),
    'TestFileSearch must provide accessible aria-live status count'
  );
  assert.ok(
    componentSource.includes('handleKeyDown') && componentSource.includes('Escape'),
    'TestFileSearch must support Esc key to clear input'
  );
  assert.ok(
    componentSource.includes('handleCopy'),
    'TestFileSearch must provide quick copy filename action'
  );
});
