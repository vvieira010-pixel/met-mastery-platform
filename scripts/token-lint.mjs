#!/usr/bin/env node
// Token-lint guardrail (D5 from DESIGN-SYSTEM-AUDIT-2026-09-03.md).
// Fails the build if any off-brand Tailwind-default hex color re-enters src/.
// These are the exact 23 hexes removed by the D2 remediation. The MET design
// system routes all color through src/styles/tokens.css var(--*); reintroducing
// raw Tailwind slate/blue/green/red literals breaks brand coherence.
//
// Deliberate divergence allowed: src/components/AcademicProgressChart.jsx
// (the D3 chart palette, an explicit user-accepted exception) is excluded.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

// Off-brand Tailwind-default palette (lowercase, with leading #).
const BANNED = new Set([
  '#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8',
  '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc',
  '#0284c7', '#0ea5e9', '#2563eb', '#3b82f6',
  '#16a34a', '#22c55e', '#059669', '#10b981',
  '#dc2626', '#ef4444',
  '#d97706', '#f59e0b',
  '#888',
]);

// Explicitly allowed divergences (D3 chart, user-accepted).
const EXCLUDE = ['src/components/AcademicProgressChart.jsx'];

const SCAN_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less']);
const HEX_RE = /#[0-9a-fA-F]{3}(?![0-9a-fA-F])|#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g;

function isExcluded(rel) {
  return EXCLUDE.some((e) => rel.split(sep).join('/') === e || rel.endsWith(e));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.tmp') continue;
      walk(full, out);
    } else if (SCAN_EXT.has(entry.slice(entry.lastIndexOf('.')))) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const files = walk(SRC);
  const violations = [];
  for (const file of files) {
    const rel = relative(ROOT, file);
    if (isExcluded(rel)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const matches = line.match(HEX_RE);
      if (!matches) return;
      for (const m of matches) {
        if (BANNED.has(m.toLowerCase())) {
          violations.push({ file: rel, line: i + 1, hex: m });
        }
      }
    });
  }

  if (violations.length) {
    console.error('\n✗ token-lint: off-brand Tailwind hex colors found in src/');
    console.error('  Route all color through tokens.css var(--*) instead.\n');
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}  ${v.hex}`);
    }
    console.error(`\n  ${violations.length} violation(s). Build blocked.`);
    process.exit(1);
  }

  console.log(`✓ token-lint: scanned ${files.length} files in src/, no off-brand tokens.`);
  process.exit(0);
}

main();
