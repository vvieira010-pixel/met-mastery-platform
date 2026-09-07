/**
 * tests/assemblyai-scoring.selftest.mjs
 *
 * Live integration check: scores a sample WRITING essay and a sample SPEAKING
 * transcript through AssemblyAI's LLM Gateway (api/_assemblyai-llm.js) using the
 * official MET rubrics and the same hardened path the endpoints use
 * (callAssemblyAILLMJson → bounded retry → extractScores validation).
 *
 * Run with:  bun tests/assemblyai-scoring.selftest.mjs
 * Requires ASSEMBLYAI_API_KEY (sourced from .env).
 */
import { callAssemblyAILLMJson, extractScores } from '../api/_assemblyai-llm.js';
import { buildExaminerPrompt as writingPrompt, rubricToScaled as writingScaled } from '../api/_met-writing-scale.js';
import { buildExaminerPrompt as speakingPrompt, rubricToScaled as speakingScaled } from '../api/_met-speaking-scale.js';

const ESSAY = `Learning English is very important for my future. Yesterday I went to the library and read a book about science. It was interesting and I learned many new words. However, I think speaking is more difficult than reading because I feel nervous with native speakers.`;
const SPEAK_TRANSCRIPT = `So the last time I went to a shopping mall was last year. I don't enjoy it because I live far away from the city. But the last time I went I had fun because I was with my friends and we bought many things. It was an amazing time.`;
const FLUENCY = 'No acoustic timing available (transcript-only input) — rate Delivery conservatively.';

const W_KEYS = ['task', 'organization', 'grammar', 'vocabulary', 'mechanics'];
const S_KEYS = ['task', 'language', 'delivery'];

async function run() {
  console.log('── WRITING (AssemblyAI LLM Gateway) ──');
  const wPrompt = writingPrompt({ taskPrompt: 'Discuss why learning English matters.', essay: ESSAY });
  const w = await callAssemblyAILLMJson(
    { messages: [{ role: 'user', content: wPrompt }], temperature: 0.2, maxTokens: 3072 },
    { retries: 1, validateKeys: W_KEYS },
  );
  if (!w.ok) {
    console.error('WRITING FAILED:', w.error, w.requestId || '');
    process.exitCode = 1;
  } else {
    const s = extractScores(w.evaluation, W_KEYS);
    const nums = W_KEYS.map((k) => Math.min(4, Math.max(0, s[k])));
    const conv = writingScaled(nums.reduce((a, b) => a + b, 0) / nums.length);
    console.log('scores:', s);
    console.log('rubricAvg:', conv.rubricAvg, '| scaledScore:', conv.scaledScore, '| CEFR:', conv.cefr);
    console.log('model:', w.model, '| requestId:', w.requestId);
  }

  console.log('\n── SPEAKING (AssemblyAI LLM Gateway) ──');
  const sPrompt = speakingPrompt({ taskPrompt: 'Describe your last visit to a shopping mall.', transcription: SPEAK_TRANSCRIPT, fluencyLine: FLUENCY });
  const sp = await callAssemblyAILLMJson(
    { messages: [{ role: 'user', content: sPrompt }], temperature: 0.2, maxTokens: 3072 },
    { retries: 1, validateKeys: S_KEYS },
  );
  if (!sp.ok) {
    console.error('SPEAKING FAILED:', sp.error, sp.requestId || '');
    process.exitCode = 1;
  } else {
    const s = extractScores(sp.evaluation, S_KEYS);
    const nums = S_KEYS.map((k) => Math.min(4, Math.max(0, s[k])));
    const conv = speakingScaled(nums.reduce((a, b) => a + b, 0) / nums.length);
    console.log('scores:', s);
    console.log('rubricAvg:', conv.rubricAvg, '| scaledScore:', conv.scaledScore, '| CEFR:', conv.cefr);
    console.log('model:', sp.model, '| requestId:', sp.requestId);
  }
}

run();
