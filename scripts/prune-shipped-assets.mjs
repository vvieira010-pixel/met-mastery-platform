#!/usr/bin/env node
/**
 * prune-shipped-assets.mjs
 *
 * Removes superseded / duplicated assets from the built dist/ after `vite build`.
 *
 * IMPORTANT: nothing under public/ is ever touched. This only prunes dist/, so the
 * git-tracked source masters stay intact and every removed item is reproducible by
 * rebuilding. Two classes of asset are dropped:
 *
 *  1. Legacy WAVs — the listening exercises were converted to 128k mono MP3 and all
 *     124 code references now point at the MP3s, so 40 MB of WAV shouldn't ship.
 *
 *  2. "Practice Studio audios" — a stale copy of public/exercises/audio/listening.
 *     Verified 2026-09-09 by SHA-256: all 84 files (33.3 MB) are byte-identical to a
 *     file elsewhere in public/, and no runtime code resolves into this folder
 *     (audioFile values in the listening banks are bare filenames or `part1/…`).
 *
 * Usage:
 *   node scripts/prune-shipped-assets.mjs [--dry-run]
 *
 * Overrides:
 *   KEEP_WAV_IN_DIST=1        keep the legacy WAVs
 *   KEEP_DUPLICATE_AUDIO=1    keep the duplicate audio folder
 */

import { readdir, rm, stat } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

const ROOT = 'dist';
const DRY_RUN = process.argv.includes('--dry-run');
const keepWav = process.env.KEEP_WAV_IN_DIST === '1';
const keepDupes = process.env.KEEP_DUPLICATE_AUDIO === '1';

/** Directory names pruned wholesale wherever they appear under dist/. */
const PRUNE_DIRS = new Set(['Practice Studio audios']);

async function dirSize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

const removed = [];
const prunedDirs = [];
let bytes = 0;

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!keepDupes && PRUNE_DIRS.has(entry.name)) {
        const size = await dirSize(full);
        bytes += size;
        prunedDirs.push({ path: relative(ROOT, full), size });
        if (!DRY_RUN) await rm(full, { recursive: true, force: true });
        continue;
      }
      await walk(full);
    } else if (!keepWav && extname(entry.name).toLowerCase() === '.wav') {
      const size = (await stat(full)).size;
      bytes += size;
      removed.push(relative(ROOT, full));
      if (!DRY_RUN) await rm(full, { force: true });
    }
  }
}

await walk(ROOT);

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(
  `\nprune-shipped-assets (${DRY_RUN ? 'DRY RUN' : 'applied'}): ` +
    `${removed.length} .wav + ${prunedDirs.length} duplicate dir → ${mb(bytes)} MB reclaimed`,
);
if (prunedDirs.length) {
  for (const d of prunedDirs) console.log(`   dir  ${mb(d.size)} MB  ${d.path}`);
}
if (DRY_RUN && removed.length) {
  console.log(`   (${removed.length} .wav files, e.g. ${removed[0]})`);
}
console.log('');
