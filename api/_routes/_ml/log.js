/**
 * api/_ml/log.js — prediction logging.
 *
 * One row per inference in public.ai_predictions. This is the single most
 * valuable ML asset the project will own after six months: it is what makes
 * "did the change help?" answerable, and it is the sampling frame for the gold
 * set. Everything here is best-effort — a telemetry failure is invisible to the
 * user and must never change a response.
 */
import { insertRows, telemetryEnabled } from './store.js';
import { subjectRef, inputHash, promptSha } from './hash.js';
import { estimateCost } from './pricing.js';

const MAX_STORED_JSON_CHARS = 4000;

/** Cap how much of a parsed payload we persist, without breaking the jsonb column. */
export function compactJson(value, limit = MAX_STORED_JSON_CHARS) {
  if (value === undefined || value === null) return null;
  let str;
  try {
    str = JSON.stringify(value);
  } catch {
    return null;
  }
  if (str.length <= limit) return value;
  return { truncated: true, preview: str.slice(0, limit) };
}

/**
 * Pure builder — exported so tests can assert the shape without a network.
 */
export function buildPredictionRecord(input = {}) {
  const {
    feature,
    subject = null,
    submissionId = null,
    modelName = null,
    modelVersion = null,
    provider = null,
    modelId = null,
    prompt = null,
    promptSha: explicitPromptSha = null,
    inputParts = null,
    inputChars = null,
    outputChars = null,
    promptTokens = null,
    completionTokens = null,
    latencyMs = null,
    status = 'ok',
    confidence = null,
    parsedOutput = null,
    error = null,
    now = Date.now(),
  } = input;

  const cost = estimateCost({ modelId, promptChars: inputChars, completionChars: outputChars, promptTokens, completionTokens });

  return {
    created_at: new Date(now).toISOString(),
    feature: String(feature || 'unknown'),
    subject_ref: subjectRef(subject),
    submission_id: submissionId || null,
    model_name: modelName,
    model_version: modelVersion,
    provider: provider || null,
    model_id: modelId || null,
    prompt_sha: explicitPromptSha || promptSha(prompt),
    input_hash: inputParts ? inputHash(inputParts) : null,
    input_chars: Number.isFinite(inputChars) ? Number(inputChars) : null,
    output_chars: Number.isFinite(outputChars) ? Number(outputChars) : null,
    prompt_tokens: cost.promptTokens,
    completion_tokens: cost.completionTokens,
    tokens_estimated: cost.tokensEstimated,
    cost_usd: cost.costUsd,
    latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : null,
    status: status || 'ok',
    confidence: Number.isFinite(confidence) ? Number(confidence) : null,
    parsed_output: compactJson(parsedOutput),
    error: error ? String(error).slice(0, 500) : null,
    app_env: process.env.VERCEL_ENV || process.env.APP_ENV || 'local',
  };
}

/**
 * Write one prediction row. Fire-and-forget safe: never throws.
 * @returns {Promise<{ok: boolean, reason: string|null}>}
 */
export async function logPrediction(input) {
  if (!telemetryEnabled()) return { ok: false, reason: 'disabled' };
  try {
    const row = buildPredictionRecord(input);
    return await insertRows('ai_predictions', [row]);
  } catch {
    return { ok: false, reason: 'build-failed' };
  }
}
