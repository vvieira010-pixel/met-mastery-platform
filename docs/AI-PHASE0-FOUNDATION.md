# Phase 0 — AI measurement foundation

Implements Phase 0 of `docs/AI-ML-PLAYBOOK-2026-09-07.md`. Goal: make every AI
feature measurable **before** anyone touches a model. No scoring behaviour
changed; nothing here alters what a student or teacher sees.

Status: code complete, **requires the migration and env vars to go live.**

---

## 1. What shipped

| File | Purpose |
|---|---|
| `supabase/migrations/20260907000000_ai_measurement_foundation.sql` | `ml_model_registry`, `ai_predictions`, `learning_events`, `gold_samples` / `gold_labels` / `gold_adjudicated`, dashboard views, RLS, `ml_activate()` |
| `api/_ml/hash.js` | Salted pseudonymisation (`subject_ref`) + prompt/content digests |
| `api/_ml/pricing.js` | Per-model cost estimation with a non-zero fallback for unknown models |
| `api/_ml/store.js` | The only network egress for telemetry — never throws, aborts at 1.2 s |
| `api/_ml/registry.js` | Active model/prompt lookup, 60 s cache, degrades to a hardcoded fallback |
| `api/_ml/log.js` | `logPrediction()` — one row per inference |
| `api/_ml/events.js` | `logEvent()` / `logEvents()` — learning events |
| `api/log-learning-events.js` | Authenticated client → `learning_events` endpoint |
| `src/lib/ml-events.js` | Browser queue + flush. No-ops outside the browser |
| `scripts/ml-report.mjs` | `npm run ml:report` — cost, latency, error rate, gold-set progress |
| `scripts/export-gold-candidates.mjs` | `npm run gold:export` — double-blind gold set export |
| `ml/gold/` | Gold-set protocol, JSON schema, label book template |
| `ml/eval/agreement.py` | QWK + bootstrap CIs + subgroup slices + human ceiling |
| `tests/ml-telemetry.test.js` | 18 tests over hashing, cost math, and the never-throws contract |

Instrumented: `api/ai.js` (every cascade call, including failures) and
`api/evaluate-speaking.js` (ASR row + rubric-evaluation row).
`src/lib/spaced-repetition.js` now emits a `review` event per practice attempt.

---

## 2. Deploy checklist

1. **Apply the migration.**
   Supabase SQL editor (paste the file) or `supabase db push`. It is additive —
   no existing table is modified.

2. **Set env vars** (see `.env.example`):

   | Var | Notes |
   |---|---|
   | `AI_TELEMETRY_SALT` | **Set once, never rotate.** It links gold labels to prediction logs; rotating it orphans every `subject_ref`. |
   | `AI_TELEMETRY` | `1` default. Set `0` to disable all logging. |
   | `AI_TELEMETRY_TIMEOUT_MS` | Default 1200. Raise only if inserts are being aborted in the logs. |

3. **Redeploy** so the serverless functions pick up the new modules.

4. **Verify.** Trigger one AI evaluation, then:
   ```
   npm run ml:report
   ```
   You should see rows for `ai_proxy` and/or `speaking_eval`. If you see
   "View ... is missing", the migration has not been applied.

---

## 3. Gold set — the remaining Phase 0 work

This is the part that needs the teacher. Sequence:

```bash
# 1. Export candidates (requires AI_TELEMETRY_SALT)
npm run gold:export -- --modality=writing --limit=120

# 2. Fill in ml/gold/LABEL_BOOK.md using the first 10 samples BEFORE scoring the rest

# 3. Two passes, >= 3 weeks apart. Do not open mapping.json while scoring.

# 4. Score human agreement (the ceiling)
pip install -r ml/eval/requirements.txt
python ml/eval/agreement.py --a pass1.csv --b pass2.csv \
    --mapping mapping.json --dims task,organization,language --slice-by cefr_band
```

Targets: **100 writing + 50 speaking.** If that is not reachable in two weeks,
do 60 and record that you did 60 — a smaller honest gold set beats a missed one.

### Record the ceiling here

| Modality | Human QWK | 95% CI | Model target (0.90 × ceiling) | Date |
|---|---|---|---|---|
| Writing | _tbd_ | | | |
| Speaking | _tbd_ | | | |

Every model claim from Phase 1 onward is expressed as a fraction of these
numbers. Do not set a target before the ceiling is measured.

---

## 4. Exit criteria

- [ ] Migration applied; `npm run ml:report` returns rows
- [ ] `AI_TELEMETRY_SALT` set in every environment (Vercel + local)
- [ ] One full week of `ai_predictions` with no `provider_error` spike
- [ ] Gold set exported; `LABEL_BOOK.md` filled for all rubric bands
- [ ] Two labeling passes complete; human ceiling recorded above
- [ ] Cost and p95 latency per feature written into this file

---

## 5. Rollback

- **Telemetry only:** set `AI_TELEMETRY=0`. All logging stops; features unchanged.
- **A bad model/prompt version:** `select public.ml_activate('model', 'speaking_eval', '<previous version>')`.
  The registry is a read-time lookup with a 60 s cache, so rollback takes effect
  within a minute and needs no redeploy.
- **The whole thing:** the new tables are additive. Dropping them removes
  telemetry only; no product table is touched.

---

## 6. Known gaps (deliberate)

- **Prompts are not yet versioned artifacts.** Registry rows are seeded with
  `prompt_sha = 'unversioned'`. Real prompt versioning is Phase 1 work.
- **Only `review` events are emitted from the client.** Exercise answers,
  homework submissions and diagnostics still need wiring in Phase 1.
- **Costs are estimated** where providers do not return usage. Good enough to
  catch a runaway feature, not to reconcile an invoice.
- **No scheduled retention job yet.** The SQL comments at the bottom of the
  migration give the suggested windows; wire them to your scheduler.
