#!/usr/bin/env node
/**
 * scripts/export-gold-candidates.mjs — build a double-blind gold set from real work.
 *
 *   npm run gold:export -- --modality=writing --limit=120
 *   npm run gold:export -- --modality=speaking --table=submissions --text-column=transcript
 *
 * Why double-blind: the point of two passes is to measure how much of the
 * disagreement is human rather than model error. If the rater can recognise a
 * response from pass 1, the second pass measures memory, not reliability. So the
 * two CSVs get different display IDs and the mapping stays in a separate file
 * that the rater never opens.
 *
 * No runtime dependencies. Env is read from .env.local then .env (local wins).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, randomInt } from 'node:crypto';
import { loadEnv, ROOT } from './_env.mjs';

const RUBRIC_DIMS = {
  writing: ['task', 'organization', 'language'],
  speaking: ['task', 'language', 'delivery'],
};

const DEFAULT_TABLE = 'mock_test_results';
const DEFAULT_TEXT_PATH = { writing: 'content.writingAnswers', speaking: 'content.speakingAnswers' };
const MAX_RESPONSE_CHARS = 4000;

// ── args ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) args[m[1]] = m[2] === undefined ? true : m[2];
  }
  return args;
}

// ── helpers ──────────────────────────────────────────────────────────────────
function subjectRef(value, salt) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;
  return createHash('sha256').update(`${salt}:${raw}`, 'utf8').digest('hex').slice(0, 32);
}

/** Strip identifiers that would break blinding or leak PII into a CSV. */
function redact(text, names = []) {
  let out = String(text ?? '');
  for (const n of names) {
    if (n && n.length > 2) out = out.replace(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '[name]');
  }
  out = out.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]');
  out = out.replace(/\b(?:\+?\d{1,3}[ -]?)?(?:\(?\d{2,3}\)?[ -]?)?\d{4,5}[ -]?\d{4}\b/g, '[phone]');
  return out;
}

function resolvePath(obj, path) {
  return String(path || '')
    .split('.')
    .reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Interleave by student so no single student dominates the set. */
function roundRobin(rows) {
  const byStudent = new Map();
  rows.forEach((r, i) => {
    const key = r.studentKey || `unknown-${i}`;
    if (!byStudent.has(key)) byStudent.set(key, []);
    byStudent.get(key).push(r);
  });
  const queues = [...byStudent.values()];
  const out = [];
  let more = true;
  while (more) {
    more = false;
    for (const q of queues) {
      if (q.length) {
        out.push(q.shift());
        more = true;
      }
    }
  }
  return out;
}

function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function displayId(rand) {
  const letter = String.fromCharCode(65 + randomInt(0, 26));
  return `${letter}-${String(rand()).slice(2, 5)}`;
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  const env = { ...loadEnv(), ...process.env };

  const modality = String(args.modality || 'writing');
  if (!RUBRIC_DIMS[modality]) {
    console.error(`Unsupported --modality="${modality}". Use writing or speaking.`);
    process.exit(1);
  }

  const table = String(args.table || DEFAULT_TABLE);
  const textPath = String(args['text-column'] || DEFAULT_TEXT_PATH[modality]);
  const limit = Math.min(Math.max(Number(args.limit) || 120, 1), 1000);
  const seed = Number(args.seed) || 20260907;
  const outDir = String(args.out || join(ROOT, 'ml', 'gold', 'candidates', new Date().toISOString().slice(0, 10)));

  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).');
    process.exit(1);
  }
  if (!env.AI_TELEMETRY_SALT) {
    console.error('AI_TELEMETRY_SALT is not set. Set it once and never change it — it links gold labels to prediction logs.');
    process.exit(1);
  }

  const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/${table}?select=*&order=created_at.desc&limit=${limit}`;
  const res = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) {
    console.error(`Supabase returned ${res.status} for ${table}. Check the table name and service key.`);
    process.exit(1);
  }
  const rows = await res.json();

  const candidates = [];
  for (const row of rows) {
    const text = String(resolvePath(row, textPath) ?? '').trim();
    if (text.length < 40) continue; // too short to score a rubric against
    const names = [row?.content?.studentName].filter(Boolean);
    candidates.push({
      studentKey: row.student_id || row.student_email || null,
      response: redact(text, names).slice(0, MAX_RESPONSE_CHARS),
      subjectRef: subjectRef(row.student_id || row.student_email, env.AI_TELEMETRY_SALT),
      sourceId: row.id ? String(row.id) : null,
      taskType: String(args['task-type'] || 'unknown'),
    });
  }

  if (!candidates.length) {
    console.error(`No usable rows. Looked for text at "${textPath}" in "${table}" and found nothing over 40 characters.`);
    process.exit(1);
  }

  const ordered = roundRobin(candidates).slice(0, Number(args.limit) || candidates.length);
  const prefix = modality === 'writing' ? 'w' : 's';
  const samples = ordered.map((c, i) => ({
    sample_id: `${prefix}_${String(i + 1).padStart(4, '0')}`,
    ...c,
  }));

  const rand1 = mulberry32(seed);
  const rand2 = mulberry32(seed + 7919);
  const pass1 = shuffle(samples, rand1);
  const pass2 = shuffle(samples, rand2);

  const idsFor = (list, rand) => {
    const seen = new Set();
    return list.map((s) => {
      let id = displayId(rand);
      while (seen.has(id)) id = displayId(rand);
      seen.add(id);
      return { display_id: id, sample_id: s.sample_id };
    });
  };
  const map1 = idsFor(pass1, rand1);
  const map2 = idsFor(pass2, rand2);

  const dims = RUBRIC_DIMS[modality];
  const header = ['display_id', 'task_type', 'cefr_band', 'response', ...dims, 'overall', 'comments'];

  const toCsv = (map) => {
    const lines = [header.join(',')];
    map.forEach(({ display_id, sample_id }) => {
      const s = samples.find((x) => x.sample_id === sample_id);
      lines.push([display_id, s.taskType, '', csvEscape(s.response), ...dims.map(() => ''), '', ''].join(','));
    });
    return `${lines.join('\n')}\n`;
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'pass1.csv'), toCsv(map1), 'utf8');
  writeFileSync(join(outDir, 'pass2.csv'), toCsv(map2), 'utf8');
  writeFileSync(
    join(outDir, 'mapping.json'),
    `${JSON.stringify({ modality, table, text_path: textPath, created_at: new Date().toISOString(), pass1: map1, pass2: map2 }, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(
    join(outDir, 'manifest.json'),
    `${JSON.stringify(
      {
        modality,
        table,
        text_path: textPath,
        requested_limit: limit,
        exported: samples.length,
        unique_students: new Set(samples.map((s) => s.studentKey)).size,
        max_response_chars: MAX_RESPONSE_CHARS,
        rubric_dimensions: dims,
        seed,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`Exported ${samples.length} ${modality} candidates from "${table}" to ${outDir}`);
  console.log(`  unique students: ${new Set(samples.map((s) => s.studentKey)).size}`);
  console.log(`  pass1.csv + pass2.csv (different display IDs — do not open mapping.json while scoring)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
