/**
 * api/_ml/store.js — the only place telemetry touches the network.
 *
 * Design rules (these are the whole point of the module):
 *  1. NEVER throw. Telemetry must not be able to fail a user request.
 *  2. NEVER block for long. Inserts are aborted at TELEMETRY_TIMEOUT_MS.
 *  3. Fail silently and cheaply when credentials or the table are absent, so the
 *     migration can land independently of the code that writes to it.
 */
import { getSupabaseUrl, getServiceKey } from '../_config.js';

export const TELEMETRY_TIMEOUT_MS = Number(process.env.AI_TELEMETRY_TIMEOUT_MS || 1200);

/** Master switch. Set AI_TELEMETRY=0 to disable all prediction/event logging. */
export function telemetryEnabled() {
  return String(process.env.AI_TELEMETRY || '1') !== '0';
}

/**
 * Insert rows via the Supabase REST API.
 * @returns {Promise<{ok: boolean, reason: string|null}>}
 */
export async function insertRows(table, rows, timeoutMs = TELEMETRY_TIMEOUT_MS) {
  if (!telemetryEnabled()) return { ok: false, reason: 'disabled' };
  if (!Array.isArray(rows) || rows.length === 0) return { ok: true, reason: null };

  const url = getSupabaseUrl();
  const key = getServiceKey();
  if (!url || !key) return { ok: false, reason: 'no-credentials' };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
      signal: ctrl.signal,
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    return { ok: true, reason: null };
  } catch (err) {
    return { ok: false, reason: err && err.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/** Read rows via the Supabase REST API. Returns [] on any failure. */
export async function selectRows(table, query, timeoutMs = TELEMETRY_TIMEOUT_MS) {
  const url = getSupabaseUrl();
  const key = getServiceKey();
  if (!url || !key) return [];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
      method: 'GET',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
