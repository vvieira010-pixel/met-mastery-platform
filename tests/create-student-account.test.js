import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

import createStudentAccount from '../api/_routes/create-student-account.js';

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
let authUser = { id: 'teacher-1', email: 'teacher@example.com', role: 'authenticated' };
let rosterStudent = { id: 'student-row-1', teacher_id: 'teacher-1', email: 'student@example.com', auth_user_id: null };
let authCreateStatus = 200;
let linkStatus = 204;
let calls = [];

function makeRes() {
  const res = { statusCode: 200, body: null, headersSent: false };
  res.status = (statusCode) => { res.statusCode = statusCode; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

function response(status, body = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) };
}

function installFetch() {
  globalThis.fetch = async (url, options = {}) => {
    const target = String(url);
    calls.push({ url: target, options });
    if (target.includes('/auth/v1/user')) return response(200, authUser);
    if (target.includes('/rest/v1/students?local_id=')) return response(200, [rosterStudent]);
    if (target.endsWith('/auth/v1/admin/users')) {
      return response(authCreateStatus, authCreateStatus < 300 ? { user: { id: 'auth-student-1' } } : { message: 'Already registered' });
    }
    if (target.includes('/rest/v1/students?id=eq.')) return response(linkStatus);
    if (target.includes('/auth/v1/admin/users/auth-student-1')) return response(204);
    return response(404);
  };
}

function request(body = {}, headers = {}) {
  return {
    method: 'POST',
    headers: {
      origin: 'https://app.example.com',
      authorization: 'Bearer teacher-session',
      ...headers,
    },
    body: {
      studentId: 'local-student-1',
      email: 'student@example.com',
      name: 'Student One',
      password: 'Met-password-123',
      ...body,
    },
  };
}

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.TEACHER_EMAIL = 'teacher@example.com';
  process.env.APP_ORIGIN = 'https://app.example.com';
  authUser = { id: 'teacher-1', email: 'teacher@example.com', role: 'authenticated' };
  rosterStudent = { id: 'student-row-1', teacher_id: 'teacher-1', email: 'student@example.com', auth_user_id: null };
  authCreateStatus = 200;
  linkStatus = 204;
  calls = [];
  installFetch();
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  globalThis.fetch = realFetch;
});

test('creates and links a Supabase Auth account only for the teacher roster row', async () => {
  const res = makeRes();
  await createStudentAccount(request(), res);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { ok: true, email: 'student@example.com', studentId: 'local-student-1', authUserId: 'auth-student-1' });
  assert.equal(Object.hasOwn(res.body, 'password'), false, 'password must not be returned by the server');

  const createCall = calls.find((call) => call.url.endsWith('/auth/v1/admin/users'));
  assert.ok(createCall, 'must use the server-only Supabase Admin endpoint');
  assert.equal(createCall.options.headers.Authorization, 'Bearer test-service-key');
  const payload = JSON.parse(createCall.options.body);
  assert.equal(payload.email_confirm, true);
  assert.equal(payload.app_metadata.role, 'student');
  assert.equal(payload.password, 'Met-password-123');

  const linkCall = calls.find((call) => call.url.includes('/rest/v1/students?id=eq.student-row-1'));
  assert.ok(linkCall, 'must link the created Auth user to the roster row');
  assert.deepEqual(JSON.parse(linkCall.options.body), { auth_user_id: 'auth-student-1' });
});

test('rejects a non-allowlisted authenticated user before reading the roster', async () => {
  authUser = { id: 'other-1', email: 'other@example.com', role: 'authenticated' };
  const res = makeRes();
  await createStudentAccount(request(), res);

  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /configured teacher/i);
  assert.equal(calls.some((call) => call.url.includes('/rest/v1/students?')), false);
});

test('rejects an account when the roster row belongs to a different teacher', async () => {
  rosterStudent = { ...rosterStudent, teacher_id: 'other-teacher' };
  const res = makeRes();
  await createStudentAccount(request(), res);

  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /your own roster/i);
  assert.equal(calls.some((call) => call.url.endsWith('/auth/v1/admin/users')), false);
});

test('rejects weak passwords before touching Supabase Auth administration', async () => {
  const res = makeRes();
  await createStudentAccount(request({ password: 'too-short' }), res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /12/);
  assert.equal(calls.some((call) => call.url.endsWith('/auth/v1/admin/users')), false);
});

test('removes a newly created account if its roster link cannot be saved', async () => {
  linkStatus = 500;
  const res = makeRes();
  await createStudentAccount(request(), res);

  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /No account was kept/i);
  assert.ok(calls.some((call) => call.url.includes('/auth/v1/admin/users/auth-student-1') && call.options.method === 'DELETE'));
});
