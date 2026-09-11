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
const getChatterboxUrl = () => lsGet('vv:chatterbox_server_url');

function getSessionToken() {
  try {
    const raw = localStorage.getItem('vv:supabase_session');
    if (!raw) return '';
    const s = JSON.parse(raw);
    return s?.access_token || '';
  } catch { return ''; }
}

async function fetchServerAudio(text, gender = 'female', provider = 'auto', voice = '') {
  const token = getSessionToken();
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ text, gender, provider, ...(voice ? { voice } : {}) }),
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

async function fetchChatterboxAudio(text, serverUrl, voice = '') {
  const res = await fetch(`${serverUrl.replace(/\/$/, '')}/v1/audio/speech`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, response_format: 'wav', ...(voice ? { voice } : {}) }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.detail || `Chatterbox TTS error ${res.status}`);
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
  const chatterboxUrl = getChatterboxUrl();
  if (chatterboxUrl) { try { return await fetchChatterboxAudio(text, chatterboxUrl); } catch (e) { console.warn('[tts] Chatterbox failed:', e.message); } }
  try { return await fetchServerAudio(text, gender); } catch (e) { console.warn('[tts] Server proxy failed:', e.message); }
  return null;
}

/**
 * Generate one listening asset using the teacher's selected provider.
 * `auto` tries local Piper, local Chatterbox, then the server provider.
 * `piper` deliberately fails when no local Piper URL is configured so the
 * builder never reports a local asset that was actually generated remotely.
 */
export async function fetchAudioWithProvider(text, provider = 'auto', gender = 'female') {
  const selected = provider || 'auto';
  const piperUrl = getPiperUrl();

  if (selected === 'piper') {
    if (!piperUrl) throw new Error('Add your local Piper server URL in Settings first.');
    return fetchPiperAudio(text, piperUrl, gender);
  }

  if (selected === 'chatterbox') {
    const chatterboxUrl = getChatterboxUrl();
    if (!chatterboxUrl) throw new Error('Add your local Chatterbox server URL in Settings first.');
    return fetchChatterboxAudio(text, chatterboxUrl);
  }

  if (selected === 'deepgram') {
    return fetchServerAudio(text, gender, 'deepgram');
  }

  return fetchAudioWithGender(text, gender);
}

export async function fetchConversationAudio(utterances) {
  return fetchConversationAudioWithProvider(utterances, 'auto');
}

/**
 * Synthesize a labelled listening dialogue one turn at a time. Chatterbox
 * remains a first-class local provider; its configured voice is used unless a
 * Chatterbox voice name is supplied on an utterance.
 */
export async function fetchConversationAudioWithProvider(utterances, provider = 'auto', fallbackGender = 'female') {
  const turns = (Array.isArray(utterances) ? utterances : []).filter(u => u?.text?.trim());
  if (!turns.length) return null;
  const selected = provider || 'auto';
  const piperUrl = getPiperUrl();
  const chatterboxUrl = getChatterboxUrl();
  const synthesize = (u, selectedProvider) => {
    const gender = u.gender || fallbackGender;
    if (selectedProvider === 'piper') return fetchPiperAudio(u.text.trim(), piperUrl, gender);
    if (selectedProvider === 'chatterbox') return fetchChatterboxAudio(u.text.trim(), chatterboxUrl, u.voice || '');
    return fetchServerAudio(u.text.trim(), gender, 'deepgram', u.voice || '');
  };

  const tryProvider = async (selectedProvider) => {
    if (selectedProvider === 'piper' && !piperUrl) throw new Error('Add your local Piper server URL in Settings first.');
    if (selectedProvider === 'chatterbox' && !chatterboxUrl) throw new Error('Add your local Chatterbox server URL in Settings first.');
    // Keep local model requests sequential. Chatterbox and Piper may each
    // hold a large model in memory, so parallel turns can cause avoidable OOMs.
    const audioUrls = [];
    for (const turn of turns) audioUrls.push(await synthesize(turn, selectedProvider));
    return concatenateAudioBlobs(audioUrls);
  };

  if (selected !== 'auto') return tryProvider(selected);

  const candidates = [
    piperUrl && 'piper',
    chatterboxUrl && 'chatterbox',
    'deepgram',
  ].filter(Boolean);
  let lastError = null;
  for (const candidate of candidates) {
    try { return await tryProvider(candidate); } catch (e) {
      lastError = e;
      console.warn(`[tts] ${candidate} conversation failed:`, e.message);
    }
  }
  if (lastError) throw lastError;
  return null;
}

async function concatenateAudioBlobs(urls, pauseMs = 320) {
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

    const sampleRate = audioBuffers[0].sampleRate;
    const pauseSamples = Math.round(sampleRate * pauseMs / 1000);
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0) + (pauseSamples * Math.max(0, audioBuffers.length - 1));
    const numberOfChannels = audioBuffers[0].numberOfChannels;

    const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
      numberOfChannels,
      totalLength,
      sampleRate
    );

    let offset = 0;
    audioBuffers.forEach((buffer, index) => {
      const source = offlineCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineCtx.destination);
      source.start(offset / sampleRate);
      offset += buffer.length;
      if (index < audioBuffers.length - 1) offset += pauseSamples;
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
