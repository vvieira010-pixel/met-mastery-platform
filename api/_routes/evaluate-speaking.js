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
import { callAssemblyAILLMJson, extractScores, parseLLMJson } from './_assemblyai-llm.js';
import { logPrediction } from './_ml/log.js';
import { guardRateLimit, enforceDistributedCap, rateLimitIdentity, LIMITS } from './_rate-limit.js';
import { getActive } from './_ml/registry.js';
import { telemetryEnabled } from './_ml/store.js';

const SUPABASE_URL = getSupabaseUrl();
const DEFAULT_AUDIO_BUCKET = 'mock-test-audio';
// Practice Studio uploads land in submission-audio; mock tests use mock-test-audio.
const ALLOWED_AUDIO_BUCKETS = ['mock-test-audio', 'submission-audio'];
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const SPEAKING_SCORE_KEYS = ['task', 'language', 'delivery'];
const SPEAKING_RATIONALE_KEYS = ['task', 'language', 'delivery'];

function validSpeakingScores(evaluation) {
  const scores = extractScores(evaluation, SPEAKING_SCORE_KEYS);
  if (!scores) return null;

  const normalized = {};
  for (const key of SPEAKING_SCORE_KEYS) {
    const score = Number(scores[key]);
    // The MET rubric permits only 0.0–4.0 in half-point increments. Do not
    // silently turn an invalid provider value into a plausible student score.
    if (score < 0 || score > 4 || Math.abs(score * 2 - Math.round(score * 2)) > 1e-8) return null;
    normalized[key] = score;
  }
  return normalized;
}

function validSpeakingFeedback(evaluation) {
  if (!evaluation || typeof evaluation !== 'object') return null;
  const feedback = typeof evaluation.feedback === 'string' ? evaluation.feedback.trim() : '';
  const rationale = evaluation.rationale && typeof evaluation.rationale === 'object'
    ? evaluation.rationale
    : null;
  const strengths = Array.isArray(evaluation.strengths)
    ? evaluation.strengths.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, 4)
    : [];
  const weaknesses = Array.isArray(evaluation.weaknesses)
    ? evaluation.weaknesses.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim()).slice(0, 4)
    : [];

  // A score without learner-facing explanations is not a complete Practice
  // Studio result. Reject it so the provider cascade can try again instead of
  // saving a locked card that contains only a band and delivery disclaimer.
  if (
    feedback.length < 20
    || !rationale
    || !SPEAKING_RATIONALE_KEYS.every(key => typeof rationale[key] === 'string' && rationale[key].trim())
    || strengths.length < 3
    || weaknesses.length < 2
  ) return null;

  return {
    feedback,
    rationale: Object.fromEntries(SPEAKING_RATIONALE_KEYS.map(key => [key, rationale[key].trim()])),
    strengths,
    weaknesses,
  };
}

function parseSpeakingEvaluation(rawText, provider) {
  const evaluation = parseLLMJson(rawText);
  const scores = validSpeakingScores(evaluation);
  const feedback = validSpeakingFeedback(evaluation);
  if (!scores || !feedback) {
    console.warn(`${provider} speaking evaluation had an invalid or incomplete payload.`);
    return null;
  }
  return { ...evaluation, ...feedback, scores, feedbackComplete: true };
}

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
        return { text, words: t.words || [], duration: t.audio_duration ?? null, confidence: t.confidence ?? null, asrProvider: 'assemblyai', asrModel: 'universal-2' };
      }
      if (t.status === 'error') return null;
    }
    return null;
  } catch (e) {
    console.warn('AssemblyAI transcription error:', e.message);
    return null;
  }
}

