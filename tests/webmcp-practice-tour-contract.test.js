import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('WebMCP Practice tour exposes guide tools only', () => {
  const source = read('src/lib/webmcp-practice-tour.js');

  assert.match(source, /document\.modelContext/);
  assert.match(source, /TOOL_PREFIX = 'met_practice_tour_'/);
  for (const suffix of [
    'list_targets',
    'read_state',
    'read_instructions',
    'highlight_target',
    'dismiss_highlight',
    'wait_for_state_change',
  ]) {
    assert.match(source, new RegExp('TOOL_PREFIX}' + suffix));
  }

  assert.doesNotMatch(source, /handleTabChange|handleSelectMode|savePracticeSession/);
});

test('Practice tour targets are semantic and live in the existing learner UI', () => {
  const dashboard = read('src/pages/student-dashboard.jsx');
  const studio = read('src/pages/practice-studio.jsx');

  assert.match(dashboard, /practice-navigation/);
  assert.match(studio, /practice-skill-grammar/);
  assert.match(studio, /data-tour-target="practice-session"/);
});
