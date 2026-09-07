/**
 * api/_ml/registry.js — versioned model/prompt lookup with instant rollback.
 *
 * Runtime reads the ACTIVE row for (kind, name). Rollback is a single row update
 * (or the ml_activate SQL function), not a redeploy. If the table is missing,
 * unreachable, or has no active row, callers get their hardcoded fallback — the
 * registry can degrade but must never take a feature down.
 */
import { getSupabaseUrl, getServiceKey } from '../_config.js';
import { selectRows } from './store.js';

const CACHE_TTL_MS = 60_000;
const cache = new Map();

function cacheKey(kind, name) {
  return `${kind}:${name}`;
}

/** Test seam: drop memoised lookups between assertions. */
export function clearRegistryCache() {
  cache.clear();
}

/**
 * Resolve the active registry entry.
 * @param {'model'|'prompt'} kind
 * @param {string} name
 * @param {object} fallback returned when the registry cannot answer
 */
export async function getActive(kind, name, fallback = null) {
  const key = cacheKey(kind, name);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const rows = await selectRows(
    'ml_model_registry',
    `kind=eq.${encodeURIComponent(kind)}&name=eq.${encodeURIComponent(name)}&status=eq.active&select=*&limit=1`,
  );

  const value = rows.length
    ? {
        kind: rows[0].kind,
        name: rows[0].name,
        version: rows[0].version,
        provider: rows[0].provider,
        modelId: rows[0].model_id,
        prompt: rows[0].prompt,
        promptSha: rows[0].prompt_sha,
        config: rows[0].config || {},
      }
    : fallback;

  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

/**
 * Atomically make `version` the active one for (kind, name).
 * @returns {Promise<{ok: boolean, reason: string|null}>}
 */
export async function promoteVersion(kind, name, version) {
  const url = getSupabaseUrl();
  const key = getServiceKey();
  if (!url || !key) return { ok: false, reason: 'no-credentials' };
  try {
    const res = await fetch(`${url}/rest/v1/rpc/ml_activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ p_kind: kind, p_name: name, p_version: version }),
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };
    clearRegistryCache();
    return { ok: true, reason: null };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
