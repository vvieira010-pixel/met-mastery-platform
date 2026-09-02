/**
 * api/get-submissions.js — list mock-test submissions for the AUTHENTICATED teacher.
 *
 * FIX (was S1 ship-blocker): the previous version accepted an attacker-controlled
 * `teacherEmail` query param and returned every row in mock_test_results (a full
 * PII dump) with no authentication. Now we require a valid Supabase session and
 * scope the query strictly to that teacher's email — no cross-teacher leakage.
 * 
 * Updated to use the new auth module (src/lib/auth/index.ts).
 */
import { verifySupabaseSession } from '../src/lib/auth/index.ts';
import { getSupabaseUrl, getServiceKey } from './_config.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifySupabaseSession(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized — valid teacher session required.' });
  }

  const serviceKey = getServiceKey();
  if (!serviceKey) {
    console.error('[api/get-submissions] SUPABASE_SERVICE_ROLE_KEY is not set — refusing request (fail-closed).');
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  const url = getSupabaseUrl();
  // Scope strictly to the AUTHENTICATED teacher's email. We do NOT trust a
  // client-supplied teacher id. A separate `profiles`-table role lookup was
  // removed: it added an unverified DB dependency (the `role` column contract
  // is not confirmed, see audit #10) and would 403 legitimate teachers whose
  // profile row differs. Session + email-scoping already prevents both unauth
  // access and cross-teacher PII leakage (S1).
  const teacherEmail = (user.email || '').toLowerCase();
  // Clamp limit to [1, 200]. Use Number.isNaN (not `|| 50`) so a literal 0
  // is clamped up to 1 rather than silently falling back to the default.
  const rawLimit = Number(req.query?.limit);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 50 : rawLimit, 1), 200);

  try {
    // Scope by the authenticated teacher only — never trust a client-supplied email.
    const endpoint =
      `${url}/rest/v1/mock_test_results` +
      `?teacher_id=eq.${encodeURIComponent(teacherEmail)}` +
      `&order=created_at.desc&limit=${limit}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Failed to fetch submissions', detail: errText });
    }

    const data = await response.json();
    const submissions = (data || []).map((row) => ({
      id: row.id,
      studentId: row.student_id,
      teacherId: row.teacher_id,
      content: row.content,
      createdAt: row.created_at,
    }));

    const stats = {
      total: submissions.length,
      uniqueStudents: [...new Set(submissions.map((s) => s.studentId))].length,
      recentWeek: submissions.filter((s) => {
        const d = new Date(s.createdAt);
        return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
      }).length,
    };

    return res.status(200).json({ submissions, stats });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}