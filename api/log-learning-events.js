/**
 * api/log-learning-events.js — client → public.learning_events.
 *
 * Accepts a small batch of learning events from the browser and persists them
 * with a pseudonymous subject derived from the caller's session (never a
 * client-supplied identity, so a caller cannot attribute events to someone else).
 *
 * Best-effort by design: the client drops failures silently, and this endpoint
 * returns 200 with accepted=0 rather than erroring when the table is missing.
 */
import { verifySupabaseSession } from './_supabase-auth.js';
import { logEvents } from './_ml/events.js';
import { telemetryEnabled } from './_ml/store.js';

const MAX_BATCH = 50;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!telemetryEnabled()) {
    return res.status(200).json({ ok: true, accepted: 0, reason: 'telemetry-disabled' });
  }

  const user = await verifySupabaseSession(req).catch(() => null);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized — valid session required.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const events = Array.isArray(body?.events) ? body.events.slice(0, MAX_BATCH) : [];
  if (!events.length) {
    return res.status(200).json({ ok: true, accepted: 0 });
  }

  const result = await logEvents(events.map((e) => ({
    ...e,
    // Server-side identity wins. A client-supplied subject is ignored.
    subject: (user.email || user.id || '').toLowerCase() || null,
    source: 'web',
  })));

  return res.status(200).json({ ok: true, accepted: result.ok ? events.length - result.skipped : 0 });
}
