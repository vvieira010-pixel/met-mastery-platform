/**
 * tests/supabase-auth.test.js — Supabase auth verifier contracts.
 *
 * Covers the M-2 fix: local JWT verification via JWKS must be attempted first,
 * with a network fallback for edge cases.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  verifySupabaseSession,
  verifySupabaseSessionLocal,
} from '../api/_routes/_supabase-auth.js';

test('missing authorization header returns null', async () => {
  assert.equal(await verifySupabaseSession({ headers: {} }), null);
  assert.equal(await verifySupabaseSessionLocal({ headers: {} }), null);
});

test('empty bearer token returns null', async () => {
  assert.equal(await verifySupabaseSession({ headers: { authorization: 'Bearer ' } }), null);
  assert.equal(await verifySupabaseSessionLocal({ headers: { authorization: 'Bearer ' } }), null);
});

test('malformed token returns null from local verifier', async () => {
  const req = { headers: { authorization: 'Bearer not-a-jwt' } };
  assert.equal(await verifySupabaseSessionLocal(req), null);
});

test('verifySupabaseSessionLocal is exported', () => {
  assert.equal(typeof verifySupabaseSessionLocal, 'function');
});

test('verifySupabaseSession is exported', () => {
  assert.equal(typeof verifySupabaseSession, 'function');
});

test('source imports jose for local JWT verification', () => {
  const source = readFileSync('api/_routes/_supabase-auth.js', 'utf8');
  assert.match(source, /from ['"]jose['"]/);
  assert.match(source, /jwtVerify/);
  assert.match(source, /createRemoteJWKSet/);
});

test('source constructs JWKS URL from Supabase URL', () => {
  const source = readFileSync('api/_routes/_supabase-auth.js', 'utf8');
  assert.match(source, /\.well-known\/jwks\.json/);
});

test('source attempts local verification before network fallback', () => {
  const source = readFileSync('api/_routes/_supabase-auth.js', 'utf8');
  const localIdx = source.indexOf('verifySupabaseSessionLocal');
  const fetchIdx = source.indexOf('fetch(');
  assert.ok(localIdx < fetchIdx, 'local call must appear before network fetch');
});

test('source passes clockTolerance to jwtVerify', () => {
  const source = readFileSync('api/_routes/_supabase-auth.js', 'utf8');
  assert.match(source, /clockTolerance/);
});
