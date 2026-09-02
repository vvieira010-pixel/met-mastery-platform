/**
 * api/evaluate-speaking.js — Serverless endpoint for evaluating student MET speaking responses.
 *
 * Takes { storagePath, audioUrl, taskPrompt, taskId, transcript }
 * Transcribes audio via Deepgram / OpenAI Whisper / Gemini if audio URL/storagePath is provided,
 * then assesses against the official MET 3-part rubric (0-4 each, total 12):
 * 1. Task Completion & Fluency
 * 2. Linguistic Range & Accuracy (Grammar / Vocab)
 * 3. Delivery / Intelligibility
 */

// SECURITY (#5): server-only secrets must NOT fall back to VITE_* (client-exposed) vars.
const env = (name) => process.env[name] || '';

import { verifySupabaseSession } from './_supabase-auth.js';
import { getServiceKey, getSupabaseUrl } from './_config.js';

const SUPABASE_URL = getSupabaseUrl();
const MOCK_AUDIO_BUCKET = 'mock-test-audio';
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

async function fetchWithTimeout(url, init, ms = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeStoragePath(storagePath) {
  if (typeof storagePath !== 'string') return null;
  const path = storagePath.trim();
  if (!path || path.length > 240 || path.startsWith('/') || path.includes('..')) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(path)) return null;
  return path;
}

