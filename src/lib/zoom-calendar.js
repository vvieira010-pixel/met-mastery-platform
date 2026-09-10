/**
 * zoom-calendar.js — Client helper for auto-creating Zoom meetings from calendar events
 */

export async function createZoomMeeting({ topic, date, startTime, duration = '60', timezone }) {
  if (!startTime) return null;
  
  const isoDate = new Date(`${date}T${startTime}:00`);
  const startTimeISO = isoDate.toISOString();
  
  const r = await fetch('/api/create-zoom-meeting', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      startTime: startTimeISO,
      duration,
      timezone: timezone || 'America/Sao_Paulo',
    }),
  });
  
  const data = await r.json().catch(() => ({ ok: false }));
  return data;
}

export function isZoomAutoCreateEnabled() {
  return localStorage.getItem('vv:auto_create_zoom_meeting') === 'true';
}

export function setZoomAutoCreateEnabled(enabled) {
  if (enabled) {
    localStorage.setItem('vv:auto_create_zoom_meeting', 'true');
  } else {
    localStorage.removeItem('vv:auto_create_zoom_meeting');
  }
}