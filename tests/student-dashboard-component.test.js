import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src', 'components', 'StudentDashboard.jsx'), 'utf8');

test('StudentDashboard component source file exists and defines core modules', () => {
  assert.ok(source.includes('export default function StudentDashboard'), 'StudentDashboard component must be default exported');
  assert.ok(source.includes('Current Progress'), 'StudentDashboard must render current progress');
  assert.ok(source.includes('Upcoming Study Tasks'), 'StudentDashboard must render upcoming study tasks');
  assert.ok(source.includes('Recent Teacher Feedback'), 'StudentDashboard must render recent teacher feedback');
});

test('StudentDashboard includes interactive feedback and task completion handling', () => {
  assert.ok(source.includes('handleMarkUnderstood'), 'StudentDashboard must provide mark-as-understood action for feedback');
  assert.ok(source.includes('handleToggleTaskDone'), 'StudentDashboard must support task completion toggle');
  assert.ok(source.includes('handleSendFeedbackReply'), 'StudentDashboard must support sending replies/questions on teacher feedback');
});
