// Student -> Teacher interaction boundary tests.
//
// These exercise the REAL api/ handlers (get-submissions, save-submission,
// _supabase-auth) with a mocked global `fetch` standing in for Supabase, so no
// live credentials or network are required. They prove the security fixes from
// the audit hold:
//   #2 (S2): verifySupabaseSession rejects no-token / anon / forged / fail-closed
//   #1 (S1): get-submissions requires a session and scopes results to the
//            authenticated teacher (no cross-teacher PII), with a clamped limit
//   #3 (S3): save-submission enforces same-origin, teacher allowlist, field caps,
//            and fails closed when the service key is unset
//
// Run: npm test

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { verifySupabaseSession } from '../api/_supabase-auth.js';
import { requireServiceKey } from '../api/_config.js';
import getSubmissions from '../api/get-submissions.js';
import saveSubmission from '../api/save-submission.js';

// --- env + fetch mocking --------------------------------------------------

const ENV_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'VITE_TEACHER_EMAIL',
  'TEACHER_EMAIL',
  'APP_ORIGIN',
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
];

let savedEnv = {};
let realFetch = globalThis.fetch;
// Controls what /auth/v1/user returns for the session check.
let authUserResponse = { status: 200, body: { id: 'u1', email: 'teacher@example.com', role: 'authenticated' } };
// Captures the last REST call to Supabase so we can assert on URL/body.
let lastRestCall = null;

function installFetch() {
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    if (u.includes('/auth/v1/user')) {
      if (authUserResponse.status === 200) {
        return { ok: true, status: 200, json: async () => authUserResponse.body, text: async () => '' };
      }
      return { ok: false, status: authUserResponse.status, json: async () => ({}), text: async () => 'unauthorized' };
    }
    if (u.includes('/rest/v1/mock_test_results')) {
      const method = (opts.method || 'GET').toUpperCase();
      lastRestCall = {
        url: u,
        method,
        headers: opts.headers || {},
        body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : null,
      };
      if (method === 'POST') {
        return { ok: true, status: 200, json: async () => ({}), text: async () => '' };
      }
      // GET -> return one row tagged with the session teacher
      return {
        ok: true,
        status: 200,
        json: async () => ([{ id: 'r1', student_id: 's1', teacher_id: 'teachera@example.com', content: {}, created_at: new Date().toISOString() }]),
        text: async () => '',
      };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => 'not found' };
  };
}

beforeEach(() => {
  savedEnv = {};
  for (const k of ENV_KEYS) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  // Safe default environment for most tests.
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.VITE_TEACHER_EMAIL = 'teacher@example.com';
  process.env.APP_ORIGIN = 'https://app.example.com';
  authUserResponse = { status: 200, body: { id: 'u1', email: 'teacher@example.com', role: 'authenticated' } };
  lastRestCall = null;
  installFetch();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  globalThis.fetch = realFetch;
});

// --- helpers --------------------------------------------------------------

function makeRes() {
  const res = { statusCode: 200, body: null, headersSent: false };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

// --- #2 (S2): session verification ---------------------------------------

test('#2 S2: no Authorization header -> session rejected (null)', async () => {
  const user = await verifySupabaseSession({ headers: {} });
  assert.equal(user, null);
});

test('#2 S2: valid token -> authenticated user returned', async () => {
  authUserResponse = { status: 200, body: { id: 'u1', email: 'teacher@example.com', role: 'authenticated' } };
  const user = await verifySupabaseSession({ headers: { authorization: 'Bearer good-token' } });
  assert.ok(user && user.id === 'u1');
});

test('#2 S2: anon role rejected (null)', async () => {
  authUserResponse = { status: 200, body: { id: 'u1', email: 'student@example.com', role: 'anon' } };
  const user = await verifySupabaseSession({ headers: { authorization: 'Bearer anon-token' } });
  assert.equal(user, null);
});

test('#2 S2: forged/expired token (Supabase 401) rejected (null)', async () => {
  authUserResponse = { status: 401, body: {} };
  const user = await verifySupabaseSession({ headers: { authorization: 'Bearer forged' } });
  assert.equal(user, null);
});

test('#2 S2: missing service key -> fail-closed (null, no verification)', async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const user = await verifySupabaseSession({ headers: { authorization: 'Bearer anything' } });
  assert.equal(user, null);
});

// --- #1 (S1): get-submissions scoped to teacher --------------------------

