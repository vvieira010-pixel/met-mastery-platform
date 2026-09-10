#!/usr/bin/env node
/**
 * optimize-audio.mjs
 *
 * Re-encodes oversized MP3s in public/ to 96 kbps mono — plenty for speech, and the
 * listening exercises are all voice recordings. Only touches files where the saving is
 * real (current bitrate above MIN_BITRATE), so already-lean files are left alone.
 *
 * Writes in place with the SAME filename, so no code references change.
 * Every file is git-tracked, so `git checkout -- public/` fully reverts.
 *
 * Usage:
 *   node scripts/optimize-audio.mjs           # dry run — report only
 *   node scripts/optimize-audio.mjs --apply   # actually rewrite
 *
 * Requires ffmpeg + ffprobe on PATH.
 */

import { readdir, stat, rename } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = 'public';
const TARGET_BITRATE = 96;      // kbps — comfortable for speech
const MIN_BITRATE = 112;        // skip files already at/below this
const MIN_BYTES = 250 * 1024;   // ignore small files entirely
const APPLY = process.argv.includes('--apply');

const SKIP_DIRS = new Set(['node_modules', '.git', 'mock-test-2', 'mock-test-3']);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function probe(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-select_streams', 'a:0',
    '-show_entries', 'stream=bit_rate,channels,duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const [bitrate, channels, duration] = stdout.trim().split('\n');
  return {
    bitrate: Math.round(Number(bitrate) / 1000), // bps -> kbps
    channels: Number(channels) || 2,
    duration: Number(duration) || 0,
  };
}

const files = (await walk(ROOT)).filter((f) => extname(f).toLowerCase() === '.mp3');
const rows = [];
let skipped = 0;

for (const f of files) {
  let before = 0;
  try {
    before = (await stat(f)).size;
    if (before < MIN_BYTES) { skipped++; continue; }

    const info = await probe(f);
    // Already lean? Leave it alone rather than degrade it for a few KB.
    if (info.bitrate && info.bitrate <= MIN_BITRATE) { skipped++; continue; }

    const tmp = `${f}.opt-tmp.mp3`;
    let after = before;
    try {
      await run('ffmpeg', [
        '-nostdin', '-y', '-i', f,
        '-codec:a', 'libmp3lame',
        '-b:a', `${TARGET_BITRATE}k`,
        '-ac', '1',
        '-ar', '44100',
        '-loglevel', 'error',
        tmp,
      ]);
      after = (await stat(tmp)).size;
      if (APPLY && after < before) {
        await rename(tmp, f);
        tmp = null; // consumed — nothing to clean up
      }
    } finally {
      // Always remove the temp file. An earlier version shelled out to `node -e` here and
      // swallowed the error, which silently littered public/ with *.opt-tmp.mp3 files.
      if (tmp) await rm(tmp, { force: true });
    }

    rows.push({
      file: f, before, after, saved: before - after,
      bitrate: info.bitrate, channels: info.channels,
      duration: Math.round(info.duration),
    });
  } catch (err) {
    rows.push({ file: f, before, after: before, saved: 0, error: err.message });
  }
}

rows.sort((a, b) => b.saved - a.saved);

const totalBefore = rows.reduce((s, r) => s + (r.before || 0), 0);
const totalAfter = rows.reduce((s, r) => s + (r.after || 0), 0);
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${rows.length} re-encoded, ${skipped} skipped (already lean or tiny)\n`);
console.log('  saved'.padStart(9), 'before'.padStart(9), 'after'.padStart(9), '  file');
console.log('-'.repeat(96));
for (const r of rows.slice(0, 20)) {
  if (r.error) { console.log('  ERROR ', relative(ROOT, r.file), '—', r.error); continue; }
  console.log(
    mb(r.saved).padStart(9),
    mb(r.before).padStart(9),
    mb(r.after).padStart(9),
    ' ',
    relative(ROOT, r.file),
  );
}
if (rows.length > 20) console.log(`  … and ${rows.length - 20} more`);
console.log('-'.repeat(96));
console.log(`total: ${mb(totalBefore)} → ${mb(totalAfter)}  (saves ${mb(totalBefore - totalAfter)}, ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
