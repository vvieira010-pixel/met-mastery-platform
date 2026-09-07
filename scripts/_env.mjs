/**
 * scripts/_env.mjs — minimal .env loader shared by the ML scripts.
 *
 * These scripts run outside Vite, so nothing injects env vars for them. Reads
 * .env then .env.local (local wins) without taking a dependency on dotenv.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadEnv() {
  const out = {};
  for (const name of ['.env', '.env.local']) {
    const file = join(ROOT, name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

/** Env merged over the real process env, so CLI overrides still work. */
export function env() {
  return { ...loadEnv(), ...process.env };
}

export function requireSupabase() {
  const e = env();
  const url = e.SUPABASE_URL || e.VITE_SUPABASE_URL;
  const key = e.SUPABASE_SERVICE_ROLE_KEY || e.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).');
    process.exit(1);
  }
  return { url: url.replace(/\/+$/, ''), key };
}
