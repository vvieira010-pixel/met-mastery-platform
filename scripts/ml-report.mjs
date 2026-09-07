#!/usr/bin/env node
/**
 * scripts/ml-report.mjs — cost, latency and reliability per AI feature.
 *
 *   npm run ml:report            last 14 days
 *   npm run ml:report -- --days 30
 *
 * Reads the v_ai_feature_daily / v_ai_model_daily / v_gold_set_progress views
 * created by supabase/migrations/20260907000000_ai_measurement_foundation.sql.
 * Costs where usage was not returned by the provider are estimated from
 * character counts (see api/_ml/pricing.js) — good enough to spot a runaway
 * feature, not to reconcile an invoice.
 */
import { requireSupabase } from './_env.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] === undefined ? true : m[2]] : [];
  }),
);
const DAYS = Math.min(Math.max(Number(args.days) || 14, 1), 365);

const { url, key } = requireSupabase();

async function select(view, query) {
  const res = await fetch(`${url}/rest/v1/${view}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (res.status === 404) {
    console.error(`View "${view}" is missing. Apply supabase/migrations/20260907000000_ai_measurement_foundation.sql first.`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`Supabase returned ${res.status} for ${view}.`);
    process.exit(1);
  }
  return res.json();
}

const pad = (v, n) => String(v ?? '').padEnd(n);
const num = (v, n) => String(v ?? '').padStart(n);
const money = (v) => `$${Number(v || 0).toFixed(2)}`;

function withinDays(rows, field = 'day') {
  const cutoff = new Date(Date.now() - DAYS * 86400000).toISOString().slice(0, 10);
  return rows.filter((r) => String(r[field] ?? '') >= cutoff);
}

function table(title, columns, rows) {
  console.log(`\n${title}`);
  if (!rows.length) {
    console.log('  (no rows in window)');
    return;
  }
  console.log(`  ${columns.map(([h, w]) => pad(h, w)).join('')}`);
  for (const r of rows) {
    console.log(`  ${columns.map(([h, w, f]) => (f === 'r' ? num(r[h], w) : pad(r[h], w))).join('')}`);
  }
}

async function main() {
  const [features, models, gold] = await Promise.all([
    select('v_ai_feature_daily', 'select=*&order=day.desc&limit=1000'),
    select('v_ai_model_daily', 'select=*&order=day.desc&limit=1000'),
    select('v_gold_set_progress', 'select=*'),
  ]);

  const f = withinDays(features);
  const m = withinDays(models);

  console.log(`AI telemetry — last ${DAYS} day(s)`);
  if (!f.length && !m.length) {
    console.log('\nNo telemetry yet. Predictions are logged from api/ai.js and api/evaluate-speaking.js.');
  }

  table('By feature', [['feature', 22], ['n', 7, 'r'], ['ok%', 7, 'r'], ['p50ms', 8, 'r'], ['p95ms', 8, 'r'], ['cost', 10, 'r']],
    f.map((r) => ({
      feature: r.feature,
      n: r.n,
      'ok%': Number(r.ok_pct ?? 0).toFixed(1),
      p50ms: r.p50_ms === null ? '-' : Math.round(r.p50_ms),
      p95ms: r.p95_ms === null ? '-' : Math.round(r.p95_ms),
      cost: money(r.cost_usd),
    })));

  if (f.length) {
    const totalN = f.reduce((a, r) => a + Number(r.n || 0), 0);
    const totalCost = f.reduce((a, r) => a + Number(r.cost_usd || 0), 0);
    const okN = f.reduce((a, r) => a + Number(r.n_ok || 0), 0);
    console.log(`  ${pad('TOTAL', 22)}${num(totalN, 7)}${num(totalN ? ((okN / totalN) * 100).toFixed(1) : '0.0', 7)}${num('', 8)}${num('', 8)}${num(money(totalCost), 10)}`);
    console.log(`  projected monthly cost at this rate: ${money((totalCost / DAYS) * 30)}`);
  }

  table('By provider model', [['provider', 14], ['model_id', 34], ['n', 7, 'r'], ['p95ms', 8, 'r'], ['cost', 10, 'r']],
    m.map((r) => ({
      provider: r.provider,
      model_id: String(r.model_id).slice(0, 33),
      n: r.n,
      p95ms: r.p95_ms === null ? '-' : Math.round(r.p95_ms),
      cost: money(r.cost_usd),
    })));

  table('Gold set', [['modality', 14], ['samples', 9, 'r'], ['pass1', 8, 'r'], ['pass2', 8, 'r'], ['adjudicated', 12, 'r']],
    gold.map((r) => ({
      modality: r.modality,
      samples: r.samples,
      pass1: r.labeled_pass1,
      pass2: r.labeled_pass2,
      adjudicated: r.adjudicated,
    })));

  const failures = f.filter((r) => Number(r.ok_pct ?? 100) < 95);
  if (failures.length) {
    console.log('\nFeatures below 95% success:');
    for (const r of failures) console.log(`  ${r.feature} on ${r.day}: ${r.ok_pct}%`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
