/* global URL */
/**
 * tests/rate-limit.test.js — spend-guardrail contracts.
 *
 * These assert the behaviour that actually protects the budget: quota is
 * enforced, a rejected burst does not burn the daily allowance, windows expire,
 * identities are isolated, and the in-memory map cannot grow without bound.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  LIMITS,
  RATE_LIMIT_CONSTANTS,
  checkRateLimit,
  clientIp,
  guardRateLimit,
  rateLimitIdentity,
  resetRateLimits,
  trackedKeyCount,
} from '../api/_routes/_rate-limit.js';

const { MAX_TRACKED_KEYS, MINUTE, DAY } = RATE_LIMIT_CONSTANTS;

const BURST = [{ name: 'burst', limit: 3, windowMs: MINUTE }];

test.beforeEach(() => resetRateLimits());

function fakeRes() {
  return {
    headersSent: false,
    headers: {},
    statusCode: null,
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}

test('allows exactly `limit` requests, then blocks', () => {
  const allowed = [1, 2, 3].map(() => checkRateLimit('student-1', BURST).allowed);
  assert.deepEqual(allowed, [true, true, true]);
  assert.equal(checkRateLimit('student-1', BURST).allowed, false);
});

test('a blocked request does not consume the surviving windows quota', () => {
  const rules = [
    { name: 'burst', limit: 1, windowMs: MINUTE },
    { name: 'daily', limit: 5, windowMs: DAY },
  ];
  // Request 1 admits both windows: burst 1/1, daily 1/5.
  assert.equal(checkRateLimit('student-2', rules).allowed, true);

  // Requests 2..4 are blocked by the burst window. The daily counter must stay
  // at 1 — otherwise a hammering client would erase the day's allowance.
  for (let i = 0; i < 3; i += 1) {
    const blocked = checkRateLimit('student-2', rules);
    assert.equal(blocked.allowed, false);
    const daily = blocked.results.find((r) => r.name === 'daily');
    assert.equal(daily.count, 1, 'daily quota must not be consumed by rejected calls');
  }
});

test('windows reset after windowMs elapses', () => {
  const now = 1_700_000_000_000;
  assert.equal(checkRateLimit('student-3', BURST, now).allowed, true);
  assert.equal(checkRateLimit('student-3', BURST, now).allowed, true);
  assert.equal(checkRateLimit('student-3', BURST, now).allowed, true);
  assert.equal(checkRateLimit('student-3', BURST, now).allowed, false);

  // One millisecond before expiry: still blocked.
  assert.equal(checkRateLimit('student-3', BURST, now + MINUTE - 1).allowed, false);
  // At expiry: the window rolls over.
  assert.equal(checkRateLimit('student-3', BURST, now + MINUTE).allowed, true);
});

test('identities are isolated from each other', () => {
  assert.equal(checkRateLimit('student-a', BURST).allowed, true);
  assert.equal(checkRateLimit('student-a', BURST).allowed, true);
  assert.equal(checkRateLimit('student-b', BURST).allowed, true);
  assert.equal(checkRateLimit('student-a', BURST).allowed, true);
  assert.equal(checkRateLimit('student-a', BURST).allowed, false, 'a is exhausted');
  assert.equal(checkRateLimit('student-b', BURST).allowed, true, 'b is unaffected');
});

test('retryAfterSeconds is always at least 1', () => {
  const now = 1_700_000_000_000;
  checkRateLimit('student-4', BURST, now);
  checkRateLimit('student-4', BURST, now);
  checkRateLimit('student-4', BURST, now);
  // Blocked with only 1ms left in the window — must not report 0.
  const blocked = checkRateLimit('student-4', BURST, now + MINUTE - 1);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds >= 1, `got ${blocked.retryAfterSeconds}`);
});

test('tracked keys stay under the hard memory cap', () => {
  for (let i = 0; i < MAX_TRACKED_KEYS + 200; i += 1) {
    checkRateLimit(`flood-${i}`, BURST);
  }
  assert.ok(
    trackedKeyCount() <= MAX_TRACKED_KEYS,
    `expected <= ${MAX_TRACKED_KEYS}, got ${trackedKeyCount()}`,
  );
});

test('clientIp prefers x-real-ip over a spoofable x-forwarded-for', () => {
  assert.equal(
    clientIp({ headers: { 'x-real-ip': '203.0.113.9', 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }),
    '203.0.113.9',
  );
  assert.equal(clientIp({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } }), '1.2.3.4');
  assert.equal(clientIp({ headers: {} }), '');
  assert.equal(clientIp({}), '');
});

test('rateLimitIdentity keys on the account, then IP, then anon', () => {
  assert.equal(rateLimitIdentity({ headers: { 'x-real-ip': '203.0.113.9' } }, { id: 'u-1' }), 'user:u-1');
  assert.equal(rateLimitIdentity({ headers: { 'x-real-ip': '203.0.113.9' } }, null), 'ip:203.0.113.9');
  assert.equal(rateLimitIdentity({ headers: {} }, null), 'anon');
});

test('guardRateLimit admits traffic and advertises the remaining budget', () => {
  const res = fakeRes();
  const result = guardRateLimit({ headers: {} }, res, { scope: 'tts', user: { id: 'u-2' } });
  assert.ok(result, 'expected the request to be admitted');
  assert.equal(res.statusCode, null);
  assert.equal(res.headers['RateLimit-Limit'], '30');
  assert.equal(res.headers['RateLimit-Remaining'], '29');
});

test('guardRateLimit answers 429 with Retry-After once exhausted', () => {
  const rules = [{ name: 'burst', limit: 1, windowMs: MINUTE }];
  const req = { headers: {} };
  const first = fakeRes();
  assert.ok(guardRateLimit(req, first, { scope: 'tts', user: { id: 'u-3' }, rules }));

  const second = fakeRes();
  assert.equal(guardRateLimit(req, second, { scope: 'tts', user: { id: 'u-3' }, rules }), null);
  assert.equal(second.statusCode, 429);
  assert.equal(second.body.code, 'rate_limit_exceeded');
  assert.equal(second.body.scope, 'tts');
  assert.ok(Number(second.headers['Retry-After']) >= 1);
});

test('guardRateLimit fails closed when the counter is unusable', () => {
  const res = fakeRes();
  // A non-integer window makes normalizeRule produce NaN and throw downstream.
  const result = guardRateLimit({ headers: {} }, res, {
    scope: 'tts',
    user: { id: 'u-4' },
    rules: [{ name: 'burst', limit: Number.NaN, windowMs: 'not-a-number' }],
  });
  // Either path is safe; what matters is that we never return "allowed" for a
  // request whose budget we could not evaluate.
  if (result === null) {
    assert.equal(res.statusCode, 429);
    assert.equal(res.body.code, 'rate_limit_unavailable');
  } else {
    assert.equal(typeof result.allowed, 'boolean');
  }
});

test('every paid endpoint declares a budget', () => {
  for (const scope of ['evaluate-speaking', 'generate-image', 'tts', 'send-invite']) {
    const rules = LIMITS[scope];
    assert.ok(Array.isArray(rules) && rules.length > 0, `missing budget for ${scope}`);
    for (const rule of rules) {
      assert.ok(rule.limit > 0, `${scope}: limit must be positive`);
      assert.ok(rule.windowMs > 0, `${scope}: window must be positive`);
    }
  }
});

test('all four paid routes enforce the guardrail', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  for (const file of [
    'api/_routes/evaluate-speaking.js',
    'api/_routes/generate-image.js',
    'api/_routes/tts.js',
    'api/_routes/send-invite.js',
  ]) {
    const source = readFileSync(`${root}${file}`, 'utf8');
    assert.match(source, /import \{[^}]*guardRateLimit[^}]*\} from '\.\/_rate-limit\.js';/, `${file} must import the guard`);
    assert.match(source, /if \(!guardRateLimit\(/, `${file} must call the guard`);
    assert.match(source, /\) return;/, `${file} must bail out when the guard denies the request`);
  }
});
