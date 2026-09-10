#!/usr/bin/env node
/**
 * optimize-images.mjs
 *
 * Re-encodes oversized raster images in public/ so they stop dominating the deploy.
 * Writes in place with the SAME filename and SAME extension, so no code references
 * need updating. Every file processed is tracked in git, so `git checkout -- public/`
 * fully reverts.
 *
 * Usage:
 *   node scripts/optimize-images.mjs          # dry run — report only, writes nothing
 *   node scripts/optimize-images.mjs --apply  # actually rewrite the files
 *
 * Strategy:
 *   .png  → resize to MAX_EDGE, then quantise to a 256-colour palette (grayscale when
 *           the source is already grayscale). Illustrations like the isometric speaking
 *           prompts collapse from ~6.7 MB to a few hundred KB with no visible loss.
 *   .jpg  → resize to MAX_EDGE, re-encode with mozjpeg at quality 80.
 *
 * A file is only overwritten when the result is actually smaller (and by >5%).
 */

import { readdir, stat, readFile, writeFile, rename } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public';
const MAX_EDGE = 1600;   // images render at ~520px tall; 1600px is generous
const MIN_BYTES = 300 * 1024; // ignore anything already under 300 KB
const APPLY = process.argv.includes('--apply');

const SKIP_DIRS = new Set(['node_modules', '.git', 'stitch', 'mock-test-2', 'mock-test-3']);

// Marketing / social assets — a quantisation artefact here is user-visible on every
// shared link, and the saving is trivial compared to the exercise imagery.
const SKIP_FILES = new Set(['met-mastery-share-card.png']);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

const fmt = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;

/**
 * Metadata alone cannot tell us whether an image is greyscale: the isometric speaking
 * prompts are named "*_grayscale.png" but are actually encoded as RGBA with equal
 * channel values, so `meta.channels` reports 4. Sample the pixels instead.
 */
async function detectGrayscale(image) {
  const { data, info } = await image
    .clone()
    .resize(64, 64, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ch = info.channels;
  if (ch < 3) return true;

  let maxDiff = 0;
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const d = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    if (d > maxDiff) maxDiff = d;
  }
  return maxDiff <= 8;
}

async function optimise(file, results) {
  const ext = extname(file).toLowerCase();
  if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') return;

  const before = (await stat(file)).size;
  if (before < MIN_BYTES) return;
  if (SKIP_FILES.has(file.split(/[\\/]/).pop())) return;

  const image = sharp(file, { failOn: 'error' });
  const meta = await image.metadata();
  const isGray =
    meta.channels <= 2 ||
    meta.space === 'b-w' ||
    meta.space === 'grey16' ||
    (await detectGrayscale(image));

  const needsResize = Math.max(meta.width || 0, meta.height || 0) > MAX_EDGE;
  let pipeline = needsResize
    ? image.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    : image;

  let buf;
  if (ext === '.png') {
    // Palette quantisation is only safe for flat/greyscale artwork (the isometric
    // speaking prompts collapse ~75%). On a photographic PNG it produces visible
    // banding, so colour images get resize + max compression only.
    pipeline = pipeline.png(
      isGray
        ? { palette: true, colours: 64, compressionLevel: 9, adaptiveFiltering: true, effort: 10 }
        : { palette: false, compressionLevel: 9, adaptiveFiltering: true, effort: 10 },
    );
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, chromaSubsampling: '4:2:0' });
  }
  buf = await pipeline.toBuffer();

  const after = buf.length;
  const saved = before - after;

  // Guard: never write a bigger file, and require a meaningful win.
  if (saved <= 0 || after > before * 0.95) {
    results.push({ file, before, after: before, saved: 0, skipped: true });
    return;
  }

  if (APPLY) {
    // Write to a sibling temp file then rename, so a crash never leaves a truncated image.
    const tmp = `${file}.opt-tmp`;
    await writeFile(tmp, buf);
    await rename(tmp, file);
  }

  results.push({ file, before, after, saved, skipped: false, meta: `${meta.width}x${meta.height}` });
}

const files = await walk(ROOT);
const results = [];

for (const f of files) {
  try {
    await optimise(f, results);
  } catch (err) {
    results.push({ file: f, error: err.message });
  }
}

results.sort((a, b) => b.saved - a.saved);

const totalBefore = results.reduce((s, r) => s + (r.before || 0), 0);
const totalAfter = results.reduce((s, r) => s + (r.after || 0), 0);

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'} — ${results.length} candidate images\n`);
console.log('saved'.padStart(9), 'before'.padStart(10), 'after'.padStart(10), ' file');
console.log('-'.repeat(90));
for (const r of results.slice(0, 25)) {
  if (r.error) { console.log('  ERROR  ', relative(ROOT, r.file), '—', r.error); continue; }
  const saved = r.skipped ? '   skip  ' : `${fmt(r.saved)}`.padStart(9);
  console.log(saved, fmt(r.before).padStart(10), fmt(r.after).padStart(10), ' ', relative(ROOT, r.file));
}
console.log('-'.repeat(90));
console.log(`total: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (saves ${fmt(totalBefore - totalAfter)}, ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
if (!APPLY) console.log('\nRe-run with --apply to write these changes.');
