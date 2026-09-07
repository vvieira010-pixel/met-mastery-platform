/**
 * tests/ml-telemetry.test.js — Phase 0 measurement foundation.
 *
 * These cover the parts that must be exactly right: pseudonymisation (a leak
 * here is a privacy incident), cost math (a bug here hides a cost regression),
 * and the never-throws contract (a throw here takes down a user-facing feature).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { sha256, subjectRef, inputHash, promptSha } from '../api/_ml/hash.js';
import { estimateCost } from '../api/_ml/pricing.js';
import { buildPredictionRecord, compactJson } from '../api/_ml/log.js';
import { buildEventRecord, isKnownEventType } from '../api/_ml/events.js';
import { telemetryEnabled } from '../api/_ml/store.js';
import { getActive, clearRegistryCache } from '../api/_ml/registry.js';

test('subjectRef never stores the raw identifier', () => {
  const ref = subjectRef('student@example.com');
  assert.equal(ref.length, 32);
  assert.match(ref, /^[0-9a-f]{32}$/);
  assert.notEqual(ref, 'student@example.com');
  assert.notEqual(ref, sha256('student@example.com')); // salted, so not a bare digest either
});

test('subjectRef is stable and case-insensitive', () => {
  assert.equal(subjectRef('Ana@Example.com'), subjectRef('ana@example.com'));
});

test('subjectRef returns null for empty input', () => {
  assert.equal(subjectRef(''), null);
  assert.equal(subjectRef(null), null);
  assert.equal(subjectRef(undefined), null);
});

test('subjectRef changes when AI_TELEMETRY_SALT changes', async () => {
  const before = process.env.AI_TELEMETRY_SALT;
  process.env.AI_TELEMETRY_SALT = 'salt-a';
  const modA = await import('../api/_ml/hash.js?salt=a');
  process.env.AI_TELEMETRY_SALT = 'salt-b';
  const modB = await import('../api/_ml/hash.js?salt=b');
  assert.notEqual(modA.subjectRef('x@y.com'), modB.subjectRef('x@y.com'));
  if (before === undefined) delete process.env.AI_TELEMETRY_SALT;
  else process.env.AI_TELEMETRY_SALT = before;
});

test('inputHash is order-sensitive so different prompts do not collide', () => {
  assert.notEqual(inputHash(['a', 'b']), inputHash(['b', 'a']));
  assert.equal(inputHash(['a', 'b']), inputHash(['a', 'b']));
});

test('promptSha is unversioned for empty prompts', () => {
  assert.equal(promptSha(''), 'unversioned');
  assert.equal(promptSha(null), 'unversioned');
  assert.notEqual(promptSha('a'), promptSha('b'));
});

test('estimateCost uses the model rate and flags estimation', () => {
  // gemini-2.5-flash: 0.30 in / 2.50 out per 1M tokens. 4000 chars -> 1000 tok.
  const r = estimateCost({ modelId: 'gemini-2.5-flash', promptChars: 4000, completionChars: 400 });
  assert.equal(r.promptTokens, 1000);
  assert.equal(r.completionTokens, 100);
  assert.equal(r.tokensEstimated, true);
  assert.ok(Math.abs(r.costUsd - 0.00055) < 1e-9);
});

test('estimateCost prefers reported usage over the char estimate', () => {
  const r = estimateCost({ modelId: 'gemini-2.5-flash', promptChars: 4000, completionChars: 400, promptTokens: 10, completionTokens: 10 });
  assert.equal(r.promptTokens, 10);
  assert.equal(r.tokensEstimated, false);
});

test('unknown models are never priced at zero', () => {
  const r = estimateCost({ modelId: 'some-future-model', promptChars: 4000, completionChars: 4000 });
  assert.ok(r.costUsd > 0, 'an unpriced model must not look free');
});

test('free-tier models are priced at zero', () => {
  const r = estimateCost({ modelId: 'qwen/qwen3-235b-a22b:free', promptChars: 4000, completionChars: 4000 });
  assert.equal(r.costUsd, 0);
});

test('buildPredictionRecord pseudonymises the subject and defaults sanely', () => {
  const row = buildPredictionRecord({
    feature: 'writing_eval',
    subject: 'ana@example.com',
    modelId: 'gemini-2.5-flash',
    inputChars: 1000,
    outputChars: 500,
    latencyMs: 1234.6,
  });
  assert.equal(row.feature, 'writing_eval');
  assert.notEqual(row.subject_ref, 'ana@example.com');
  assert.equal(row.status, 'ok');
  assert.equal(row.latency_ms, 1235);
  assert.equal(row.prompt_sha, 'unversioned');
  assert.ok(row.cost_usd > 0);
});

test('buildPredictionRecord caps oversized parsed output', () => {
  const big = { text: 'x'.repeat(9000) };
  const row = buildPredictionRecord({ feature: 'f', parsedOutput: big });
  assert.equal(row.parsed_output.truncated, true);
  assert.ok(row.parsed_output.preview.length <= 4000);
  assert.ok(JSON.stringify(row.parsed_output).length < 5000);
});

test('buildPredictionRecord caps error strings', () => {
  const row = buildPredictionRecord({ feature: 'f', status: 'provider_error', error: 'e'.repeat(5000) });
  assert.equal(row.error.length, 500);
});

test('compactJson leaves small payloads untouched', () => {
  const small = { a: 1 };
  assert.equal(compactJson(small), small);
  assert.equal(compactJson(null), null);
});

test('buildEventRecord refuses to write an unattributable event', () => {
  const row = buildEventRecord({ eventType: 'review' });
  assert.equal(row.subject_ref, 'unknown');
  assert.equal(row.event_type, 'review');
  assert.equal(row.correct, null);
});

test('isKnownEventType gates the event vocabulary', () => {
  assert.equal(isKnownEventType('review'), true);
  assert.equal(isKnownEventType('made_up_thing'), false);
});

test('telemetry can be switched off', () => {
  const before = process.env.AI_TELEMETRY;
  process.env.AI_TELEMETRY = '0';
  assert.equal(telemetryEnabled(), false);
  process.env.AI_TELEMETRY = '1';
  assert.equal(telemetryEnabled(), true);
  if (before === undefined) delete process.env.AI_TELEMETRY;
  else process.env.AI_TELEMETRY = before;
});

test('registry falls back instead of failing when the table is unreachable', async () => {
  clearRegistryCache();
  const fallback = { version: 'unversioned', promptSha: 'unversioned' };
  const active = await getActive('model', 'ai_proxy', fallback);
  assert.equal(active, fallback);
});
