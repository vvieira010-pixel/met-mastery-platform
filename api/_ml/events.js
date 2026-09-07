/**
 * api/_ml/events.js — learning event log.
 *
 * public.learning_events is the raw longitudinal record: every review, answer and
 * submission outcome, keyed by a pseudonymous subject_ref. It replaces the
 * localStorage-only spaced-repetition state that ML currently cannot see, and it
 * is the input to the Phase 2 IRT / BKT models.
 *
 * Call sites should treat this as write-only telemetry: same non-blocking,
 * never-throws contract as logPrediction.
 */
import { insertRows, telemetryEnabled } from './store.js';
import { subjectRef } from './hash.js';

const VALID_EVENT_TYPES = new Set([
  'review',
  'item_answered',
  'submission_created',
  'submission_reviewed',
  'homework_assigned',
  'homework_submitted',
  'diagnostic_completed',
  'mock_test_completed',
  'error_logged',
  'error_solved',
]);

/** Pure builder — exported for tests. */
export function buildEventRecord(input = {}) {
  const {
    subject,
    eventType,
    itemId = null,
    itemType = null,
    skill = null,
    correct = null,
    score = null,
    durationMs = null,
    source = 'web',
    meta = {},
    now = Date.now(),
  } = input;

  return {
    created_at: new Date(now).toISOString(),
    subject_ref: subjectRef(subject) || 'unknown',
    event_type: String(eventType || 'unknown').slice(0, 64),
    item_id: itemId ? String(itemId).slice(0, 128) : null,
    item_type: itemType ? String(itemType).slice(0, 64) : null,
    skill: skill ? String(skill).slice(0, 64) : null,
    correct: typeof correct === 'boolean' ? correct : null,
    score: Number.isFinite(score) ? Number(score) : null,
    duration_ms: Number.isFinite(durationMs) ? Math.max(0, Math.round(durationMs)) : null,
    source: String(source || 'web').slice(0, 32),
    meta: meta && typeof meta === 'object' ? meta : {},
  };
}

export function isKnownEventType(eventType) {
  return VALID_EVENT_TYPES.has(eventType);
}

/**
 * @returns {Promise<{ok: boolean, reason: string|null, skipped: number}>}
 */
export async function logEvents(events) {
  if (!telemetryEnabled()) return { ok: false, reason: 'disabled', skipped: Array.isArray(events) ? events.length : 0 };
  const list = Array.isArray(events) ? events : [events];
  const rows = list
    .filter((e) => e && e.eventType)
    .map(buildEventRecord)
    .filter((r) => r.subject_ref !== 'unknown');
  if (!rows.length) return { ok: true, reason: null, skipped: list.length };
  const result = await insertRows('learning_events', rows);
  return { ...result, skipped: list.length - rows.length };
}

export async function logEvent(event) {
  return logEvents([event]);
}