test('#1 S1: no session -> 401 (no PII dump)', async () => {
  const res = makeRes();
  await getSubmissions({ method: 'GET', headers: {}, query: {} }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(lastRestCall, null, 'should not have hit the database');
});

test('#1 S1: valid session -> results scoped to the teacher email (no cross-teacher leak)', async () => {
  authUserResponse = { status: 200, body: { id: 'u1', email: 'teacherA@example.com', role: 'authenticated' } };
  const res = makeRes();
  await getSubmissions({ method: 'GET', headers: { authorization: 'Bearer good' }, query: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.ok(lastRestCall, 'should have queried the database');
  assert.match(lastRestCall.url, /teacher_id=eq\.teachera%40example\.com/);
  // A different teacher's email must never appear in the query string.
  assert.doesNotMatch(lastRestCall.url, /teacher_id=eq\.(teacherB|other|admin)@/);
});

test('#1 S1: limit is clamped to [1, 200]', async () => {
  authUserResponse = { status: 200, body: { id: 'u1', email: 'teacherA@example.com', role: 'authenticated' } };
  // too high
  let res = makeRes();
  await getSubmissions({ method: 'GET', headers: { authorization: 'Bearer good' }, query: { limit: '9999' } }, res);
  assert.match(lastRestCall.url, /limit=200/);
  // too low
  res = makeRes();
  await getSubmissions({ method: 'GET', headers: { authorization: 'Bearer good' }, query: { limit: '0' } }, res);
  assert.match(lastRestCall.url, /limit=1/);
  // normal
  res = makeRes();
  await getSubmissions({ method: 'GET', headers: { authorization: 'Bearer good' }, query: { limit: '50' } }, res);
  assert.match(lastRestCall.url, /limit=50/);
});

test('#1 S1: even a well-formed token is rejected when the server cannot verify (fail-closed 401)', async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const res = makeRes();
  await getSubmissions({ method: 'GET', headers: { authorization: 'Bearer good' }, query: {} }, res);
  assert.equal(res.statusCode, 401);
});

// --- #3 (S3): save-submission controls -----------------------------------

test('#3 S3: cross-origin request -> 403', async () => {
  const res = makeRes();
  await saveSubmission(
    { method: 'POST', headers: { origin: 'https://evil.example.com', 'content-type': 'application/json' },
      body: { teacherEmail: 'teacher@example.com', studentName: 'A', studentEmail: 'a@b.com' } },
    res,
  );
  assert.equal(res.statusCode, 403);
  assert.equal(lastRestCall, null);
});

test('#3 S3: same-origin but unknown teacher -> 403 (allowlist)', async () => {
  const res = makeRes();
  await saveSubmission(
    { method: 'POST', headers: { origin: 'https://app.example.com', 'content-type': 'application/json' },
      body: { teacherEmail: 'intruder@evil.com', studentName: 'A', studentEmail: 'a@b.com' } },
    res,
  );
  assert.equal(res.statusCode, 403);
  assert.equal(lastRestCall, null);
});

test('#3 S3: allowlisted teacher -> 200 and fields are size-capped', async () => {
  const res = makeRes();
  const longEmail = 'x'.repeat(500);
  const longAnswers = 'y'.repeat(30000);
  await saveSubmission(
    { method: 'POST', headers: { origin: 'https://app.example.com', 'content-type': 'application/json' },
      body: {
        teacherEmail: 'teacher@example.com',
        studentName: longEmail,
        studentEmail: longEmail,
        readingAnswers: longAnswers,
      } },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.ok(lastRestCall, 'should have inserted');
  assert.equal(lastRestCall.method, 'POST');
  const inserted = JSON.parse(lastRestCall.body);
  assert.equal(inserted.teacher_id, 'teacher@example.com');
  assert.ok(inserted.content.studentEmail.length <= 200, 'studentEmail must be capped at 200');
  assert.ok(inserted.content.studentName.length <= 200, 'studentName must be capped at 200');
  assert.ok(inserted.content.readingAnswers.length <= 20000, 'answers must be capped at 20000');
});

test('#3 S3: missing service key -> fail-closed 500 (same-origin + allowlisted still blocked)', async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const res = makeRes();
  await saveSubmission(
    { method: 'POST', headers: { origin: 'https://app.example.com', 'content-type': 'application/json' },
      body: { teacherEmail: 'teacher@example.com', studentName: 'A', studentEmail: 'a@b.com' } },
    res,
  );
  assert.equal(res.statusCode, 500);
  assert.equal(lastRestCall, null);
});

// --- config fail-closed helper -------------------------------------------

test('requireServiceKey fails closed without env key', () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
  const res = makeRes();
  const key = requireServiceKey(res);
  assert.equal(key, null);
  assert.equal(res.statusCode, 500);
});

test('requireServiceKey returns the key when configured', () => {
  const res = makeRes();
  const key = requireServiceKey(res);
  assert.equal(key, 'test-service-key');
});
