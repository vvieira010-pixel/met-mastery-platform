/**
 * check-ai-providers.mjs — health-check every AI provider key the app can use.
 *
 * Run:  node scripts/check-ai-providers.mjs
 *
 * Loads .env then .env.local (later file wins) and probes each provider with a
 * tiny request. Prints PASS/FAIL per provider plus the model that answered, so
 * a "Regeneration failed: AI generation is temporarily unavailable" report can
 * be traced to an exhausted quota, a dead key, or a stale model id.
 *
 * Keys are never printed — only the last 4 characters.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function loadEnv(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const raw of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const env = { ...loadEnv('.env'), ...loadEnv('.env.local') };
const mask = (k) => (k ? `...${String(k).slice(-4)} (len ${String(k).length})` : '(unset)');
const withTimeout = async (promise, ms) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await promise(ctrl.signal); } finally { clearTimeout(t); }
};

async function probeGemini(key) {
  if (!key) return { ok: false, note: 'no key' };
  const list = await withTimeout((s) => fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, { signal: s },
  ), 15_000);
  if (!list.ok) return { ok: false, note: `models list HTTP ${list.status}` };
  const data = await list.json();
  const names = (data.models || []).map((m) => String(m.name).replace('models/', ''));
  const candidates = names.filter((n) => /^gemini-(2\.5|2\.0|1\.5)/.test(n) && !/-exp|-thinking|tts|image|embedding|vision|live|robotics/.test(n));
  for (const model of candidates.slice(0, 4)) {
    const r = await withTimeout((s) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the word OK.' }] }], generationConfig: { temperature: 0, maxOutputTokens: 8 } }), signal: s },
    ), 20_000);
    if (r.ok) {
      const d = await r.json();
      const text = d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      if (text.trim()) return { ok: true, note: `${model} -> ${JSON.stringify(text.trim().slice(0, 20))}` };
      return { ok: false, note: `${model}: empty response` };
    }
    if (r.status !== 429) return { ok: false, note: `${model}: HTTP ${r.status}` };
  }
  return { ok: false, note: `all ${candidates.length} gemini models returned HTTP 429 (quota exhausted)` };
}

async function probeOpenAICompat(label, url, key, models, extraHeaders = {}) {
  if (!key) return { ok: false, note: 'no key' };
  let last = 'no model tried';
  for (const model of models) {
    try {
      const r = await withTimeout((s) => fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extraHeaders },
        body: JSON.stringify({ model, temperature: 0, max_tokens: 16, messages: [{ role: 'user', content: 'Reply with the word OK.' }] }),
        signal: s,
      }), 25_000);
      if (r.ok) {
        const d = await r.json();
        const text = d?.choices?.[0]?.message?.content || '';
        if (text.trim()) return { ok: true, note: `${model} -> ${JSON.stringify(text.trim().slice(0, 20))}` };
        last = `${model}: empty response`;
      } else {
        const body = await r.text().catch(() => '');
        last = `${model}: HTTP ${r.status} ${body.slice(0, 120).replace(/\s+/g, ' ')}`;
        if (r.status === 401 || r.status === 403) break;
      }
    } catch (e) {
      last = `${model}: ${e.name === 'AbortError' ? 'timeout' : e.message}`;
    }
  }
  return { ok: false, note: last };
}

const GEMINI_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
const results = [];

results.push(['Gemini', mask(GEMINI_KEY), await probeGemini(GEMINI_KEY)]);
results.push(['OpenRouter', mask(env.OPENROUTER_API_KEY), await probeOpenAICompat(
  'OpenRouter', 'https://openrouter.ai/api/v1/chat/completions', env.OPENROUTER_API_KEY,
  ['nvidia/nemotron-3-super-120b-a12b:free', 'google/gemma-4-31b-it:free', 'openrouter/free'],
  { 'X-Title': 'MET Proficiency Mastery' },
)]);
results.push(['Groq', mask(env.GROQ_API_KEY), await probeOpenAICompat(
  'Groq', 'https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY,
  ['openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
)]);
results.push(['NVIDIA NIM', mask(env.NVIDIA_API_KEY), await probeOpenAICompat(
  'NVIDIA', 'https://integrate.api.nvidia.com/v1/chat/completions', env.NVIDIA_API_KEY,
  ['deepseek-ai/deepseek-v4-pro-0813', 'nvidia/nemotron-3-super-120b-a12b'],
)]);
results.push(['AssemblyAI LLM Gateway', mask(env.ASSEMBLYAI_API_KEY), await probeOpenAICompat(
  'AssemblyAI', 'https://llm-gateway.assemblyai.com/v1/chat/completions', env.ASSEMBLYAI_API_KEY,
  [env.ASSEMBLYAI_LLM_MODEL || 'qwen3.5-4b-32k-fast'],
)]);

console.log('');
for (const [name, key, r] of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${name.padEnd(24)} ${key.padEnd(26)} ${r.note}`);
}
console.log('');
