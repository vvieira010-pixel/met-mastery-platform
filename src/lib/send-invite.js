/**
 * send-invite.js — client helper that asks the serverless endpoint
 * (/api/send-invite) to email a class invite (.ics + video link) to a student.
 * The Resend API key and sender stay server-side; the browser only passes
 * the class details.
 */

export const ZOOM_URL_KEY = 'vv:zoom_meeting_url';
export const MEET_URL_KEY = 'vv:meet_meeting_url';
export const VIDEO_PROVIDER_KEY = 'vv:video_provider';
export const TEACHER_NAME_KEY = 'vv:teacher_name';

export function getZoomUrl() {
  return (localStorage.getItem(ZOOM_URL_KEY) || '').trim();
}

export function getMeetUrl() {
  return (localStorage.getItem(MEET_URL_KEY) || '').trim();
}

export function getVideoProvider() {
  return (localStorage.getItem(VIDEO_PROVIDER_KEY) || 'zoom').trim();
}

/**
 * @param {object} p
 * @param {string} p.to          student email (required)
 * @param {string} [p.studentName]
 * @param {string} [p.teacherName]
 * @param {string} [p.title]
 * @param {string} p.date        YYYY-MM-DD (required)
 * @param {string} [p.startTime] HH:MM
 * @param {string} [p.endTime]   HH:MM
 * @param {string} [p.zoomUrl]   Zoom join link (required if videoProvider !== 'meet')
 * @param {string} [p.meetUrl]   Google Meet join link (required if videoProvider === 'meet')
 * @param {string} [p.videoProvider] 'zoom' | 'meet' (default 'zoom')
 * @param {string} [p.classFocus]
 * @param {string} [p.timezone]  IANA tz of the class wall-clock time
 */
function getSessionToken() {
  try {
    const raw = localStorage.getItem('vv:supabase_session');
    return raw ? (JSON.parse(raw)?.access_token || '') : '';
  } catch { return ''; }
}

export async function sendClassInvite(p) {
  const token = getSessionToken();
  const r = await fetch('/api/send-invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(p),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(data?.error?.message || `Invite failed (${r.status})`);
  }
  return data;
}
