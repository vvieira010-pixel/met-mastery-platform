# AI/ML Adoption Playbook — MET Mastery

**Audience:** engineering team, strong in software engineering, new to ML
**Prepared:** 2026-09-07
**Context used:** React 19 + Vite + Supabase, Express API in `api/`, multi-provider LLM cascade (Gemini/OpenAI/Anthropic/Groq/OpenRouter), single-teacher deployment, students = nurses & healthcare professionals preparing for the MET.

---

## 0. Read this first — the five decisions

1. **You do not need to train models yet.** With one teacher and a small cohort, per-student data is measured in hundreds of rows, not millions. Train-your-own models will underperform a well-evaluated LLM pipeline plus a handful of *parametric* statistical models (IRT, BKT, FSRS) that are explicitly designed for sparse data.
2. **Your real bottleneck is labeled data and evaluation infrastructure, not algorithms.** Phase 0 exists to fix that. Everything else is gated on it.
3. **Automated scoring of a high-stakes exam is a regulated-ish, high-trust activity.** Keep a human in the loop, publish an appeals path, and log every score with its provenance. This is a product requirement, not a nice-to-have.
4. **Buy the intelligence (LLM APIs), build the harness.** Your defensible IP is the rubric encoding, the calibration against *your* teacher's grading, and the longitudinal learner data — not the model weights.
5. **Sequence by data-readiness, not by excitement.** Speaking scoring is the most requested and the least ready. Ship writing eval quality + spaced repetition + error tagging first.

**Recommended starting point:** Phase 0 (2 weeks) → Phase 1 (6 weeks). Do not start a model before the gold set exists.

---

## 1. Where you are today — asset inventory

Strengths you already have (most teams starting ML do not):

| Asset | Location | Why it matters for ML |
|---|---|---|
| Live LLM cascade with fallback | `api/ai.js`, `src/lib/callAI.js` | Production inference already running; you need eval + guardrails, not a new serving stack |
| Rubric-conditioned speaking eval | `api/evaluate-speaking.js`, `api/_met-speaking-scale.js` | This is your scoring function v1. It needs a measurement layer around it. |
| Rule-based difficulty schedule | `src/lib/spaced-repetition.js` (fixed `[1,3,7,14,30]`) | Directly replaceable by a memory model (FSRS) — highest ROI per hour in the whole plan |
| Heuristic risk score | `src/lib/risk-metrics.js` | A working baseline any future model must beat. Keep it. |
| MET scoring/CEFR tier logic | `src/lib/met-scoring.ts`, `src/lib/cefr-tier.js` | Source of ground-truth-ish labels and constraint boundaries |
| Supabase Postgres | `src/lib/supabase-db/` | Feature store, label store, and prediction log — you already own it |
| Large human-authored content bank | `src/data/**`, `Exercises/`, `*.md` banks | Perfect corpus for RAG and item-difficulty estimation |

Gaps that will block you:

- **No labeled gold set** with teacher-adjudicated scores and inter-rater agreement.
- **No prediction logging.** You cannot evaluate or debug what you don't record.
- **No cost/latency telemetry** per AI feature.
- **Data lives partly in `localStorage`** (`spaced-repetition.js` falls back to it). Anything in localStorage is invisible to ML. This must move to Postgres.
- **No experiment harness** to prove a change helped.

---

## 2. Capability → use-case fit

Scored for *your* situation. **V** = business value (1–5). **D** = data readiness today (1–5). **E** = engineering effort in person-weeks. **R** = risk if wrong (1–5).

| # | Capability | Use case | V | D | E | R | Verdict |
|---|---|---|---|---|---|---|---|
| U1 | LLM + rubric scoring | Automated **writing** evaluation & feedback | 5 | 5 | 5 | 4 | **NOW** — harden, calibrate, measure |
| U4 | Memory model (FSRS) | Replace fixed SR intervals | 4 | 5 | 2 | 1 | **NOW** — best effort/impact ratio |
| U6 | Embeddings + classifier/LLM | Auto-tag & cluster the error bank | 4 | 4 | 3 | 2 | **NOW** |
| U12 | Vector search (RAG) | Teacher semantic search over content bank | 4 | 5 | 2 | 1 | **NOW** |
| U3 | Psychometrics (IRT) | Ability estimation from diagnostics; adaptive testing | 5 | 3 | 5 | 3 | **NEXT** |
| U5 | Knowledge tracing (BKT) | Per-competency mastery state | 4 | 3 | 4 | 2 | **NEXT** |
| U7 | Contextual bandit | Next-best-exercise recommendation | 4 | 2 | 6 | 2 | **NEXT** — after U3/U5 |
| U9 | LLM generation + QC | Author new items, predict difficulty | 4 | 4 | 4 | 3 | **NEXT** |
| U2 | ASR + prosody | Automated **speaking** scoring | 5 | 2 | 10 | 5 | **LATER** — highest risk, needs data |
| U8 | Tabular ML / forecasting | Student drop-off & exam-readiness prediction | 3 | 2 | 5 | 3 | **LATER** |
| U11 | Regression + IRT | MET band forecasting | 4 | 1 | 4 | 5 | **LATER** — need real outcome data |
| U10 | Detection | AI-authored submission detection | 2 | 1 | 6 | 5 | **PARK** — arms race, false accusations |

