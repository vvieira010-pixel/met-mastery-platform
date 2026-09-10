/**
 * api/create-zoom-meeting.js — Create a Zoom meeting via JWT app
 *
 * Environment variables (server-only):
 *   ZOOM_API_KEY     - Zoom JWT App ID
 *   ZOOM_API_SECRET  - Zoom JWT App Secret
 *   ZOOM_USER_ID     - Optional: Zoom user ID (default: 'me' for JWT app owner)
 *
 * POST body:
 *   { topic, startTime, duration, timezone, password? }
 *
 * Returns: { ok: true, joinUrl, meetingId, password? } or { ok: false, error }
 */

import { verifySupabaseSession } from './_supabase-auth.js';
import { guardRateLimit } from './_rate-limit.js';
import { createMeeting, isZoomConfigured } from './_zoom.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const user = await verifySupabaseSession(req);
  if (!user) {
    return res.status(401).json({ error: { message: 'Sign-in required' } });
  }

  if (!guardRateLimit(req, res, { scope: 'zoom-meeting', user })) return;

  if (!isZoomConfigured()) {
    return res.status(503).json({
      error: { message: 'Zoom integration not configured. Set ZOOM_API_KEY and ZOOM_API_SECRET in server environment.' }
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { topic, startTime, duration, timezone, password } = body;

  if (!topic || !startTime) {
    return res.status(400).json({ error: { message: 'topic and startTime are required' } });
  }

  try {
    const meeting = await createMeeting({
      topic: String(topic),
      startTime: String(startTime),
      duration: duration || 60,
      timezone: timezone || 'America/Sao_Paulo',
      password: password || null,
    });

    return res.status(200).json({
      ok: true,
      joinUrl: meeting.join_url,
      meetingId: meeting.id,
      password: meeting.password,
      startUrl: meeting.start_url,
    });
  } catch (e) {
    console.error('[create-zoom-meeting] error:', e);
    return res.status(502).json({ error: { message: e.message || 'Failed to create Zoom meeting' } });
  }
}