async function fetchStoredAudio(storagePath) {
  const serviceKey = getServiceKey();
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  const audioRes = await fetchWithTimeout(
    `${SUPABASE_URL}/storage/v1/object/${MOCK_AUDIO_BUCKET}/${encodedPath}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    10000,
  );
  if (!audioRes.ok) return null;

  const contentLength = Number(audioRes.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES) return null;
  const audioBuffer = await audioRes.arrayBuffer();
  if (!audioBuffer.byteLength || audioBuffer.byteLength > MAX_AUDIO_BYTES) return null;
  return { audioBuffer, contentType: audioRes.headers.get('content-type') || 'audio/webm' };
}

async function transcribeAudio(audio) {
  const deepgramKey = env('DEEPGRAM_API_KEY');
  const openaiKey = env('OPENAI_API_KEY');

  // Send stored audio bytes, never a user-controlled URL.
  if (deepgramKey && audio) {
    try {
      const dgRes = await fetchWithTimeout('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
        method: 'POST',
        headers: {
          Authorization: `Token ${deepgramKey}`,
          'Content-Type': audio.contentType,
        },
        body: audio.audioBuffer,
      });
      if (dgRes.ok) {
        const data = await dgRes.json();
        const text = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
        if (text && text.trim()) return text.trim();
      }
    } catch (e) {
      console.warn('Deepgram transcription error:', e.message);
    }
  }

  if (openaiKey && audio) {
    try {
      const formData = new FormData();
      const blob = new Blob([audio.audioBuffer], { type: audio.contentType });
      formData.append('file', blob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const whisperRes = await fetchWithTimeout('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openaiKey}` },
        body: formData,
      });
      if (whisperRes.ok) {
        const data = await whisperRes.json();
        if (data.text && data.text.trim()) return data.text.trim();
      }
    } catch (e) {
      console.warn('Whisper transcription error:', e.message);
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require a valid Supabase session — this endpoint proxies paid AI services
  // and must not be anonymously callable.
  const user = await verifySupabaseSession(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized — valid session required.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { storagePath, audioUrl, taskPrompt = 'Speak on the topic.', transcript: userTranscript } = body || {};
  if (audioUrl) {
    return res.status(400).json({ error: 'audioUrl is not accepted. Provide a stored recording path.' });
  }
  if (typeof taskPrompt !== 'string' || taskPrompt.trim().length > 2000) {
    return res.status(400).json({ error: 'Invalid task prompt.' });
  }

  let transcription = typeof userTranscript === 'string' ? userTranscript.trim() : '';
  if (transcription.length > 12000) {
    return res.status(400).json({ error: 'Transcript is too long.' });
  }
  if (!transcription) {
    const normalizedPath = normalizeStoragePath(storagePath);
    if (!normalizedPath) {
      return res.status(400).json({ error: 'A valid stored recording path or transcript is required.' });
    }
    try {
      const storedAudio = await fetchStoredAudio(normalizedPath);
      transcription = storedAudio ? await transcribeAudio(storedAudio) : '';
    } catch (e) {
      console.warn('Stored audio retrieval error:', e.message);
    }
  }
  if (!transcription) {
    return res.status(422).json({ error: 'We could not transcribe this recording. Please retry or provide a transcript.' });
  }

  const prompt = `You are an official MET (Michigan English Test) Speaking Examiner evaluating a candidate's recorded speaking response.

Task Prompt:
${taskPrompt}

Candidate's Transcript / Response:
"${transcription}"

Evaluate against the official MET 3-part Speaking Criteria (Score 0 to 4 for each):

1. Task Completion & Fluency (0–4)
- 4: fully answers all parts with appropriate elaboration, smooth pacing
- 3: answers main parts with minor gaps, generally fluid
- 2: answers partially, limited elaboration, noticeable hesitations
- 1: minimal response, mostly disjointed
- 0: off-topic or unintelligible

2. Linguistic Resource / Grammar & Vocabulary (0–4)
- 4: wide range of MET B2-C1 vocabulary & varied grammatical structures with high accuracy
- 3: good control of everyday and professional structures, minor errors that do not obscure meaning
- 2: basic vocabulary, repetitive structures, noticeable grammatical errors
- 1: severe limitations in vocabulary and grammar
- 0: insufficient language to evaluate

3. Delivery & Intelligibility (0–4)
- 4: clear pronunciation, natural intonation and rhythm
- 3: generally clear with minor accent/intonation interference
- 2: listener effort required at times
- 1: difficult to understand
- 0: not comprehensible

Return ONLY a valid JSON object formatted as:
{
  "scores": {
    "task": 3,
    "language": 3,
    "delivery": 3
  },
  "overallScore": 9,
  "cefrEstimate": "B2",
  "rationale": {
    "task": "...",
    "language": "...",
    "delivery": "..."
  },
  "corrections": [
    { "original": "...", "corrected": "...", "explanation": "..." }
  ],
  "feedback": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."]
}`;

  const geminiKey = env('GEMINI_API_KEY');
  const openaiKey = env('OPENAI_API_KEY');
  const groqKey = env('GROQ_API_KEY');

  let evaluation = null;

  // 1. Try Gemini
  if (geminiKey) {
    try {
      const gRes = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        },
        12000
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        const rawText = gData?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
        const cleaned = rawText.replace(/```(?:json)?\s*|\s*```/g, '').trim();
        evaluation = JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn('Gemini evaluation error:', e.message);
    }
  }

  // 2. Try OpenAI
  if (!evaluation && openaiKey) {
    try {
      const oRes = await fetchWithTimeout(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        12000
      );
      if (oRes.ok) {
        const oData = await oRes.json();
        const rawText = oData?.choices?.[0]?.message?.content || '';
        const cleaned = rawText.replace(/```(?:json)?\s*|\s*```/g, '').trim();
        evaluation = JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn('OpenAI evaluation error:', e.message);
    }
  }

  // 3. Try Groq
  if (!evaluation && groqKey) {
    try {
      const grRes = await fetchWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            messages: [{ role: 'user', content: prompt }],
          }),
        },
        12000
      );
      if (grRes.ok) {
        const grData = await grRes.json();
        const rawText = grData?.choices?.[0]?.message?.content || '';
        const cleaned = rawText.replace(/```(?:json)?\s*|\s*```/g, '').trim();
        evaluation = JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn('Groq evaluation error:', e.message);
    }
  }

  if (!evaluation) {
    return res.status(503).json({ error: 'AI evaluation unavailable — no provider responded. Please try again.' });
  }

  return res.status(200).json({
    transcription,
    evaluation,
  });
}
