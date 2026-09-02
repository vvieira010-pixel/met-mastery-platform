export const VOICES = {
  female: {
    elevenlabs: '21m00Tcm4TlvDq8ikWAM',
    deepgram:   'aura-2-thalia-en',
    openai:     'nova',
    gemini:     'Kore',
  },
  male: {
    elevenlabs: 'pNInz6obpgDQGcFmaJgB',
    deepgram:   'aura-2-asteria-en',
    openai:     'onyx',
    gemini:     'Puck',
  },
};

function lsGet(key) { try { return localStorage.getItem(key) || ''; } catch { return ''; } }
const getPiperUrl  = () => lsGet('vv:piper_server_url');

function getSessionToken() {
  try {
    const raw = localStorage.getItem('vv:supabase_session');
    if (!raw) return '';
    const s = JSON.parse(raw);
    return s?.access_token || '';
  } catch { return ''; }
}

async function fetchServerAudio(text, gender = 'female') {
  const token = getSessionToken();
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ text, gender }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Server TTS error ${res.status}`);
  }
  const data = await res.json();
  const b64 = data?.audioB64;
  if (!b64) throw new Error('Server returned no audio data');
  const [meta, b64Data] = b64.split(',');
  const mimeMatch = /data:(.*?);/.exec(meta || '');
  const mime = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
  const byteChars = atob(b64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
  return URL.createObjectURL(blob);
}

async function fetchPiperAudio(text, serverUrl, gender) {
  const res = await fetch(`${serverUrl.replace(/\/$/, '')}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, gender: gender || 'female' }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.detail || `Piper TTS error ${res.status}`);
  }
  return URL.createObjectURL(await res.blob());
}

export async function fetchAudio(text) {
  const piperUrl = getPiperUrl();
  if (piperUrl) { try { return await fetchPiperAudio(text, piperUrl); } catch (e) { console.warn('[tts] Piper failed:', e.message); } }
  try { return await fetchServerAudio(text); } catch (e) { console.warn('[tts] Server proxy failed:', e.message); }
  return null;
}

export async function fetchAudioWithGender(text, gender = 'female') {
  const piperUrl = getPiperUrl();
  if (piperUrl) { try { return await fetchPiperAudio(text, piperUrl, gender); } catch (e) { console.warn('[tts] Piper failed:', e.message); } }
  try { return await fetchServerAudio(text, gender); } catch (e) { console.warn('[tts] Server proxy failed:', e.message); }
  return null;
}

export async function fetchConversationAudio(utterances) {
  const piperUrl = getPiperUrl();
  if (piperUrl) {
    try {
      const audioBlobs = await Promise.all(
        utterances.map(u => fetchPiperAudio(u.text, piperUrl, u.gender))
      );
      return concatenateAudioBlobs(audioBlobs);
    } catch (e) { console.warn('[tts] Piper conversation failed:', e.message); }
  }
  try {
    const audioBlobs = await Promise.all(
      utterances.map(u => fetchServerAudio(u.text, u.gender))
    );
    return concatenateAudioBlobs(audioBlobs);
  } catch (e) { console.warn('[tts] Server conversation failed:', e.message); }
  return null;
}

async function concatenateAudioBlobs(urls) {
  /* eslint-disable no-undef */
  if (typeof window === 'undefined' || !window.AudioContext) {
    console.warn('[tts] AudioContext not available, returning first blob');
    return urls[0];
  }

  try {
    const audioBuffers = await Promise.all(
      urls.map(async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const tempCtx = new (window.AudioContext || window.webkitAudioContext)();
        const decoded = await tempCtx.decodeAudioData(arrayBuffer);
        // tempCtx.close(); // Close to free resources
        return decoded;
      })
    );

    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const sampleRate = audioBuffers[0].sampleRate;
    const numberOfChannels = audioBuffers[0].numberOfChannels;

    const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      numberOfChannels,
      totalLength,
      sampleRate
    );

    let offset = 0;
    audioBuffers.forEach((buffer) => {
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineCtx.destination);
      source.start(offset);
      offset += buffer.duration;
    });

    const renderedBuffer = await offlineCtx.startRendering();
    const wav = audioBufferToWav(renderedBuffer);
    return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
  } catch (e) {
    console.error('[tts] concatenateAudioBlobs failed:', e);
    return urls[0];
  }
}

function audioBufferToWav(buffer) {
  const length = buffer.length;
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  return arrayBuffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
