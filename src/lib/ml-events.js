/**
 * src/lib/ml-events.js — client-side learning event telemetry.
 *
 * Events land in public.learning_events, which is the raw longitudinal log the
 * Phase 2 mastery/IRT models need. Today most of this signal lives only in
 * localStorage, which is invisible to everything server-side.
 *
 * Contract: this module can never break the UI. No throw, no await, no network
 * on the hot path. Events are queued and flushed on idle; failures are dropped
 * (a dropped review event is a modelling inconvenience, not a user problem).
 */

const ENDPOINT = '/api/log-learning-events';
const MAX_QUEUE = 50;
const FLUSH_DELAY_MS = 1500;

const queue = [];
let timer = null;

function canSend() {
  // Skip entirely outside the browser (tests, SSR): Node has a global fetch but
  // no relative-URL base, so an unguarded flush would throw on every keypress.
  return typeof window !== 'undefined' && typeof window.fetch === 'function';
}

async function flush() {
  timer = null;
  if (!queue.length || !canSend()) return;
  const batch = queue.splice(0, MAX_QUEUE);
  try {
    await window.fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
      keepalive: batch.length < 10,
    });
  } catch {
    // Dropped on purpose. Do not re-queue: a failing endpoint would otherwise
    // retry forever and grow the queue without bound.
  }
}

function schedule() {
  if (timer !== null) return;
  timer = window.setTimeout(flush, FLUSH_DELAY_MS);
}

/**
 * Record one learning event. Safe to call from render paths — it only queues.
 *
 * @param {{eventType: string, itemId?: string, itemType?: string, skill?: string,
 *          correct?: boolean, score?: number, durationMs?: number, meta?: object}} event
 */
export function trackEvent(event) {
  if (!event || !event.eventType) return;
  if (!canSend()) return;
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push({
    eventType: event.eventType,
    itemId: event.itemId ?? null,
    itemType: event.itemType ?? null,
    skill: event.skill ?? null,
    correct: typeof event.correct === 'boolean' ? event.correct : null,
    score: Number.isFinite(event.score) ? event.score : null,
    durationMs: Number.isFinite(event.durationMs) ? event.durationMs : null,
    meta: event.meta || {},
  });
  schedule();
}

/** Force a flush — call on pagehide so in-flight reviews are not lost. */
export function flushEvents() {
  if (!canSend()) return Promise.resolve();
  return flush();
}

if (canSend()) {
  window.addEventListener('pagehide', () => {
    if (queue.length) void flush();
  });
}