### Why the "NOW" four

- **U1** — already 80% built; the remaining 20% (calibration + measurement) is where the value is.
- **U4** — a fixed `[1,3,7,14,30]` ladder ignores whether the student actually remembered. FSRS is open-source, deterministic, needs no training data to start, and personalizes from ~100 reviews per student. Two person-weeks, measurable retention lift.
- **U6** — your error bank is the spine of the product; manual tagging doesn't scale and embedding-based clustering of short text is a solved problem.
- **U12** — pure infrastructure win, unlocks everything else, and the teacher gets value in week one.

### Why speaking scoring (U2) is "LATER" despite being the most valuable

It stacks three failure modes: ASR accuracy on Brazilian-Portuguese-accented English, prosody feature validity, and rubric alignment — each of which independently degrades trust. Ship it as *assistive* (transcript + teacher-facing draft scores) now, and only make it student-facing after the agreement study clears a bar you set in Phase 1.

---

## 3. The recommended end-to-end workflow (adapted to small data)

The textbook lifecycle still applies, but with small-data modifications at each stage. **Do not skip stages — most failed internal ML projects skip 0, 1, and 8.**

### Stage 0 — Problem framing (1–3 days per feature)

Write a one-page spec before any code. Mandatory fields:

- **Decision being automated or supported** (not "add AI to writing" — "produce a 0–5 rubric subscore + 3 actionable feedback comments for a 150-word B2 writing response")
- **User & trigger** (teacher reviews submission → clicks "AI assist")
- **Current baseline** (teacher does it manually, ~6 min/submission)
- **Success metric + threshold** (QWK ≥ 0.70 vs teacher; median review time ≤ 3 min)
- **Failure cost** (a wrong score damages a student's study plan → high)
- **Human-in-the-loop design** (who can override, how, is it logged)
- **Kill criteria** (if QWK < 0.60 after 2 iterations with ≥150 samples, stop and keep manual)

If you can't fill this in, you don't have an ML problem — you have an unresolved product question.

### Stage 1 — Data collection & labeling (the stage you're actually in)

- **Instrument first.** Log every AI call: input hash, prompt version, model + version, full raw output, parsed output, latency, tokens, cost, user, submission ID. See the DDL in Appendix A.
- **Build a gold set.** 100 writing samples + 50 speaking samples, spanning B1→B2+, each scored by the teacher **twice**, at least 3 weeks apart, blind.
- **Measure the human ceiling first.** Compute teacher-vs-teacher QWK. If it's 0.72, demanding 0.85 from a model is nonsense — target `0.9 × human ceiling`.
- **Adjudicate.** Where the two passes disagree, the teacher reconciles into a final gold label with a one-line rationale. That rationale becomes your label book.
- **Write the label book.** A short doc with 2–3 anchor examples per rubric band. This single artifact does more for consistency than any modeling work.

### Stage 2 — Data preparation

- Move all learning state out of `localStorage` into Postgres (`student_id`, item, timestamp, grade, response). Non-negotiable.
- Normalize text (unicode NFC, whitespace, strip PII), store audio in Supabase Storage with a stable URI and retention policy.
- Split **by student** and **by time** — never randomly. See §6.
- Keep raw, immutable `events` table; derive features in views. You will re-derive features many times; you can never recreate lost raw events.

### Stage 3 — Feature engineering (small-data version)

Prefer *interpretable, leak-free, low-count* features:

- **Learner state:** attempts, correct-in-a-row, time since last seen, elapsed time, hint usage, item difficulty, section (reading/listening/writing/speaking).
- **Text:** length, type-token ratio, CEFR word-list coverage, grammar-error density (LanguageTool), discourse-marker count, embedding vector (cached).
- **Speech:** duration, speech rate (wpm), pause ratio, mean pause length, pitch variation (Parselmouth), ASR confidence, WER against a reference transcript where one exists.
- **Never** include features computed *after* the outcome (e.g., "teacher approved") or aggregates over the full history including the target window.

### Stage 4 — Model selection

Follow the **ladder of escalation** — stop as soon as the metric target is hit:

1. **Rule / heuristic** (you have this: `risk-metrics.js`) → baseline
2. **Off-the-shelf parametric model** (FSRS, BKT, Rasch/1PL IRT) → works with hundreds of rows
3. **LLM with structured output + rubric** (your current state) → works with ~20 labeled examples
4. **Embeddings + linear/logreg** → ~100–300 per class
5. **Embeddings + gradient boosting** → 500–2,000 rows
6. **Fine-tuned open model** → 2,000–10,000 labeled rows **and** proven LLM ceiling
7. **Custom architecture** → you are not here, and probably never need to be

### Stage 5 — Training

- Deterministic: fixed seeds, pinned dependency versions, containerized env.
- Start with **pooled / hierarchical models.** With one teacher's cohort you can borrow strength across students and over time — a hierarchical model treats each student's parameters as drawn from a cohort distribution. This is the single most important statistical trick for your data regime.
- Track every run (params, metrics, data snapshot hash) even if it's just an MLflow local dir committed alongside the code.

### Stage 6 — Evaluation

Offline on the locked gold set → shadow mode (predict, don't act) → canary 10% → A/B with guardrails → ramp. See §6 for metrics.

### Stage 7 — Deployment

See §7. Ship behind a config flag with a one-command rollback to the previous prompt/model version.

### Stage 8 — Monitoring & maintenance (the stage everyone forgets)

- **Model/prompt drift:** LLM providers change model behavior under stable version names. Pin versions, and re-run your regression suite weekly even if you changed nothing.
- **Data drift:** distribution of submission length, audio quality, student mix.
- **Operational:** p50/p95 latency, error rate, cost per evaluation, fallback-provider usage.
- **Outcome:** teacher override rate (if the teacher edits the AI score, that's a live label — capture it). This is your cheapest continuous-labeling flywheel.
- **Scheduled review:** monthly model card review; quarterly gold-set refresh.

---

## 4. Model architectures & frameworks by problem type

### Start-with / graduate-to table

| Problem | Start with | Graduate to (only if needed) | Avoid for now |
|---|---|---|---|
| Rubric scoring of writing | LLM + structured output (JSON schema), few-shot with anchor essays | Embeddings (BGE / `all-MiniLM-L6-v2`) + logistic regression or XGBoost blended with LLM | Training a neural AES from scratch |
| Speaking scoring | Whisper (`faster-whisper`) ASR + LLM rubric scoring of transcript + teacher review | Forced alignment (torchaudio MMS / Montreal Forced Aligner) → prosody features → GMM/XGBoost per rubric dimension | End-to-end speech scoring model |
| Ability estimation | **1PL / Rasch** (PyMC or `GIRTH`); fallback to simple Elo | 2PL IRT with hierarchical priors; CAT item selection | 3PL / deep IRT |
| Mastery over time | **BKT** (standard, 4 params; Bayesian update in SQL or Python) | Hierarchical BKT, or DKT if >100k interactions | Deep knowledge tracing |
| Review scheduling | **FSRS** (open-source, JS implementation exists) | FSRS with per-student parameter optimization | Custom LSTM memory model |
| Error categorization | Embeddings + nearest-centroid / logreg | SetFit / fine-tuned MiniLM | LLM for every item (cost) |
| Next-best exercise | Rules + **Thompson sampling** over exercise types | Contextual bandit (Vowpal Wabbit) | Full RL recommender |
| Churn / readiness | Logistic regression (interpretable) + SHAP | XGBoost/LightGBM with monotonic constraints | Deep tabular nets |
| Content search | pgvector in Supabase + `text-embedding-3-small` / BGE | Hybrid BM25 + vector (pgvector + Postgres FTS) | Custom reranker |
| Forecasting (cohort demand) | `statsforecast` (AutoETS/AutoARIMA) or pooled regression | Prophet / hierarchical forecasting with `sktime` | Deep forecasting (N-BEATS) |

### Stack recommendation (fits what you already run)

- **Language:** Python 3.11+ for modeling; keep inference in TypeScript where the model is trivial (FSRS, BKT, Elo are ~50 lines of JS).
- **Core:** `scikit-learn`, `pandas`, `numpy`, `scipy`
- **Tabular:** `xgboost` (or `lightgbm`), `shap` for explanations
- **Bayesian / psychometrics:** `pymc` (or `cmdstanpy` if you outgrow it), `GIRTH` for classical IRT
- **NLP:** `sentence-transformers`, `spaCy`, `language-tool-python`; LLM calls through the cascade you already have
- **Speech:** `faster-whisper`, `torchaudio`, `praat-parselmouth`, `opensmile`
- **Orchestration/eval:** `promptfo` or `Langfuse` for prompt regression suites; `ragas` if you build RAG
- **Tracking:** `MLflow` (self-hosted or free tier) or Weights & Biases
- **Data quality:** `pandera` (light) or Great Expectations (heavier)
- **Drift:** `evidently`
- **Serving:** existing Express API for light models; a small FastAPI service on Fly.io / Railway / Modal for Python-only models

**Deliberate exclusions:** PyTorch training loops, Kubernetes, Kubeflow, Ray, feature-store platforms, Spark. You have hundreds of rows. Spark would be slower than pandas.

---

## 5. Data requirements & small/imbalanced/unstructured strategies

### Minimum data thresholds (use as gates, not goals)

| Technique | Minimum to attempt | Minimum to trust |
|---|---|---|
| LLM few-shot prompt iteration | 20 labeled | 100 labeled for stable agreement stats |
| Embeddings + linear classifier | 100/class | 300/class |
| Embeddings + gradient boosting | 500 rows | 2,000 rows |
| XGBoost on tabular | 1,000 rows, 100 positives | 5,000 rows, 500 positives |
| 1PL IRT (Rasch) | 150 students × 20 shared items | 400 students × 40 items |
| 2PL IRT | 500 students × 40 items | 2,000 students × 60 items |
| BKT | 50 students × 200 interactions | 200 students × 1,000 interactions |
| FSRS personalization | 0 (sane defaults) | 100–500 reviews/student |
| Fine-tune small transformer | 2,000 labeled | 10,000 labeled (and usually still not worth it) |
| Forecasting per series | 24 weekly points | 52 weekly points |

If you're below the "attempt" threshold, the honest answer is: use a rule, an off-the-shelf parametric model, or an LLM — and spend the time on labeling instead.

### Small data

- **Pool across students with hierarchical/partial-pooling models.** You have many short series, not one long one — that's exactly the regime hierarchical models are built for.
- **Prefer strong priors and simple functional forms.** A 4-parameter BKT will beat a 4-layer net at N=300 every time.
- **Report uncertainty.** Bootstrap CIs or posterior intervals. "QWK 0.68 [0.61–0.74]" is an honest result; "QWK 0.68" is not, at your N.
- **Use pretrained embeddings / foundation models as feature extractors.** You are importing someone else's large dataset. This is the highest-leverage small-data technique available.
- **Do more with labels:** active learning (label the samples the model is least confident about), and capture teacher overrides as free labels.

### Imbalanced data

Your data will be imbalanced: error types are long-tailed (articles/prepositions dominate; rare grammar classes barely appear), drop-off is rare, "excellent" and "failing" essays are rarer than "mid."

- Resist `SMOTE` as a default. Start with **class weights** (`class_weight='balanced'`), and **threshold tuning** on the validation set.
- Use **stratified** splits by class **and** grouped by student.
- Report **macro-F1, per-class recall, balanced accuracy, PR-AUC** — not accuracy, not ROC-AUC.
- For rare classes, prefer a **hierarchical fallback**: predict the parent category, then a specialist model for the child.
- Consider reframing: "is this error type X?" (one-vs-rest with calibrated probabilities) often beats a 30-way classifier with 4 examples per class.

### Unstructured data

- **Text:** cache embeddings in Postgres (`pgvector`) keyed by content hash; never re-embed. Chunk long materials at semantic boundaries with overlap. Strip PII before embedding or sending to a provider.
- **Audio:** store the raw blob, transcribe once, and keep (`transcript`, `word_timings`, `asr_confidence`) as derived artifacts. Re-derive cheaply; re-recording is impossible.
- **Images (speaking picture prompts):** only needed if you go multimodal. Keep the LLM-vision path you already have (`api/generate-image.js` suggests image flows exist); don't train a vision model.
- **Every unstructured artifact needs a retention and deletion policy** tied to the student account (LGPD right to erasure).

---

## 6. Evaluation metrics & validation strategies

### Metrics by task

| Task | Primary metric | Guardrail metrics |
|---|---|---|
| Writing / speaking rubric scoring | **QWK** (quadratic weighted kappa) per rubric dimension | Spearman ρ, MAE, adjacent agreement (±1 band), systematic bias (mean signed error), subgroup QWK |
| Error-type classification | Macro-F1 | Per-class recall on rare classes, confusion matrix, schema-valid rate |
| IRT ability estimation | Person separation reliability, item fit (infit/outfit MNSQ) | Test information curve coverage across ability range, DIF by subgroup |
| Spaced repetition | Recall at scheduled review day (30/60-day retention) | Reviews per item retained, student time-on-task, dropout from review load |
| Recommendation / bandit | Online CTR/completion lift vs. rule baseline | Coverage, diversity (don't serve only easy items), cumulative regret |
| Churn / readiness | PR-AUC + recall@top-20% | Calibration (Brier, reliability diagram), false-alarm rate (teacher time wasted) |
| Forecasting | MAE / RMSE with rolling-origin backtest | MAPE, coverage of prediction intervals |
| Any LLM feature | Task success on the regression suite | p95 latency, cost/eval, schema-valid rate, refusal rate, teacher override rate |

**QWK note:** QWK is the standard in automated essay scoring because it penalizes far-off errors quadratically. Always report it alongside the *human ceiling* measured the same way. Also report **exact agreement** — a QWK of 0.75 with 40% exact agreement may be unacceptable for a high-stakes score.

### Validation strategies (small-data edition)

1. **GroupKFold by `student_id`.** Random k-fold leaks student-specific signal and will inflate every metric. This is the #1 evaluation bug in education ML.
2. **Time-based forward validation** for anything temporal (churn, mastery, forecasting): train on weeks 1–8, validate on 9–10, test on 11–12.
3. **Nested CV** if you tune hyperparameters — otherwise your tuning set is contaminated and your estimate is optimistic.
4. **Locked holdout gold set**, refreshed quarterly, never trained on, never looked at during development more than quarterly.
5. **Bootstrap confidence intervals** on every headline metric. At N=100, differences under ~0.05 QWK are noise.
6. **Subgroup slices** by CEFR band, L1 (Portuguese), submission length quartile, audio quality, and device. A model that works for B2 but fails B1 is a fairness problem, not a footnote.
7. **Human-in-the-loop staging:** shadow → canary 10% → A/B with guardrails → ramp. Never go 0→100% on a scoring change.
8. **Prompt regression suite in CI.** Any change to a prompt, model version, or parsing code runs ≥100 gold cases and fails the build if QWK drops more than a pre-set tolerance.

### Establishing the baseline ladder

Every model must beat, in order:
1. **Trivial baseline** (majority class / mean score)
2. **Your existing heuristic** (`risk-metrics.js`, fixed SR ladder)
3. **LLM zero-shot without rubric conditioning**
4. **LLM + rubric + few-shot** ← likely your champion for a long time
5. Anything more complex

If step 5 doesn't beat step 4 by more than the CI width, ship step 4 and go work on labeling.

---

## 7. Deployment, latency, cost & MLOps

### Recommended topology (minimal change from today)

```
Student/Teacher UI (React + Vite on Vercel)
        │
        ├── Express API (api/*, Vercel serverless)
        │      ├── LLM cascade (existing)  ──► providers
        │      ├── light models in TS: FSRS, BKT, Elo  (no extra infra)
        │      └──► Supabase Postgres: events, labels, predictions, pgvector
        │
        └── Python service (FastAPI on Fly.io / Railway / Modal)  [only when needed]
               ├── IRT fitting (nightly batch)
               ├── embeddings / training
               └── Whisper transcription (GPU-on-demand)
```

**Rule:** keep anything that must respond in <300 ms inside the Express API. Move slow work (training, transcription, batch scoring) to the Python service or a nightly job.

### Latency & execution mode by feature

| Feature | Budget | Mode | Notes |
|---|---|---|---|
| Next-item selection / bandit | < 300 ms | Sync, in API | Precompute candidate scores nightly; serve from Postgres |
| FSRS scheduling | < 100 ms | Sync, pure JS in API | No network needed |
| Error auto-tagging | < 1 s | Sync or async | Batch on submission save |
| Writing evaluation | 5–20 s acceptable | **Async job + stream partial output** | Show streaming feedback; don't block the UI |
| Speaking evaluation | 30–90 s acceptable | Async job with progress states | Queue + webhook/polling via Supabase realtime |
| IRT ability refit | hours | Nightly batch | Write `student_ability` table |
| Embeddings refresh | minutes | Nightly batch | Keyed by content hash |

### Cloud vs on-prem vs edge

- **Cloud (recommended):** You're already on Vercel + Supabase. Stay there. Pin the Supabase project to a Brazilian region (`sa-east-1`) for data residency and latency.
- **On-prem:** Not justified. Only reconsider if a large institutional client (a hospital or university) contractually requires it — and even then, negotiate a cloud region first.
- **Edge:** Only for the trivial schedulers, and they're already in the client/API. Real inference at the edge buys you nothing at your scale and costs you observability.

### Cost reality check

Rough order of magnitude for ~100 active students:

| Item | Monthly estimate |
|---|---|
| LLM inference (writing + speaking evals, ~2k tokens each, ~400 evals/mo) | $15–60 |
| Embeddings (one-time + incremental) | < $5 |
| Whisper self-hosted (GPU on demand) or API | $10–40 |
| Extra infra (Fly.io small instance, pgvector in Supabase) | $20–50 |
| **Total incremental** | **~$50–150/mo** |

**Conclusion: your cost is dominated by LLM API calls, not training.** Fine-tuning cannot pay for itself at this volume. Optimize with caching, prompt compression, and routing simple tasks to cheap models (your Groq/OpenRouter tier) — not with custom weights.

### Right-sized MLOps

Do these (all cheap, all high value):

- **Version everything:** prompts and rubrics in git; data snapshots content-hashed; models in MLflow with the git SHA that produced them.
- **Prompt/model registry in Postgres:** `model_registry(name, version, provider, prompt_sha, config, created_at, status)`. Runtime reads the active version → rollback is a row update.
- **CI eval gate:** prompt changes run the regression suite; a metric regression blocks merge.
- **Prediction logging:** one row per inference (Appendix A). This is your single most valuable ML asset after 6 months.
- **Monitoring:** drift checks (Evidently) weekly, LLM observability (Langfuse or LangSmith) always, alert on p95 latency / cost spike / override-rate spike.
- **Model cards:** one page per model — purpose, data, metrics with CIs, subgroup results, known failure modes, owner, rollback.

Skip these: Kubeflow, Airflow (use cron + Supabase scheduled functions), feature stores, model servers, A/B platforms (a config flag is enough), Spark.

---

## 8. Team enablement

### Roles you need (and in what order)

| # | Role | FTE | When | Notes |
|---|---|---|---|---|
| 1 | **Domain labeler / rubric owner** (the teacher) | 0.2 | Phase 0 | Non-negotiable. Without consistent labels nothing else works. |
| 2 | **ML Engineer (senior)** | 0.5 contract → 1.0 | Phase 1 | Hire contract-first. Needs: applied stats, eval discipline, willingness to say "a rule is enough." |
| 3 | **Analytics / Data Engineer** | 0.3 (upskill an existing dev) | Phase 1 | SQL/dbt, event schema design, dashboards. |
| 4 | **MLOps owner** | 0.2 (existing DevOps) | Phase 2 | Monitoring, CI, deployment. Not a separate hire. |
| 5 | **Applied/LLM eval specialist** | — | Phase 2 | Often the same person as #2 at your stage. |

**Do not hire a research scientist or a PhD.** You need an engineer who ships evaluated systems, not someone who reads papers.

### Interview bar for the ML engineer

Practical screen, not theory: give them 200 labeled rows and a messy prompt, ask them to (a) define the metric, (b) build a baseline, (c) say when they'd stop. Red flags: reaches for a neural net first; can't explain grouped CV; treats accuracy as the metric; no interest in the human-in-the-loop design.

### Upskilling plan for the existing team (6 weeks, ~4 h/week)

| Week | Topic | Outcome |
|---|---|---|
| 1 | Evaluation & metrics discipline | Team can choose a metric and a validation split correctly |
| 2 | Baselines + feature engineering for tabular | Team ships a logreg baseline beating the heuristic, or proves the heuristic wins |
| 3 | Embeddings & semantic search | pgvector search over the content bank, shipped |
| 4 | LLM-as-a-system: structured outputs, eval suites, prompt versioning | Regression suite in CI for `evaluate-speaking.js` |
| 5 | Uncertainty, calibration, and reading a result honestly | Team reports CIs and stops over-claiming |
| 6 | Psychometrics crash course: IRT + BKT + FSRS | Team can implement 1PL and FSRS |

Assign one "ML champion" per feature area; rotate the on-call for model issues into the normal rotation so it isn't magic.

### Managing AI projects without prior experience

- **Two-week cycles** with a demoable increment and a metric readout. No 3-month model projects.
- **Decision log** (`docs/AI-DECISIONS.md`): every modeling choice with the alternative considered and the reason. Prevents re-litigating and preserves context when people rotate.
- **Definition of Done for any model/feature:** (1) beats the baseline ladder, (2) eval report with CIs and subgroup slices, (3) model card, (4) monitoring + alert configured, (5) rollback tested, (6) teacher has used it on ≥10 real submissions.
- **Pre-registered kill criteria.** Write down before you start when you'll abandon the approach. This is the single best defense against sunk-cost AI projects.
- **Never promise a date for a model's accuracy.** Promise a date for an *evaluation result* instead.

---

## 9. Phased roadmap

Effort in **person-weeks (pw)** assuming 1–2 engineers, partially loaded.

### Phase 0 — Foundation & measurement (Weeks 1–2) · 2–3 pw

| Deliverable | Detail |
|---|---|
| Event & prediction schema in Supabase | `learning_events`, `ai_predictions`, `gold_labels`; migration replaces localStorage state |
| `model_registry` table + runtime lookup | Versioned prompts/models, instant rollback |
| Prediction logging live | Every AI call logged with prompt version, model, output, latency, cost |
| Gold set v1 | 100 writing + 50 speaking samples, double-labeled, adjudicated |
| Label book | Anchor examples per rubric band |
| Human-ceiling measurement | Teacher-vs-teacher QWK; sets the target for all future work |
| Cost & latency dashboard | Per-feature, per-model |

**Exit criteria:** you can answer "what did the AI score, why, how long did it take, how much did it cost, and did the teacher agree?" for any submission in the last 30 days.

### Phase 1 — Eval quality & guardrails (Weeks 3–8) · 5–6 pw

| Deliverable | Detail |
|---|---|
| Rubric-conditioned structured outputs | Strict JSON schema, per-dimension scores + evidence spans + confidence |
| Agreement study | QWK/Spearman vs gold set, with CIs and subgroup slices |
| Prompt regression suite in CI | ≥100 cases; blocks merge on regression |
| Teacher override capture | Every edit becomes a labeled example |
| FSRS replaces fixed SR ladder | Behind a flag; A/B vs `[1,3,7,14,30]` |
| Error-bank auto-tagging | Embeddings + classifier, teacher confirms |
| pgvector semantic search | Teacher search across content bank |

**Exit criteria:** writing eval QWK ≥ 0.90 × human ceiling; FSRS A/B shows non-inferior retention with ≤ current review load; every AI feature has a rollback.

### Phase 2 — Learner models (Weeks 9–16, overlaps Phase 1 tail) · 5–6 pw

| Deliverable | Detail |
|---|---|
| 1PL/Rasch ability estimation | Per section, from diagnostics; nightly refit |
| BKT mastery state | Per competency (grammar points, functions), drives homework targeting |
| Item difficulty calibration | Every item gets a difficulty parameter; feeds selection and reporting |
| Student ability & mastery in the UI | Teacher-facing, with uncertainty ranges |

**Exit criteria:** ability estimates correlate with mock-test scores (Spearman ≥ 0.6) and are stable week-over-week; teacher reports the "Today" view surfacing better homework.

### Phase 3 — Adaptation & generation (Months 5–7) · 6–8 pw

| Deliverable | Detail |
|---|---|
| CAT-lite adaptive diagnostics | Next item chosen by information gain at current ability estimate |
| Next-best-exercise bandit | Thompson sampling over exercise types; online lift measured |
| LLM item authoring + QC pipeline | Generated items auto-screened (answerability, difficulty, duplication) before teacher review |
| Automated content-gap analysis | Bank coverage vs MET blueprint |

**Exit criteria:** adaptive diagnostic reaches a comparable ability estimate with ≥25% fewer items; bandit beats the rule baseline on completion + accuracy gain.

### Phase 4 — Speech & prediction (Months 8–12) · 8–10 pw · **gated**

| Deliverable | Gate to start |
|---|---|
| Whisper ASR + alignment pipeline | ≥200 labeled speaking samples and a stable transcript quality measure |
| Assistive speaking scoring | Transcript + teacher-facing draft scores; agreement study before student-facing |
| Prosody features → fluency/rhythm subscores | Only if the dimension-level agreement study justifies it |
| Churn / exam-readiness model | ≥1,000 student-weeks of history and ≥100 outcome events |

**Exit criteria:** speaking subscores reach the same agreement bar as writing, or the feature stays permanently assistive.

### Conditional — fine-tuning (only if all hold)

≥2,000 double-labeled samples **and** a documented LLM ceiling that blocks a business goal **and** cost per eval high enough that a small model pays back within 6 months. Re-evaluate quarterly; do not schedule it.

**Total through Phase 3: ~18–23 person-weeks** over roughly 7 months at half-time ML staffing.

---

## 10. Pitfalls, risks & ethics

### Pitfalls (ordered by how often they actually kill projects)

1. **Building a model when a rule or a prompt suffices.** Mitigation: the baseline ladder (§6).
2. **No baseline, so no way to know you improved.** Mitigation: baselines before models, always.
3. **Data leakage via random splits.** Mitigation: GroupKFold by student; time splits for temporal data.
4. **Neglecting the label quality problem.** Mitigation: double labeling, label book, human-ceiling target.
5. **LLM provider silently changing behavior.** Mitigation: pin versions, weekly regression suite runs, alert on metric drift.
6. **No rollback.** Mitigation: registry + config flag; test the rollback, don't assume it.
7. **Optimizing the metric instead of the outcome.** A model that maximizes predicted score doesn't maximize real MET improvement. Mitigation: at least one real-outcome metric (mock-test improvement) in the loop.
8. **Cost surprises** from un-cached, un-batched LLM calls. Mitigation: cache by content hash; batch; route to cheap models.
9. **Local-only data** (your `localStorage` SR state) silently capping your dataset. Mitigation: Phase 0 migration.
10. **Students gaming the AI** (writing for the grader, not for the skill). Mitigation: monitor length/lexical drift; randomize prompts; keep teacher review in the loop.

### Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI score is wrong and damages a student's plan | Medium | High | Human-in-the-loop on all student-visible scores; confidence gating; appeals path |
| Accent/ASR bias penalizes Brazilian Portuguese speakers | High | High | Never auto-publish speaking scores without agreement study; report subgroup WER |
| Teacher loses trust after one bad output | Medium | High | Conservative defaults, show evidence spans, easy override, no overclaiming in UI copy |
| LGPD / GDPR non-compliance | Medium | High | See below |
| Provider outage | Medium | Medium | Your cascade already helps; add a cached/degraded mode |
| Labeling burden stalls the project | High | Medium | 0.2 FTE teacher time protected; active learning; capture overrides |
| MET trademark / score-claim issues | Low | High | Never claim official MET score prediction; state "estimated readiness" |

### Ethics, fairness, privacy, explainability

- **Fairness.** Slice every metric by CEFR band, submission length, audio quality/device, and (if you collect it) first language. Set a **maximum subgroup performance gap** as a release gate (e.g., QWK gap ≤ 0.10 between B1 and B2 slices).
- **Bias sources specific to you:** Whisper and most ASR are trained on native-dominant English — Brazilian-accented speech will have higher WER, which will depress speaking scores for exactly the students you serve. Essay scorers reward length and rare vocabulary, which correlates with prior education, not communicative ability. Both must be measured, not assumed away.
- **Explainability.** For every score, ship (a) the rubric dimension breakdown, (b) evidence spans quoted from the submission, (c) a confidence indicator, (d) "what would improve this." This is a WCAG/UX requirement too, and it is your best defense against blind trust.
- **Human in the loop.** Define three tiers: **assistive** (teacher-only), **advisory** (student sees it, labeled as AI), **automated** (acts without a human). Put nothing in tier 3 that materially affects a student's study plan or record until Phase 4 evidence supports it.
- **Privacy (LGPD — Brazil; GDPR if you serve EU students):**
  - Legal basis and explicit consent for processing student writing, voice, and performance data. Voice is biometric-adjacent — treat it as sensitive.
  - Data minimization: don't send full student profiles to LLM providers; send only what the task needs.
  - Provider due diligence: contractual no-training clauses, data residency, subprocessor list.
  - Retention & deletion: per-artifact TTL; honor erasure requests across Postgres, Storage, logs, **and provider-side caches**.
  - Cross-border transfer controls if using US-based providers.
  - Record of processing activities (ROPA) and, if you scale, a DPO/encarregado.
- **Automated decision-making.** Under GDPR Art. 22 (and in spirit under LGPD), decisions with significant effects require human review — design for it from day one, and make the appeals path visible in the UI.
- **Transparency.** Label AI-generated feedback as AI-generated to students. Don't let the product imply a teacher personally wrote every comment.
- **Accessibility.** Voice-based practice excludes some users; keep a text alternative for every speaking task (also helps ASR-failure cases).
- **Regulatory watch:** EU AI Act transparency obligations for AI in education, and emerging Brazilian AI regulation (PL 2338). Keep a one-page compliance note in the repo and review it quarterly.

---

## Appendix A — Schemas & snippets

### Prediction log (the highest-value table you will build)

```sql
create table ai_predictions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  feature       text not null,            -- 'writing_eval', 'speaking_eval', 'error_tag'
  student_id    uuid references students(id),
  submission_id uuid,
  model_name    text not null,            -- 'gemini-2.5-pro'
  model_version text not null,            -- provider version string, pinned
  prompt_name   text not null,
  prompt_sha    text not null,            -- git/registry hash
  input_hash    text not null,            -- dedupe + cache key
  raw_output    jsonb,
  parsed_output jsonb,
  confidence    real,
  latency_ms    int,
  cost_usd      numeric(10,6),
  status        text,                     -- ok | parse_error | provider_error | fallback
  error         text
);
create index on ai_predictions (feature, created_at desc);
create index on ai_predictions (prompt_sha);
```

### Gold-set label record

```json
{
  "sample_id": "w_0001",
  "modality": "writing",
  "task_type": "B2_email_formal",
  "prompt": "...",
  "response": "...",
  "labels": [
    { "rater": "teacher", "pass": 1, "rubric": { "task": 4, "org": 3, "lang": 3 }, "at": "2026-09-10" },
    { "rater": "teacher", "pass": 2, "rubric": { "task": 4, "org": 4, "lang": 3 }, "at": "2026-10-01" }
  ],
  "gold": { "rubric": { "task": 4, "org": 4, "lang": 3 }, "adjudicated_by": "teacher", "rationale": "..." },
  "splits": { "group": "student_07", "set": "holdout" }
}
```

### Grouped cross-validation (never random-split students)

```python
from sklearn.model_selection import GroupKFold
from sklearn.metrics import cohen_kappa_score

gkf = GroupKFold(n_splits=5)
groups = df["student_id"]          # same student never in train and test
for tr, te in gkf.split(df, y, groups=groups):
    m.fit(df.iloc[tr], y.iloc[tr])
    pred = m.predict(df.iloc[te])
    print(cohen_kappa_score(y.iloc[te], pred, weights="quadratic"))
```

### QWK + bootstrap CI

```python
import numpy as np
from sklearn.metrics import cohen_kappa_score

def qwk(y_true, y_pred):
    return cohen_kappa_score(y_true, y_pred, weights="quadratic")

def qwk_ci(y_true, y_pred, n_boot=1000, seed=0):
    rng = np.random.default_rng(seed)
    scores = []
    for _ in range(n_boot):
        idx = rng.integers(0, len(y_true), len(y_true))
        if len(np.unique(y_true[idx])) < 2:
            continue
        scores.append(qwk(np.asarray(y_true)[idx], np.asarray(y_pred)[idx]))
    return qwk(y_true, y_pred), np.percentile(scores, [2.5, 97.5])
```

### Release checklist (copy into your PR template)

- [ ] Beats every rung of the baseline ladder
- [ ] Grouped (student) and/or time-based validation used
- [ ] Metrics reported with CIs and subgroup slices
- [ ] Subgroup gap within the agreed threshold
- [ ] Gold set untouched during development
- [ ] Prompt/model version pinned in registry; rollback tested
- [ ] Prediction logging enabled
- [ ] Cost and p95 latency within budget
- [ ] Model card written; owner assigned
- [ ] Teacher has used it on ≥10 real submissions
- [ ] Kill criteria re-evaluated

---

## Appendix B — Open questions for you

Answering these changes the plan materially:

1. How many active students today, and expected in 12 months? (Drives whether hierarchical models are enough or you need per-cohort models.)
2. Do you plan to onboard **additional teachers**? Multi-tenancy changes the data story completely — you'd pool across teachers and start personalizing per teacher.
3. Do you have, or can you get, **real MET outcomes** for past students? That single dataset unlocks U11 and makes every other model more useful.
4. What is the teacher's current time per writing/reading submission, and where does it hurt most? (Sets the actual success threshold.)
5. Any institutional customers (hospitals, universities) with data-residency or procurement constraints?
6. Is student voice/video data currently covered by consent language that permits automated processing?

---

*Review cadence: revisit phases 2–4 gates monthly; re-run the §2 capability matrix quarterly as data accrues.*
