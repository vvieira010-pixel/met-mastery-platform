import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const graphSource = fs.readFileSync(path.join(root, 'src', 'components', 'MetProgressPathGraph.jsx'), 'utf8');
const progressPageSource = fs.readFileSync(path.join(root, 'src', 'pages', 'student-progress.jsx'), 'utf8');
const dashboardSource = fs.readFileSync(path.join(root, 'src', 'components', 'StudentDashboard.jsx'), 'utf8');

test('MetProgressPathGraph component exists and implements MET path visualizations', () => {
  assert.ok(
    graphSource.includes('export default function MetProgressPathGraph'),
    'MetProgressPathGraph must be default exported'
  );
  assert.ok(
    graphSource.includes('Your MET progress path'),
    'MetProgressPathGraph must display "Your MET progress path"'
  );
  assert.ok(
    graphSource.includes('ResponsiveContainer') && graphSource.includes('AreaChart'),
    'MetProgressPathGraph must use Recharts AreaChart for path visualization'
  );
  assert.ok(
    graphSource.includes('53') && graphSource.includes('65'),
    'MetProgressPathGraph must include benchmark lines at 53 (B2 passing) and 65 (Exam target)'
  );
  assert.ok(
    graphSource.includes('toggle-path-overall') && graphSource.includes('toggle-path-skills'),
    'MetProgressPathGraph must provide controls for overall path and skill breakdowns'
  );
});

test('StudentProgress page integrates MetProgressPathGraph', () => {
  assert.ok(
    progressPageSource.includes("import MetProgressPathGraph from '../components/MetProgressPathGraph.jsx';"),
    'student-progress.jsx must import MetProgressPathGraph'
  );
  assert.ok(
    progressPageSource.includes('<MetProgressPathGraph'),
    'student-progress.jsx must render MetProgressPathGraph'
  );
});

test('StudentDashboard integrates MetProgressPathGraph with view switcher', () => {
  assert.ok(
    dashboardSource.includes("import MetProgressPathGraph from './MetProgressPathGraph.jsx';"),
    'StudentDashboard.jsx must import MetProgressPathGraph'
  );
  assert.ok(
    dashboardSource.includes('progressViewMode') && dashboardSource.includes('<MetProgressPathGraph'),
    'StudentDashboard.jsx must allow toggling to MetProgressPathGraph'
  );
});
