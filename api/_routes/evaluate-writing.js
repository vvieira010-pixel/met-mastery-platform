/**
 * api/evaluate-writing.js — Serverless endpoint for evaluating MET writing responses.
 *
 * Takes { essay, taskPrompt, subject, submissionId }
 * Scores the essay against the official MET Writing Rating Scale (5 criteria,
 * 0.0–4.0 each in 0.5 steps) via Gemini (primary) with graceful fallback to
 * Groq. Scoring (avg → scaled 0–80 → CEFR) is computed server-side,
 * deterministically — never LLM-derived.
 */

import { verifySupabaseSession } from './_supabase-auth.js';
import { buildExaminerPrompt, rubricToScaled } from './_met-writing-scale.js';
import { parseLLMJson, extractScores } from './_assemblyai-llm.js';
import { logPrediction } from './_ml/log.js';
import { getActive } from './_ml/registry.js';
import { telemetryEnabled } from './_ml/store.js';

const env = (name) => process.env[name] || '';

const MAX_ESSAY_CHARS = 12000;

function fetchWithTimeout(url, init, ms = 25000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

const WRITING_KEYS = ['task', 'organization', 'grammar', 'vocabulary', 'mechanics'];

async function scoreWithGemini(prompt) {
  const key = env('GEMINI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 2048 } }),
      },
      12000,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    const parsed = parseLLMJson(raw);
    return extractScores(parsed, WRITING_KEYS) ? { evaluation: parsed, provider: 'gemini', modelId: 'gemini-2.5-flash' } : null;
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
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.2, messages: [{ role: 'user', content: prompt }] }),
      },
      12000,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = parseLLMJson(data?.choices?.[0]?.message?.content || '');
    return extractScores(parsed, WRITING_KEYS) ? { evaluation: parsed, provider: 'groq', modelId: 'llama-3.3-70b-versatile' } : null;
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

  // 0. AssemblyAI LLM Gateway is the requested primary scorer.
  // 1–3. Fall back to existing providers so evaluation never goes down.
  const attempts = [scoreWithGemini, scoreWithGroq];
  let result = null;
  const llmStartedAt = Date.now();
  for (const attempt of attempts) {
    result = await attempt(prompt);
    if (result) break;
  }

  if (!result) {
    await logPrediction({
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
      error: 'no provider returned a parseable evaluation',
    });
    return res.status(503).json({ error: 'AI evaluation unavailable — no provider responded. Please try again.' });
  }

  const { evaluation, provider, modelId } = result;

  // Server-side scoring: average 5 criteria → snap to 0.5 → scaled 0–80 + CEFR.
  const s = extractScores(evaluation, WRITING_KEYS) || {};
  // Clamp to the official 0–4 range so an out-of-range model value can't skew the average.
  const nums = WRITING_KEYS.map((k) => Math.min(4, Math.max(0, Number(s[k] || 0))));
  const avgRaw = nums.reduce((a, b) => a + b, 0) / nums.length;
  const conversion = rubricToScaled(Number.isFinite(avgRaw) ? avgRaw : 0);
  evaluation.rubricAvg = conversion.rubricAvg;
  evaluation.scaledScore = conversion.scaledScore;
  evaluation.scaledRange = conversion.scaledRange;
  evaluation.cefrEstimate = conversion.cefr;
  // Backward-compatible summary used by results UIs.
  evaluation.overallScore = Math.round(avgRaw * 10) / 10;

  await logPrediction({
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
    parsedOutput: { scores: evaluation.scores || null, rubricAvg: evaluation.rubricAvg ?? null, cefr: evaluation.cefrEstimate ?? null },
  });

  return res.status(200).json({ evaluation, provider, model: modelId || 'gemini-2.5-flash' });
}
