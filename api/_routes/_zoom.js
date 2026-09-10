/* eslint-disable no-undef */
const crypto = require('crypto');
const env = (name) => process.env[name] || '';

const BASE_URL = 'https://api.zoom.us/v2';

function base64url(data) {
  return Buffer.from(data).toString('base64url');
}

async function getJwtToken() {
  const key = env('ZOOM_API_KEY');
  const secret = env('ZOOM_API_SECRET');
  if (!key || !secret) {
    throw new Error('Zoom API key/secret not configured');
  }
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const payload = base64url(JSON.stringify({
    iss: key,
    iat,
    exp,
    aud: 'https://api.zoom.us'
  }));
  const signature = base64url(
    crypto.createHmac('sha256', secret)
      .update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}

export async function createMeeting({ topic, startTime, duration, timezone = 'America/Sao_Paulo', password = null }) {
  const token = await getJwtToken();
  const userId = env('ZOOM_USER_ID') || 'me';
  
  const body = {
    topic,
    type: 2,
    start_time: startTime,
    duration: parseInt(duration) || 60,
    timezone,
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,
      approval_type: 0,
      encryption_type: 'enhanced',
      waiting_room: false,
      meeting_password: password,
      password_authentication: password ? 'on_join' : 'off'
    }
  };

  const response = await fetch(`${BASE_URL}/users/${userId}/meetings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create Zoom meeting');
  }

  return response.json();
}

export async function updateMeeting(meetingId, updates) {
  const token = await getJwtToken();
  
  const response = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to update Zoom meeting');
  }

  return response.json();
}

export function isZoomConfigured() {
  return Boolean(env('ZOOM_API_KEY') && env('ZOOM_API_SECRET'));
}