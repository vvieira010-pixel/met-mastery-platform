/**
 * zoom-diagnosis.js — Create Zoom meetings for diagnosis follow-up sessions
 */

export async function createZoomMeetingForDiagnosis({ topic, duration = 60 }) {
  if (!topic) {
    return { ok: false, error: { message: 'Topic is required' } };
  }

  const now = new Date();
  const startTime = now.toISOString();

  const r = await fetch('/api/create-zoom-meeting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      startTime,
      duration,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    }),
  });

  const data = await r.json().catch(() => ({ ok: false }));
  return data;
}