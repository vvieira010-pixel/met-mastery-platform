/**
 * api/save-submission.js — persist a mock-test submission.
 *
 * This is a teacher-only administrative write. Public static mock-test pages
 * do not have an authenticated identity, so they must never be allowed to
 * create rows through a service-role key. Their local results stay local until
 * an authenticated product flow owns a student-to-teacher submission contract.
 */
import { getSupabaseUrl, requireServiceKey, isSameOrigin } from './_config.js';
import { requireTeacher } from './_supabase-auth.js';

const cap = (v, n) => (typeof v === 'string' ? v.slice(0, n) : v);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // (1) Block blind cross-origin inserts (CSRF-style abuse).
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden — cross-origin request.' });
  }

  const teacher = await requireTeacher(req, res);
  if (!teacher) return;

  const serviceKey = requireServiceKey(res);
  if (!serviceKey) return;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

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
        teacher_id: teacher.email.toLowerCase(),
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
      console.error('Supabase insert failed:', response.status);
      return res.status(502).json({ error: 'Failed to save submission' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('save-submission error:', e);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
