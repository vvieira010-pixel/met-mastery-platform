/**
 * api/save-submission.js — persist a mock-test submission.
 *
 * FIX (was S3 ship-blocker): the previous version inserted an attacker-controlled
 * row into mock_test_results via the service-role key with only a name/email
 * presence check — anyone could poison any teacher's data. The static mock-test-3
 * client cannot send a Supabase session, so full auth is not possible here; we
 * instead enforce: (1) same-origin, (2) teacher must be in the allowlist, and
 * (3) field-size caps. The service-role key is now read from env and fails closed.
 *
 * Prefer calling this from an authenticated context; the React SPA writes
 * submissions through Supabase directly (RLS-protected), not via this route.
 */
import { getSupabaseUrl, requireServiceKey, allowedTeacherEmails, isSameOrigin } from './_config.js';

const cap = (v, n) => (typeof v === 'string' ? v.slice(0, n) : v);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // (1) Block blind cross-origin inserts (CSRF-style abuse).
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden — cross-origin request.' });
  }

  const serviceKey = requireServiceKey(res);
  if (!serviceKey) return;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // (2) Teacher must be an authorized teacher.
  const teacherEmail = (body.teacherEmail || '').toLowerCase();
  const teachers = allowedTeacherEmails();
  if (teachers.length && !teachers.includes(teacherEmail)) {
    return res.status(403).json({ error: 'Forbidden — unknown teacher.' });
  }

  if (!body.studentName && !body.studentEmail) {
    return res.status(400).json({ error: 'Missing student info' });
  }

  try {
    const url = getSupabaseUrl();
    const response = await fetch(`${url}/rest/v1/mock_test_results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        student_id: cap(body.studentEmail, 200),
        teacher_id: teacherEmail || null,
        content: {
          studentName: cap(body.studentName, 200),
          studentEmail: cap(body.studentEmail, 200),
          submittedAt: body.submittedAt || new Date().toISOString(),
          sessionId: cap(body.sessionId || '', 100),
          scores: (() => { try { return JSON.parse(body.scores || '{}'); } catch { return {}; } })(),
          sectionsCompleted: cap(body.sectionsCompleted || '', 200),
          readingAnswers: cap(body.readingAnswers || '', 20000),
          listeningAnswers: cap(body.listeningAnswers || '', 20000),
          writingAnswers: cap(body.writingAnswers || '', 20000),
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Supabase insert failed:', response.status, errText);
      return res.status(502).json({ error: 'Failed to save submission', detail: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('save-submission error:', e);
    return res.status(500).json({ error: e.message });
  }
}
