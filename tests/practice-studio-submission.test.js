import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createPracticeStudioExerciseKey, createPracticeStudioSessionKey } from '../src/domain/practice.js';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('Practice Studio uses one stable submission key per question', () => {
  const base = { mode: 'speaking', topicId: 'Q3::education', speakingQuestion: 'Q3' };
  assert.equal(
    createPracticeStudioSessionKey(base),
    createPracticeStudioSessionKey({ ...base, listeningPart: null }),
  );
  assert.equal(
    createPracticeStudioExerciseKey(base, { id: 'spk-q3-personal-opinion' }),
    createPracticeStudioExerciseKey({ ...base, listeningPart: null }, { id: 'spk-q3-personal-opinion' }),
  );
  assert.notEqual(
    createPracticeStudioExerciseKey(base, { id: 'spk-q3-personal-opinion' }),
    createPracticeStudioExerciseKey(base, { id: 'spk-q3-family-time' }),
  );
  assert.notEqual(
    createPracticeStudioSessionKey(base),
    createPracticeStudioSessionKey({ ...base, topicId: 'Q3::healthcare' }),
  );
  assert.notEqual(
    createPracticeStudioSessionKey(base),
    createPracticeStudioSessionKey({ ...base, speakingQuestion: 'Q4', topicId: 'Q4::education' }),
  );
});

test('individual Practice Studio questions require Supabase and do not fall back to localStorage', () => {
  const source = read('src/domain/practice.js');
  const adapter = read('src/lib/supabase-db.js');
  assert.match(source, /Sign in to Supabase before submitting Practice Studio work\./);
  assert.match(source, /await dbUpsert\('practiceSubmissions', record\)/);
  assert.match(source, /dbList\('practiceSubmissions', \{ fresh: true \}\)/);
  assert.match(adapter, /dbList\(entityKey, \{ fresh = false \} = \{\}\)/);
  assert.match(source, /export async function getPracticeStudioExerciseSubmissions/);
  assert.match(source, /export async function submitPracticeStudioExercise/);
  assert.match(source, /type: 'practice_studio_exercise'/);
  const dedicatedBlock = source.slice(source.indexOf('export async function getPracticeStudioExerciseSubmissions'), source.indexOf('/* ─── ERROR BANK'));
  assert.doesNotMatch(dedicatedBlock, /save\(K\.practiceSubmissions/);
});

test('the database schema enforces one submitted question and RLS ownership', () => {
  const migration = read('supabase/migrations/20260905000000_practice_studio_submissions.sql');
  assert.match(migration, /practice_submissions_student_session_key_unique/);
  assert.match(migration, /\(student_id, \(content ->> 'sessionKey'\)\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /student\.auth_user_id = auth\.uid\(\)/);
  assert.match(migration, /student\.teacher_id = practice_submissions\.teacher_id/);
  assert.match(migration, /practice_submissions_teacher_manage_roster/);
});

test('Practice Studio saves each question once and reopens saved AI feedback in read-only mode', () => {
  const page = read('src/pages/practice-studio.jsx');
  const player = read('src/components/exercises/ExercisePlayer.jsx');
  assert.match(page, /getPracticeStudioExerciseSubmissions/);
  assert.match(page, /submitPracticeStudioExercise/);
  assert.match(page, /const savedResults = useMemo/);
  assert.match(page, /initialResults=\{savedResults\}/);
  assert.match(page, /onExerciseComplete=\{handleExerciseComplete\}/);
  assert.match(page, /You may record again as often as you need\./);
  assert.doesNotMatch(page, /requireFinalSubmission/);
  assert.match(player, /await onExerciseComplete\?\.\(/);
  assert.match(player, /You can revisit its feedback any time\./);
});