// Local openai-whisper (open-source, no API cost). Called when LOCAL_WHISPER_URL is
// configured — preferred over cloud providers so transcription stays free/self-hosted.
async function transcribeWithLocalWhisper(audio) {
  const url = env('LOCAL_WHISPER_URL');
  if (!url || !audio) return null;
  try {
    const formData = new FormData();
    const blob = new Blob([audio.audioBuffer], { type: audio.contentType || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    const model = env('WHISPER_MODEL');
    if (model) formData.append('model', model);

    // Local CPU inference can be slow; use a generous timeout (self-hosted only).
    const whisperRes = await fetchWithTimeout(
      `${url.replace(/\/$/, '')}/transcribe`,
      { method: 'POST', body: formData },
      120000,
    );
    if (!whisperRes.ok) return null;
    const data = await whisperRes.json();
    const text = (data.text || '').trim();
    if (!text) return null;

    // Whisper segments → word-like ms timings for pause-gap analysis.
    const words = (data.segments || []).map((s) => ({
      start: Math.round((s.start || 0) * 1000),
      end: Math.round((s.end || 0) * 1000),
    }));
    const duration = data.duration ?? null;

    // Confidence proxy: 1 − average segment no_speech_prob.
    let confidence = null;
    const segs = data.segments || [];
    if (segs.length) {
      const avgNoSpeech = segs.reduce((a, s) => a + (s.no_speech_prob ?? 0), 0) / segs.length;
      confidence = Math.round((1 - avgNoSpeech) * 100) / 100;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const gaps = [];
    for (let i = 1; i < words.length; i++) {
      const g = words[i].start - words[i - 1].end;
      if (Number.isFinite(g) && g >= 0) gaps.push(g);
    }
    const stats = {
      wordCount,
      durationSec: duration,
      wpm: duration && wordCount ? Math.round(wordCount / (duration / 60)) : null,
      pausesOver500ms: gaps.filter((g) => g >= 500).length,
      pausesOver1200ms: gaps.filter((g) => g >= 1200).length,
      longestPausesMs: [...gaps].sort((a, b) => b - a).slice(0, 6),
    };

    return {
      text,
      words,
      duration,
      confidence,
      stats,
      asrProvider: 'local-whisper',
      asrModel: data.asrModel || model || 'base',
    };
  } catch (e) {
    console.warn('Local Whisper transcription error:', e.message);
    return null;
  }
}

// Hosted Whisper is the server-side ASR fallback for student recordings when
// AssemblyAI is unavailable or rate-limited. `verbose_json` plus word timestamps
// lets the Delivery estimate use observable timing facts instead of transcript
// length alone. It uses only the server-side OPENAI_API_KEY.
async function transcribeWithOpenAIWhisper(audio) {
  const key = env('OPENAI_API_KEY');
  if (!key || !audio) return null;
  try {
    const formData = new FormData();
    const type = audio.contentType || 'audio/webm';
    const extension = type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'mp4' : 'webm';
    formData.append('file', new Blob([audio.audioBuffer], { type }), `recording.${extension}`);
    formData.append('model', env('OPENAI_WHISPER_MODEL') || 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const whisperRes = await fetchWithTimeout(
      'https://api.openai.com/v1/audio/transcriptions',
      { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: formData },
      Number(env('OPENAI_WHISPER_TIMEOUT_MS')) || 30000,
    );
    if (!whisperRes.ok) return null;

    const data = await whisperRes.json();
    const text = (data.text || '').trim();
    if (!text) return null;
    const words = (data.words || []).map((word) => ({
      start: Math.round(Number(word.start) * 1000),
      end: Math.round(Number(word.end) * 1000),
    })).filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end));
    const duration = Number.isFinite(Number(data.duration)) ? Number(data.duration) : null;
    const segments = Array.isArray(data.segments) ? data.segments : [];
    const avgNoSpeech = segments.length
      ? segments.reduce((sum, segment) => sum + (Number(segment.no_speech_prob) || 0), 0) / segments.length
      : null;

    return {
      text,
      words,
      duration,
      confidence: avgNoSpeech == null ? null : Math.round((1 - avgNoSpeech) * 100) / 100,
      stats: pauseStats(words, duration, text),
      asrProvider: 'openai-whisper',
      asrModel: data.model || env('OPENAI_WHISPER_MODEL') || 'whisper-1',
    };
  } catch (e) {
    console.warn('OpenAI Whisper transcription error:', e.message);
    return null;
  }
}

// Word-gap stats from AssemblyAI word timings → acoustic evidence for Delivery.
function pauseStats(words, durationSec, text = '') {
  const gaps = [];
  for (let i = 1; i < (words || []).length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (Number.isFinite(gap) && gap >= 0) gaps.push(gap);
  }
  const wordCount = (words || []).length || String(text).split(/\s+/).filter(Boolean).length;
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

async function transcribeAudio(audio, { useAssemblyAI = false } = {}) {
  const deepgramKey = env('DEEPGRAM_API_KEY');

  // AssemblyAI is the primary transcription and word-timing source for the
  // Practice Studio speaking flow. The second pass then sends its transcript
  // and timing evidence to the structured speaking evaluator.
  if (useAssemblyAI) {
    const aai = await transcribeWithAssemblyAI(audio);
    if (aai) return { ...aai, stats: pauseStats(aai.words, aai.duration, aai.text) };
  }

  // Local openai-whisper (no API cost) is a fallback for Practice Studio and
  // remains preferred for non-Practice-Studio callers when configured.
  // When WHISPER_PROVIDER=local, never fall back to paid cloud providers.
  const localUrl = env('LOCAL_WHISPER_URL');
  const forceLocal = (env('WHISPER_PROVIDER') || '').toLowerCase() === 'local';
  if (localUrl) {
    const local = await transcribeWithLocalWhisper(audio);
    if (local) return local;
    if (forceLocal) return null;
  }

  // Hosted Whisper and Deepgram are fallbacks when the preferred provider is
  // unavailable.
  const whisper = await transcribeWithOpenAIWhisper(audio);
  if (whisper) return whisper;

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
          return { text: text.trim(), words, duration, confidence: alt?.confidence ?? null, stats: pauseStats(words, duration, text), asrProvider: 'deepgram', asrModel: 'nova-2' };
        }
      }
    } catch (e) {
      console.warn('Deepgram transcription error:', e.message);
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

  // Spend guardrail: one request fans out to AssemblyAI STT + LLM grading.
  if (!guardRateLimit(req, res, { scope: 'evaluate-speaking', user })) return;
  // Optional TRUE global cap (audit RATE-1) — dormant unless Upstash is set.
  if (!(await enforceDistributedCap(rateLimitIdentity(req, user), LIMITS['evaluate-speaking']))) {
    return res.status(429).json({ error: { message: 'Global rate limit reached. Please try again later.', code: 'rate_limit_global' } });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // subject/submissionId are optional telemetry context. `subject` is hashed
  // server-side before storage (see api/_ml/hash.js).
  const { storagePath, audioUrl, bucket, taskPrompt = 'Speak on the topic.', transcript: userTranscript, subject = null, submissionId = null, practiceStudio = false } = body || {};
  const useAssemblyAI = practiceStudio === true;
  if (audioUrl) {
    return res.status(400).json({ error: 'audioUrl is not accepted. Provide a stored recording path.' });
  }
  const audioBucket = ALLOWED_AUDIO_BUCKETS.includes(bucket) ? bucket : DEFAULT_AUDIO_BUCKET;
  if (typeof taskPrompt !== 'string' || taskPrompt.trim().length > 2000) {
    return res.status(400).json({ error: 'Invalid task prompt.' });
  }

  let transcription = typeof userTranscript === 'string' ? userTranscript.trim() : '';
  let asrProvider = transcription ? 'provided-transcript' : 'unknown';
  let asrConfidence = null;
  let fluency = null; // { stats } from acoustic transcription when audio was processed
  if (transcription.length > 12000) {
    return res.status(400).json({ error: 'Transcript is too long.' });
  }
  if (!transcription) {
    const normalizedPath = normalizeStoragePath(storagePath);
    if (!normalizedPath) {
      return res.status(400).json({ error: 'A valid stored recording path or transcript is required.' });
    }
    // SECURITY (audit AUTH-2): prevent one student from transcribing another
    // student's voice recording. Recordings must live under the caller's own
    // id/email prefix. Teachers legitimately review student audio, so they are
    // exempt. Opt out via STORAGE_OWNERSHIP_CHECK=false if your upload layout
    // does not yet prefix by user (then enforce via RLS on the bucket instead).
    if (
      user.role !== 'teacher' &&
      env('STORAGE_OWNERSHIP_CHECK') !== 'false'
    ) {
      const ownPrefixes = [`${user.id}/`, `${user.email}/`].filter(Boolean);
      const belongsToCaller = ownPrefixes.some((p) => normalizedPath.startsWith(p));
      if (!belongsToCaller) {
        return res.status(403).json({ error: 'You can only evaluate your own recordings.' });
      }
    }
    const asrStartedAt = Date.now();
    try {
      const storedAudio = await fetchStoredAudio(normalizedPath, audioBucket);
      const result = storedAudio ? await transcribeAudio(storedAudio, { useAssemblyAI }) : null;
      transcription = result?.text || '';
      asrProvider = result?.asrProvider || asrProvider;
      asrConfidence = result?.confidence ?? null;
      if (result?.stats?.wordCount) fluency = result.stats;
      // ASR is a separate cost centre from the LLM rubric call, so it gets its
      // own telemetry row. Accent-related WER is a known fairness risk — log
      // the provider so subgroup accuracy can be compared later.
      if (result?.text) {
        // Fire-and-forget (PERF-1): never block the response on telemetry.
        void logPrediction({
          feature: 'speaking_asr',
          subject,
          submissionId,
          modelName: 'speaking_asr',
          provider: result.asrProvider || 'unknown',
          modelId: result.asrModel || null,
          outputChars: result.text.length,
          latencyMs: Date.now() - asrStartedAt,
          status: 'ok',
          parsedOutput: { confidence: result.confidence ?? null, wpm: result.stats?.wpm ?? null },
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Stored audio retrieval error:', e.message);
    }
  }
  if (!transcription) {
    return res.status(422).json({ error: 'We could not transcribe this recording. Please retry or provide a transcript.' });
  }

  const fluencyLine = fluency
    ? `ASR word-timing facts (use for Delivery, do not re-derive from text): ${fluency.wordCount} words in ${fluency.durationSec ?? '?'}s (~${fluency.wpm ?? '?'} wpm vs ~150 conversational), ${fluency.pausesOver500ms} pauses ≥0.5s, ${fluency.pausesOver1200ms} pauses ≥1.2s, longest gaps ms: [${(fluency.longestPausesMs || []).join(', ')}].`
    : 'No ASR word-timing evidence available (transcript-only input) — rate Delivery conservatively and flag pronunciation, rhythm, and hesitation evidence for teacher review.';

  const prompt = buildExaminerPrompt({ taskPrompt, transcription, fluencyLine, asrProvider, asrConfidence });

  // Registry lookup is cached for 60s and degrades to 'unversioned', so it can
  // never take evaluation down. Gives telemetry a stable version to group by.
  const activeModel = telemetryEnabled()
    ? await getActive('model', 'speaking_eval', { version: 'unversioned', promptSha: 'unversioned' })
    : { version: 'unversioned', promptSha: 'unversioned' };

  const geminiKey = env('GEMINI_API_KEY');
  const groqKey = env('GROQ_API_KEY');

  let evaluation = null;
  let evalProvider = null;
  let evalModelId = null;
  const llmStartedAt = Date.now();

  // AssemblyAI LLM Gateway is reserved for the Practice Studio speaking flow.
  // Reuses the same examiner prompt (Task/Language/Delivery) and JSON shape.
  if (evaluation == null && useAssemblyAI && env('ASSEMBLYAI_API_KEY')) {
    try {
      const aai = await callAssemblyAILLMJson(
        { messages: [{ role: 'user', content: prompt }], temperature: 0.2, maxTokens: 3072 },
        { retries: 1, validateKeys: SPEAKING_SCORE_KEYS },
      );
      const candidate = aai.ok ? parseSpeakingEvaluation(JSON.stringify(aai.evaluation), 'AssemblyAI') : null;
      if (candidate) {
        evaluation = candidate;
        evalProvider = 'assemblyai-llm';
        evalModelId = aai.model;
      } else {
        console.warn('AssemblyAI LLM speaking eval error:', aai.error, aai.requestId || '');
      }
    } catch (e) {
      console.warn('AssemblyAI LLM speaking eval error:', e.message);
    }
  }

  // 1. Gemini is a safe fallback after AssemblyAI for Practice Studio and the
  // primary evaluator elsewhere. A provider failure must never fabricate a score.
  if (!evaluation && geminiKey) {
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
        const candidate = parseSpeakingEvaluation(rawText, 'Gemini');
        if (candidate) {
          evaluation = candidate;
          evalProvider = 'gemini';
          evalModelId = 'gemini-2.5-flash';
        }
      }
    } catch (e) {
      console.warn('Gemini evaluation error:', e.message);
    }
  }

  // 2. Groq is the final structured-score fallback for every caller.
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
        const candidate = parseSpeakingEvaluation(rawText, 'Groq');
        if (candidate) {
          evaluation = candidate;
          evalProvider = 'groq';
          evalModelId = 'llama-3.3-70b-versatile';
        }
      }
    } catch (e) {
      console.warn('Groq evaluation error:', e.message);
    }
  }

  if (!evaluation) {
    void logPrediction({
      feature: 'speaking_eval',
      subject,
      submissionId,
      modelName: 'speaking_eval',
      modelVersion: activeModel.version,
      prompt,
      promptSha: activeModel.promptSha,
      inputChars: prompt.length,
      latencyMs: Date.now() - llmStartedAt,
      status: 'provider_error',
      error: 'no provider returned a parseable evaluation',
    }).catch(() => {});
    return res.status(503).json({ error: 'AI evaluation unavailable — no provider responded. Please try again.' });
  }

  // Server-side scoring: average → snap to 0.5 → scaled 0–80 + CEFR (deterministic, not LLM-derived).
  const s = validSpeakingScores(evaluation);
  if (!s) {
    return res.status(503).json({ error: 'AI evaluation unavailable — the returned rubric score was invalid. Please try again.' });
  }
  evaluation.scores = s;
  const nums = SPEAKING_SCORE_KEYS.map((key) => s[key]);
  const avgRaw = nums.reduce((a, b) => a + b, 0) / 3;
  const conversion = rubricToScaled(Number.isFinite(avgRaw) ? avgRaw : 0);
  evaluation.rubricAvg = conversion.rubricAvg;
  evaluation.scaledScore = conversion.scaledScore;
  evaluation.scaledRange = conversion.scaledRange;
  // Backward-compatible fields used by mock-test-results.jsx:
  evaluation.overallScore = Math.round((Number(s.task) + Number(s.language) + Number(s.delivery)) * 10) / 10;
  evaluation.cefrEstimate = conversion.cefr;
  evaluation.provisional = true;
  evaluation.scoreLabel = practiceStudio
    ? 'Practice estimate — may vary by approximately ±5 MET scaled points; not an official MET score'
    : 'Practice estimate — not an official MET score';
  evaluation.estimatedBandLabel = `Estimated ${conversion.cefr} practice band`;
  evaluation.deliveryEvidence = fluency
    ? 'Transcript plus word-timing evidence. Pronunciation and rhythm still need teacher review.'
    : 'Transcript-only estimate. Pronunciation, pauses, and rhythm need teacher review.';

  // Store the rubric scores (not the transcript) so agreement against the gold
  // set can be computed later. parsed_output may quote student speech — it is
  // telemetry, not a transcript store, and is covered by the retention policy.
  void logPrediction({
    feature: 'speaking_eval',
    subject,
    submissionId,
    modelName: 'speaking_eval',
    modelVersion: activeModel.version,
    provider: evalProvider,
    modelId: evalModelId,
    prompt,
    promptSha: activeModel.promptSha,
    inputChars: prompt.length,
    outputChars: JSON.stringify(evaluation).length,
    latencyMs: Date.now() - llmStartedAt,
    status: 'ok',
    confidence: Number.isFinite(Number(evaluation.confidence)) ? Number(evaluation.confidence) : null,
    parsedOutput: { scores: evaluation.scores || null, rubricAvg: evaluation.rubricAvg ?? null, cefr: evaluation.cefrEstimate ?? null },
  }).catch(() => {});

  return res.status(200).json({
    transcription,
    fluency,
    evaluation,
  });
}
