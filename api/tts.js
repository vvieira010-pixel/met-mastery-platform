/**
 * api/tts.js — Vercel serverless TTS proxy.
 * Supports Deepgram, ElevenLabs, OpenAI, and Gemini.
 */

import { isSameOrigin } from './_config.js';

const env = (name) => process.env[name] || '';

const VOICES = {
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

async function tryDeepgram(text, gender, voice) {
  const apiKey = env('DEEPGRAM_API_KEY');
  if (!apiKey) return null;
  const res = await fetch(`https://api.deepgram.com/v1/speak?model=${voice || VOICES[gender]?.deepgram || 'aura-asteria-en'}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function tryElevenLabs(text, gender) {
  const apiKey = env('ELEVENLABS_API_KEY');
  if (!apiKey) return null;
  const voice = VOICES[gender]?.elevenlabs || VOICES.female.elevenlabs;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function tryOpenAI(text, gender) {
  const apiKey = env('OPENAI_API_KEY');
  if (!apiKey) return null;
  const voice = VOICES[gender]?.openai || VOICES.female.openai;
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text, voice }),
  });
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function tryGemini(text, gender) {
  const apiKey = env('GEMINI_API_KEY');
  if (!apiKey) return null;
  const voiceName = VOICES[gender]?.gemini || VOICES.female.gemini;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const base64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64 || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Mirror the cross-origin guard used by save-submission.js — without it any
  // origin can drive the (paid) TTS cascade and bill our provider accounts.
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: { message: 'Forbidden — cross-origin request.' } });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { text, gender = 'female', voice } = body || {};

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: { message: 'Missing "text"' } });
  }

  if (text.length > 8000) {
    return res.status(400).json({ error: { message: 'Text too long for TTS (max 8000 characters).' } });
  }

  // Cascade order: Deepgram (default) -> ElevenLabs -> OpenAI -> Gemini
  let audioB64 = await tryDeepgram(text, gender, voice);
  if (!audioB64) audioB64 = await tryElevenLabs(text, gender);
  if (!audioB64) audioB64 = await tryOpenAI(text, gender);
  if (!audioB64) audioB64 = await tryGemini(text, gender);

  if (audioB64) {
    // Ensure it has the data URI prefix if not already present
    const finalB64 = audioB64.startsWith('data:audio') ? audioB64 : `data:audio/mp3;base64,${audioB64}`;
    return res.status(200).json({ audioB64: finalB64 });
  }

  return res.status(503).json({ error: { message: 'All TTS providers failed or keys are missing.' } });
}
