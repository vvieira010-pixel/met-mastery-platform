import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { createPracticeStudioSessionKey } from '../src/domain/practice.js';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('Practice Studio uses one stable final-submission key per student topic', () => {
  const base = { mode: 'speaking', topicId: 'Q3::education', speakingQuestion: 'Q3' };
  assert.equal(
    createPracticeStudioSessionKey(base),
    createPracticeStudioSessionKey({ ...base, listeningPart: null }),
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

test('final Practice Studio attempts require Supabase and do not fall back to localStorage', () => {
  const source = read('src/domain/practice.js');
  const adapter = read('src/lib/supabase-db.js');
  assert.match(source, /Sign in to Supabase before submitting Practice Studio work\./);
  assert.match(source, /await dbUpsert\('practiceSubmissions', record\)/);
  assert.match(source, /dbList\('practiceSubmissions', \{ fresh: true \}\)/);
  assert.match(adapter, /dbList\(entityKey, \{ fresh = false \} = \{\}\)/);
  const dedicatedBlock = source.slice(source.indexOf('export async function getPracticeStudioSubmission'), source.indexOf('/* ─── ERROR BANK'));
  assert.doesNotMatch(dedicatedBlock, /save\(K\.practiceSubmissions/);
});

test('the database schema enforces one submitted topic and RLS ownership', () => {
  const migration = read('supabase/migrations/20260905000000_practice_studio_submissions.sql');
  assert.match(migration, /practice_submissions_student_session_key_unique/);
  assert.match(migration, /\(student_id, \(content ->> 'sessionKey'\)\)/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /student\.auth_user_id = auth\.uid\(\)/);
  assert.match(migration, /student\.teacher_id = practice_submissions\.teacher_id/);
  assert.match(migration, /practice_submissions_teacher_manage_roster/);
});
