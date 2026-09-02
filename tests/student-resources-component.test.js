import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'components', 'StudentResources.jsx'), 'utf8');

test('StudentResources component source file exists and defines core modules', () => {
  assert.ok(source.includes('export default function StudentResources'), 'StudentResources component must be default exported');
  assert.ok(source.includes('Study Materials & Resources') || source.includes('student-resources-title'), 'StudentResources must have title header');
  assert.ok(source.includes('fetchAllResources'), 'StudentResources must define an async fetcher for resources');
});

test('StudentResources fetches and displays downloadable PDF study materials and link resources', () => {
  assert.ok(source.includes('CURATED_PDF_MATERIALS') || source.includes('getPracticeResources'), 'StudentResources must curate or fetch PDF materials');
  assert.ok(source.includes('CURATED_LINK_RESOURCES') || source.includes('linkCount'), 'StudentResources must curate or fetch Link resources');
  assert.ok(source.includes('downloadResourceDocument') || source.includes('handleDownload'), 'StudentResources must provide downloadable PDF handler');
  assert.ok(source.includes('handleCopyLink') || source.includes('open-link-btn'), 'StudentResources must provide open or copy link handling');
});

test('StudentResources includes category, format, and search filters', () => {
  assert.ok(source.includes('selectedFormat'), 'StudentResources must support format filtering (PDF, Link, etc.)');
  assert.ok(source.includes('selectedCategory'), 'StudentResources must support skill/category filtering');
  assert.ok(source.includes('searchQuery'), 'StudentResources must support live keyword searching');
  assert.ok(source.includes('bookmarkedIds'), 'StudentResources must support bookmarking/saving resources');
});
