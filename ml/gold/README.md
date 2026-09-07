# Gold set — protocol

The gold set is the thing that makes every later model claim checkable. It is
also the slowest part of Phase 0, because it needs the teacher's time. Protect
that time or the rest of the plan stalls.

## Targets

| Modality | Samples | Why |
|---|---|---|
| Writing | 100 | Enough for a QWK confidence interval of roughly ±0.07 |
| Speaking | 50 | Enough for a first agreement read; expand to 200 before Phase 4 |

If 100 is not achievable in two weeks, **do 60 and write down that you did 60.**
A smaller honest gold set with a wider interval beats a target you quietly miss.

## Sequence

1. **Fill in `LABEL_BOOK.md` first — on 10 samples, not 100.** Score 10, argue
   about them, write the anchors, then score the rest. Labeling 100 samples
   against an unwritten standard just produces 100 inconsistent labels.
2. Export candidates: `npm run gold:export -- --modality=writing --limit=120`
3. Two labeling passes, **at least 3 weeks apart**, with different display IDs
   (`pass1.csv` / `pass2.csv`). The mapping between them lives in `mapping.json`
   and stays with the coordinator, not the rater.
4. Adjudicate disagreements into `gold_adjudicated` with a one-line rationale.
   The rationale is what turns a disagreement into a label-book entry.
5. Compute the human ceiling: `python ml/eval/agreement.py --rater1 pass1.csv --rater2 pass2.csv`
6. Publish the ceiling in `docs/AI-PHASE0-FOUNDATION.md`. **Every model target is
   expressed as a fraction of it** (default: 0.90 × human ceiling).

## Sampling

- Draw from **real student work**, not generated text. The distribution shift
  between synthetic and real B1–B2 nurse writing is the whole difficulty.
- Round-robin across students so no single student dominates (the exporter does
  this). Grouped cross-validation later assumes multiple students.
- Stratify by task type if you can: at least 5 samples per task type you support.
- Reserve ~20% as `holdout` and never look at it during development.

## Privacy

- The exporter pseudonymises the student (`subject_ref = sha256(salt:email)`) and
  redacts emails and the student's own name from the response text.
- Adjudicated gold rows stay in Supabase deliberately — they are an evaluation
  asset, not telemetry, and are excluded from the retention sweep.
- Set `AI_TELEMETRY_SALT` before the first export. Changing it later breaks the
  join between gold labels and prediction logs.

## Files

| File | Purpose |
|---|---|
| `schema.json` | Shape of a gold sample + its retained rater passes |
| `LABEL_BOOK.md` | Anchor examples per band — fill this in first |
| `candidates/<date>/pass1.csv` | First labeling pass |
| `candidates/<date>/pass2.csv` | Second pass, different display IDs |
| `candidates/<date>/mapping.json` | Coordinator-only link between pass IDs |
| `candidates/<date>/manifest.json` | Provenance: table, filters, sample counts |
