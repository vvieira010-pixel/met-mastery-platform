import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

/*
 * Load test for POST /api/ai (diagnostic feedback path).
 * AI latency dominates: thresholds use seconds, not milliseconds.
 *
 * Run:
 *   k6 run tests/api/ai/ai-feedback.k6.js
 *   k6 run -e BASE_URL=https://staging.example -e PROMPT_CHARS=4000 tests/api/ai/ai-feedback.k6.js
 *   k6 cloud tests/api/ai/ai-feedback.k6.js
 */

const errorRate = new Rate('errors');
const feedbackLatency = new Trend('ai_feedback_duration');
const validationLatency = new Trend('ai_validation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // ramp to 5 VUs
    { duration: '1m', target: 20 }, // ramp to 20 VUs
    { duration: '2m', target: 20 }, // sustain
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<18000', 'p(99)<25000'],
    errors: ['rate<0.05'],
    ai_feedback_duration: ['p(95)<18000'],
    ai_validation_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PROMPT_CHARS = Number(__ENV.PROMPT_CHARS || 2000);

function feedbackPrompt() {
  const evidence = 'I worked the night shift yesterday. '.repeat(
    Math.max(1, Math.floor(PROMPT_CHARS / 38)),
  );
  return (
    'You are a warm English Tutor. Return ONLY VALID JSON with ' +
    'classFocus, whatYouDidWell[3], whatToImprove, finalNote. ' +
    `Evidence: ${evidence}`
  );
}

export default function () {
  // 1) Validation fast-path: missing prompt => 400 (no provider call).
  const invalidRes = http.post(
    `${BASE_URL}/api/ai`,
    JSON.stringify({}),
    { headers: { 'Content-Type': 'application/json' } },
  );
  validationLatency.add(invalidRes.timings.duration);
  check(invalidRes, {
    'validation: status 400': (r) => r.status === 400,
    'validation: mentions prompt': (r) => String(r.body).toLowerCase().includes('prompt'),
  }) || errorRate.add(1);

  sleep(1);

  // 2) Feedback path: full prompt => 200 | 429 | 502 | 503 depending on
  // keys/quota. All four are "correct" proxy behavior under load.
  const res = http.post(
    `${BASE_URL}/api/ai`,
    JSON.stringify({
      prompt: feedbackPrompt(),
      max_tokens: 2600,
      temperature: 0.3,
      feature: 'diagnostic_feedback',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  feedbackLatency.add(res.timings.duration);
  const ok = check(res, {
    'feedback: status is proxy-correct (200/429/502/503)': (r) =>
      [200, 429, 502, 503].includes(r.status),
    'feedback: 200 has content array': (r) => {
      if (r.status !== 200) return true;
      try {
        return Array.isArray(JSON.parse(r.body).content);
      } catch {
        return false;
      }
    },
    'feedback: 429 carries Retry-After': (r) => {
      if (r.status !== 429) return true;
      return Boolean(r.headers['Retry-After']);
    },
    'feedback: 502 is generic (no provider leak)': (r) => {
      if (r.status !== 502) return true;
      const b = String(r.body).toLowerCase();
      return !b.includes('gemini') && !b.includes('gsk_') && !b.includes('AIza');
    },
  });
  if (!ok) errorRate.add(1);

  sleep(1);
}
