/**
 * api/evaluate-speaking.js — Serverless endpoint for evaluating student MET speaking responses.
 *
 * Takes { storagePath, audioUrl, taskPrompt, taskId, transcript }
 * Transcribes audio via AssemblyAI (word timings + disfluencies) / Deepgram /
 * OpenAI Whisper if audio storagePath is provided, then assesses against the
 * official MET Speaking Rating Scale (0.0-4.0 each in 0.5 steps):
 * 1. Task Completion
 * 2. Language Resources
 * 3. Intelligibility / Delivery
 * Scoring (avg → scaled 0-80 → CEFR) is computed server-side, deterministically.
 */

// SECURITY (#5): server-only secrets must NOT fall back to VITE_* (client-exposed) vars.
const env = (name) => process.env[name] || '';

import { verifySupabaseSession } from './_supabase-auth.js';
import { getServiceKey, getSupabaseUrl } from './_config.js';
import { buildExaminerPrompt, rubricToScaled } from './_met-speaking-scale.js';

const SUPABASE_URL = getSupabaseUrl();
const DEFAULT_AUDIO_BUCKET = 'mock-test-audio';
// Practice Studio uploads land in submission-audio; mock tests use mock-test-audio.
const ALLOWED_AUDIO_BUCKETS = ['mock-test-audio', 'submission-audio'];
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

async function fetchStoredAudio(storagePath, bucket) {
  const serviceKey = getServiceKey();
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  const audioRes = await fetchWithTimeout(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodedPath}`,
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

async function transcribeWithAssemblyAI(audio) {
  const key = env('ASSEMBLYAI_API_KEY');
  if (!key || !audio) return null;
  try {
    const upRes = await fetchWithTimeout('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/octet-stream' },
      body: audio.audioBuffer,
    }, 30000);
    if (!upRes.ok) return null;
    const { upload_url } = await upRes.json();
    if (!upload_url) return null;

    const subRes = await fetchWithTimeout('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { Authorization: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_url: upload_url,
        disfluencies: true,
        punctuate: true,
        format_text: true,
        language_code: 'en',
      }),
    });
    if (!subRes.ok) return null;
    const { id } = await subRes.json();
    if (!id) return null;

    // Bounded poll (~40s) so serverless timeouts fall through to faster providers.
    for (let i = 0; i < 13; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetchWithTimeout(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        { headers: { Authorization: key } },
      );
      if (!poll.ok) return null;
      const t = await poll.json();
      if (t.status === 'completed') {
        const text = (t.text || '').trim();
        if (!text) return null;
        return { text, words: t.words || [], duration: t.audio_duration ?? null, confidence: t.confidence ?? null };
      }
      if (t.status === 'error') return null;
    }
    return null;
  } catch (e) {
    console.warn('AssemblyAI transcription error:', e.message);
    return null;
  }
}

// Word-gap stats from AssemblyAI word timings → acoustic evidence for Delivery.
function pauseStats(words, durationSec) {
  const gaps = [];
  for (let i = 1; i < (words || []).length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (Number.isFinite(gap) && gap >= 0) gaps.push(gap);
  }
  const wordCount = (words || []).length;
  return {
    wordCount,
    durationSec,
    wpm: durationSec && wordCount ? Math.round(wordCount / (durationSec / 60)) : null,
    pausesOver500ms: gaps.filter((g) => g >= 500).length,
    pausesOver1200ms: gaps.filter((g) => g >= 1200).length,
    longestPausesMs: [...gaps].sort((a, b) => b - a).slice(0, 6),
  };
}

// rubricToScaled is imported from ./_met-speaking-scale.js (single source of truth).

async function transcribeAudio(audio) {
  const deepgramKey = env('DEEPGRAM_API_KEY');
  const openaiKey = env('OPENAI_API_KEY');

  // 1. AssemblyAI first — word timings + disfluencies give real Delivery evidence.
  const aai = await transcribeWithAssemblyAI(audio);
  if (aai) return { ...aai, stats: pauseStats(aai.words, aai.duration) };
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
        const alt = data?.results?.channels?.[0]?.alternatives?.[0];
        const text = alt?.transcript;
        if (text && text.trim()) {
          const words = alt?.words || [];
          const duration = data?.metadata?.duration ?? null;
          return { text: text.trim(), words, duration, confidence: alt?.confidence ?? null, stats: pauseStats(words, duration) };
        }
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
        if (data.text && data.text.trim()) {
          return { text: data.text.trim(), words: [], duration: null, confidence: null, stats: pauseStats([], null) };
        }
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

  const { storagePath, audioUrl, bucket, taskPrompt = 'Speak on the topic.', transcript: userTranscript } = body || {};
  if (audioUrl) {
    return res.status(400).json({ error: 'audioUrl is not accepted. Provide a stored recording path.' });
  }
  const audioBucket = ALLOWED_AUDIO_BUCKETS.includes(bucket) ? bucket : DEFAULT_AUDIO_BUCKET;
  if (typeof taskPrompt !== 'string' || taskPrompt.trim().length > 2000) {
    return res.status(400).json({ error: 'Invalid task prompt.' });
  }

  let transcription = typeof userTranscript === 'string' ? userTranscript.trim() : '';
  let fluency = null; // { stats } from acoustic transcription when audio was processed
  if (transcription.length > 12000) {
    return res.status(400).json({ error: 'Transcript is too long.' });
  }
  if (!transcription) {
    const normalizedPath = normalizeStoragePath(storagePath);
    if (!normalizedPath) {
      return res.status(400).json({ error: 'A valid stored recording path or transcript is required.' });
    }
    try {
      const storedAudio = await fetchStoredAudio(normalizedPath, audioBucket);
      const result = storedAudio ? await transcribeAudio(storedAudio) : null;
      transcription = result?.text || '';
      if (result?.stats?.wordCount) fluency = result.stats;
    } catch (e) {
      console.warn('Stored audio retrieval error:', e.message);
    }
  }
  if (!transcription) {
    return res.status(422).json({ error: 'We could not transcribe this recording. Please retry or provide a transcript.' });
  }

  const fluencyLine = fluency
    ? `Acoustic fluency facts (from word timings — use for Delivery, do not re-derive from text): ${fluency.wordCount} words in ${fluency.durationSec ?? '?'}s (~${fluency.wpm ?? '?'} wpm vs ~150 conversational), ${fluency.pausesOver500ms} pauses ≥0.5s, ${fluency.pausesOver1200ms} pauses ≥1.2s, longest gaps ms: [${(fluency.longestPausesMs || []).join(', ')}].`
    : 'No acoustic timing available (transcript-only input) — rate Delivery conservatively from textual coherence and flag it in rationale.';

  const prompt = buildExaminerPrompt({ taskPrompt, transcription, fluencyLine });


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

  // Server-side scoring: average → snap to 0.5 → scaled 0–80 + CEFR (deterministic, not LLM-derived).
  const s = evaluation.scores || {};
  const avgRaw = (Number(s.task) + Number(s.language) + Number(s.delivery)) / 3;
  const conversion = rubricToScaled(Number.isFinite(avgRaw) ? avgRaw : 0);
  evaluation.rubricAvg = conversion.rubricAvg;
  evaluation.scaledScore = conversion.scaledScore;
  evaluation.scaledRange = conversion.scaledRange;
  // Backward-compatible fields used by mock-test-results.jsx:
  evaluation.overallScore = Math.round((Number(s.task) + Number(s.language) + Number(s.delivery)) * 10) / 10;
  evaluation.cefrEstimate = conversion.cefr;

  return res.status(200).json({
    transcription,
    fluency,
    evaluation,
  });
}
