/**
 * Provision a password login for a teacher's existing roster student.
 *
 * This is deliberately a server-only operation. The service-role key never
 * reaches the browser; a valid, allowlisted teacher session is required, and
 * the roster row must already belong to that teacher.
 */
import { allowedTeacherEmails, getSupabaseUrl, isSameOrigin, requireServiceKey } from './_config.js';
import { verifySupabaseSession } from './_supabase-auth.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_STUDENT_ID = 160;
const MAX_NAME = 160;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

function messageFrom(data, fallback) {
  return data?.msg || data?.message || data?.error_description || data?.error || fallback;
}

function serviceHeaders(serviceKey, extra = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function responseBody(response) {
  return response.json().catch(() => ({}));
}

async function removeProvisionedUser(url, serviceKey, authUserId) {
  if (!authUserId) return;
  try {
    await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(authUserId)}`, {
      method: 'DELETE',
      headers: serviceHeaders(serviceKey),
    });
  } catch {
    // The request has already failed safely. Do not reveal cleanup details.
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Requests must come from this app.' });
  }

  const serviceKey = requireServiceKey(res);
  if (!serviceKey) return;

  const teacher = await verifySupabaseSession(req).catch(() => null);
  if (!teacher) {
    return res.status(401).json({ error: 'Teacher sign-in required.' });
  }

  // An empty allowlist must never turn this account-provisioning endpoint into
  // an authenticated-user provisioning endpoint.
  const teacherEmails = allowedTeacherEmails();
  if (!teacherEmails.length) {
    return res.status(503).json({ error: 'Student account creation is not configured for this deployment.' });
  }
  if (!teacherEmails.includes(String(teacher.email || '').trim().toLowerCase())) {
    return res.status(403).json({ error: 'Only the configured teacher can create student accounts.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, MAX_NAME) : '';
  // Do not trim a password: leading or trailing characters are valid password
  // characters and the exact value is what the teacher will copy to the student.
  const password = typeof body.password === 'string' ? body.password : '';

  if (!studentId || studentId.length > MAX_STUDENT_ID) {
    return res.status(400).json({ error: 'A valid roster student is required.' });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'A valid student email is required.' });
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters.` });
  }

  const url = getSupabaseUrl();
  const rosterUrl = `${url}/rest/v1/students?local_id=eq.${encodeURIComponent(studentId)}&select=id,teacher_id,email,auth_user_id&limit=1`;
  let rosterResponse;
  try {
    rosterResponse = await fetch(rosterUrl, { headers: serviceHeaders(serviceKey) });
  } catch {
    return res.status(502).json({ error: 'Could not verify the student roster.' });
  }
  const rosterRows = await responseBody(rosterResponse);
  if (!rosterResponse.ok) {
    return res.status(502).json({ error: 'Could not verify the student roster.' });
  }
  const rosterStudent = Array.isArray(rosterRows) ? rosterRows[0] : null;
  if (!rosterStudent) {
    return res.status(404).json({ error: 'Student was not found in your roster. Save the student first, then create their login.' });
  }
  if (rosterStudent.teacher_id !== teacher.id) {
    return res.status(403).json({ error: 'You can only create accounts for students in your own roster.' });
  }
  if (String(rosterStudent.email || '').trim().toLowerCase() !== email) {
    return res.status(409).json({ error: 'The email no longer matches this student. Update and save the roster entry first.' });
  }
  if (rosterStudent.auth_user_id) {
    return res.status(409).json({ error: 'This student already has a linked login. Use Reset Password if they need new access.' });
  }

  let created;
  try {
    created = await fetch(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers: serviceHeaders(serviceKey),
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: name || email },
        app_metadata: { role: 'student' },
      }),
    });
  } catch {
    return res.status(502).json({ error: 'Could not create the Supabase login.' });
  }
  const createdBody = await responseBody(created);
  if (!created.ok || !createdBody?.user?.id) {
    const status = created.status === 400 || created.status === 409 || created.status === 422 ? 409 : 502;
    return res.status(status).json({ error: status === 409 ? 'That email already has a Supabase login.' : messageFrom(createdBody, 'Could not create the Supabase login.') });
  }

  const authUserId = createdBody.user.id;
  let linked;
  try {
    linked = await fetch(`${url}/rest/v1/students?id=eq.${encodeURIComponent(rosterStudent.id)}`, {
      method: 'PATCH',
      headers: serviceHeaders(serviceKey, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ auth_user_id: authUserId }),
    });
  } catch {
    await removeProvisionedUser(url, serviceKey, authUserId);
    return res.status(502).json({ error: 'The login could not be linked to the roster. No account was kept.' });
  }
  if (!linked.ok) {
    await removeProvisionedUser(url, serviceKey, authUserId);
    return res.status(502).json({ error: 'The login could not be linked to the roster. No account was kept.' });
  }

  // Never return or store the password. The browser retains the exact password
  // that the teacher entered/generated only until they dismiss the setup panel.
  return res.status(201).json({ ok: true, email, studentId, authUserId });
}
