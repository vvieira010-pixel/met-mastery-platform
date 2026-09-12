/**
 * api/evaluate-writing.js — Serverless endpoint for evaluating MET writing responses.
 *
 * Takes { essay, taskPrompt, subject, submissionId }
 * Scores the essay against the official MET Writing Rating Scale (5 criteria,
 * whole levels 0–4) via Gemini (primary) with graceful fallback to Groq.
 * Scoring (avg → scaled 0–80 → CEFR) is computed server-side,
 * deterministically — never LLM-derived.
 */

import { verifySupabaseSession } from './_supabase-auth.js';
import { buildExaminerPrompt, rubricToScaled } from './_met-writing-scale.js';
import { parseLLMJson } from './_assemblyai-llm.js';
import { logPrediction } from './_ml/log.js';
import { guardRateLimit, enforceDistributedCap, rateLimitIdentity, LIMITS } from './_rate-limit.js';
import { getActive } from './_ml/registry.js';
import { telemetryEnabled } from './_ml/store.js';

const env = (name) => process.env[name] || '';

const MAX_ESSAY_CHARS = 12000;
const WRITING_KEYS = ['task', 'organization', 'grammar', 'vocabulary', 'mechanics'];

function fetchWithTimeout(url, init, ms = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/**
 * MET Writing uses whole criterion levels only. Reject partial/missing values,
 * decimals, strings, booleans, and values outside 0–4 instead of coercing an
 * invalid model response into a plausible-looking score.
 */
export function extractWholeWritingScores(evaluation) {
  const source = evaluation?.scores;
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const scores = {};
  for (const key of WRITING_KEYS) {
    const value = source[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 4) return null;
    scores[key] = value;
  }
  return scores;
}

async function scoreWithGemini(prompt) {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      },
      12000,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const evaluation = parseLLMJson(raw);
    const scores = extractWholeWritingScores(evaluation);
    return scores
      ? { evaluation: { ...evaluation, scores }, provider: 'gemini', modelId: 'gemini-2.5-flash' }
      : null;
  } catch (e) {
    console.warn('Gemini writing eval error:', e.message);
    return null;
  }
}

async function scoreWithGroq(prompt) {
  const key = env('GROQ_API_KEY');
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      },
      12000,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const evaluation = parseLLMJson(data?.choices?.[0]?.message?.content || '');
    const scores = extractWholeWritingScores(evaluation);
    return scores
      ? { evaluation: { ...evaluation, scores }, provider: 'groq', modelId: 'llama-3.3-70b-versatile' }
      : null;
  } catch (e) {
    console.warn('Groq writing eval error:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Paid AI endpoint — require a valid Supabase session.
  const user = await verifySupabaseSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized — valid session required.' });

  if (!guardRateLimit(req, res, { scope: 'evaluate-writing', user })) return;
  // Optional TRUE global cap (audit RATE-1) — dormant unless Upstash is set.
  if (!(await enforceDistributedCap(rateLimitIdentity(req, user), LIMITS['evaluate-writing']))) {
    return res.status(429).json({ error: { message: 'Global rate limit reached. Please try again later.', code: 'rate_limit_global' } });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const { essay, taskPrompt = 'Write an essay on the topic.', subject = null, submissionId = null } = body || {};

  if (typeof essay !== 'string' || essay.trim().length < 10) {
    return res.status(400).json({ error: 'A written essay of at least 10 characters is required.' });
  }
  if (essay.length > MAX_ESSAY_CHARS) {
    return res.status(400).json({ error: 'Essay is too long.' });
  }
  if (typeof taskPrompt !== 'string' || taskPrompt.length > 2000) {
    return res.status(400).json({ error: 'Invalid task prompt.' });
  }

  const prompt = buildExaminerPrompt({ taskPrompt, essay });

  const activeModel = telemetryEnabled()
    ? await getActive('model', 'writing_eval', { version: 'unversioned', promptSha: 'unversioned' })
    : { version: 'unversioned', promptSha: 'unversioned' };

  // Writing never uses AssemblyAI. AssemblyAI is reserved for speaking/audio.
  const attempts = [scoreWithGemini, scoreWithGroq];
  let result = null;
  const llmStartedAt = Date.now();
  for (const attempt of attempts) {
    result = await attempt(prompt);
    if (result) break;
  }

  if (!result) {
    void logPrediction({
      feature: 'writing_eval',
      subject,
      submissionId,
      modelName: 'writing_eval',
      modelVersion: activeModel.version,
      prompt,
      promptSha: activeModel.promptSha,
      inputChars: prompt.length,
      latencyMs: Date.now() - llmStartedAt,
      status: 'provider_error',
      error: 'no provider returned a valid whole-level writing evaluation',
    }).catch(() => {});
    return res.status(503).json({ error: 'AI writing evaluation unavailable. Please try again.' });
  }

  const { evaluation, provider, modelId } = result;
  const scores = extractWholeWritingScores(evaluation);
  if (!scores) {
    return res.status(502).json({ error: 'AI writing evaluation returned invalid rubric scores. Please try again.' });
  }

  // Server-side scoring: average the five official whole-level criteria, then
  // use the formative conversion table to produce the estimated MET band.
  evaluation.scores = scores;
  const nums = WRITING_KEYS.map((key) => scores[key]);
  const avgRaw = nums.reduce((a, b) => a + b, 0) / nums.length;
  const conversion = rubricToScaled(avgRaw);
  evaluation.rubricAvg = conversion.rubricAvg;
  evaluation.scaledScore = conversion.scaledScore;
  evaluation.scaledRange = conversion.scaledRange;
  evaluation.cefrEstimate = conversion.cefr;
  evaluation.overallScore = Math.round(avgRaw * 10) / 10;

  void logPrediction({
    feature: 'writing_eval',
    subject,
    submissionId,
    modelName: 'writing_eval',
    modelVersion: activeModel.version,
    provider,
    modelId,
    promptSha: activeModel.promptSha,
    inputChars: prompt.length,
    outputChars: JSON.stringify(evaluation).length,
    latencyMs: Date.now() - llmStartedAt,
    status: 'ok',
    confidence: Number.isFinite(Number(evaluation.confidence)) ? Number(evaluation.confidence) : null,
    parsedOutput: { scores: evaluation.scores, rubricAvg: evaluation.rubricAvg, cefr: evaluation.cefrEstimate },
  }).catch(() => {});

  return res.status(200).json({ evaluation, provider, model: modelId });
}
