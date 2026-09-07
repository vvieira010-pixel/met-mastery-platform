-- 20260907000000_ai_measurement_foundation.sql
--
-- Phase 0 of docs/AI-ML-PLAYBOOK-2026-09-07.md — foundation and measurement.
--
-- Everything here exists to make AI behaviour measurable BEFORE anyone changes a
-- model. Four things:
--   1. ml_model_registry  — versioned prompts/models, one active version, instant rollback.
--   2. ai_predictions     — one row per inference: what was asked, what came back,
--                           how long it took, what it cost, how it was parsed.
--   3. learning_events    — the raw longitudinal log. Replaces the localStorage-only
--                           spaced-repetition state that ML currently cannot see.
--   4. gold_samples/labels/adjudicated — the double-labeled gold set and the
--                           human-ceiling agreement data.
--
-- PRIVACY (LGPD/GDPR): ai_predictions stores a pseudonymous subject_ref (a
-- server-side hash), never a student name or email. parsed_output is retained
-- because it is required to compute agreement, but it may quote student text —
-- apply the retention job below and honour erasure requests across this table too.
--
-- No foreign keys to students/submissions: those table shapes are not guaranteed
-- across environments and a failed FK would break telemetry on insert.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Model / prompt registry
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ml_model_registry (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('model', 'prompt')),
  name        text not null,
  version     text not null,
  provider    text,
  model_id    text,
  prompt      text,
  prompt_sha  text not null default 'unversioned',
  config      jsonb not null default '{}'::jsonb,
  status      text not null default 'active' check (status in ('active', 'shadow', 'disabled')),
  notes       text,
  created_by  text,
  created_at  timestamptz not null default now(),
  unique (kind, name, version)
);

-- At most one active version per (kind, name). Rollback = flip which row is active.
create unique index if not exists ml_model_registry_one_active
  on public.ml_model_registry (kind, name) where status = 'active';

create index if not exists ml_model_registry_lookup
  on public.ml_model_registry (kind, name, status);

-- Atomic activation. Keeps the "exactly one active" invariant under concurrency
-- and refuses to activate a version that does not exist.
create or replace function public.ml_activate(p_kind text, p_name text, p_version text)
returns void
language plpgsql
as $$
begin
  update public.ml_model_registry
     set status = 'disabled'
   where kind = p_kind and name = p_name and status = 'active' and version <> p_version;

  update public.ml_model_registry
     set status = 'active'
   where kind = p_kind and name = p_name and version = p_version;

  if not found then
    raise exception 'ml_activate: version % not found for %/%', p_version, p_kind, p_name;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Prediction log — one row per inference
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_predictions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  feature          text not null,
  subject_ref      text,
  submission_id    uuid,
  -- Registry provenance. prompt_sha is what lets you attribute a metric change
  -- to a prompt edit rather than to a provider silently changing behaviour.
  model_name       text,
  model_version    text,
  provider         text,
  model_id         text,
  prompt_sha       text,
  input_hash       text,
  input_chars      int,
  output_chars     int,
  prompt_tokens    int,
  completion_tokens int,
  tokens_estimated boolean not null default true,
  cost_usd         numeric(12, 8),
  latency_ms       int,
  status           text not null default 'ok'
                     check (status in ('ok', 'parse_error', 'provider_error', 'timeout', 'empty', 'non_json')),
  confidence       real,
  parsed_output    jsonb,
  error            text,
  app_env          text
);

create index if not exists ai_predictions_feature_time
  on public.ai_predictions (feature, created_at desc);
create index if not exists ai_predictions_model_time
  on public.ai_predictions (model_name, model_version, created_at desc);
create index if not exists ai_predictions_failures
  on public.ai_predictions (created_at desc) where status <> 'ok';
create index if not exists ai_predictions_input
  on public.ai_predictions (feature, input_hash);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Learning events — the raw longitudinal log
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.learning_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  subject_ref text not null,
  event_type  text not null,
  item_id     text,
  item_type   text,
  skill       text,
  correct     boolean,
  score       numeric,
  duration_ms int,
  source      text not null default 'web',
  meta        jsonb not null default '{}'::jsonb
);

create index if not exists learning_events_subject_time
  on public.learning_events (subject_ref, created_at);
create index if not exists learning_events_type_time
  on public.learning_events (event_type, created_at);
create index if not exists learning_events_item
  on public.learning_events (item_id) where item_id is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Gold set
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.gold_samples (
  id           text primary key,
  modality     text not null check (modality in ('writing', 'speaking')),
  task_type    text,
  cefr_band    text,
  prompt_ref   text,
  subject_ref  text,
  response     text,
  transcript   text,
  audio_uri    text,
  split        text not null default 'holdout' check (split in ('dev', 'holdout')),
  source_table text,
  source_id    text,
  created_at   timestamptz not null default now()
);

create table if not exists public.gold_labels (
  id          uuid primary key default gen_random_uuid(),
  sample_id   text not null references public.gold_samples (id) on delete cascade,
  rater       text not null,
  rater_pass  int not null default 1,
  rubric      jsonb not null,
  overall     numeric,
  comments    text,
  labeled_at  timestamptz not null default now(),
  unique (sample_id, rater, rater_pass)
);

-- The reconciled label. This is what models are scored against; the two passes
-- above exist to measure how much of the disagreement is human, not model, error.
create table if not exists public.gold_adjudicated (
  sample_id       text primary key references public.gold_samples (id) on delete cascade,
  rubric          jsonb not null,
  overall         numeric,
  rationale       text,
  adjudicated_by  text,
  adjudicated_at  timestamptz not null default now()
);

create index if not exists gold_labels_sample on public.gold_labels (sample_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Dashboard views
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view public.v_ai_feature_daily as
select
  feature,
  (created_at at time zone 'utc')::date                                  as day,
  count(*)                                                               as n,
  count(*) filter (where status = 'ok')                                  as n_ok,
  round(100.0 * count(*) filter (where status = 'ok') / nullif(count(*), 0), 1) as ok_pct,
  percentile_cont(0.50) within group (order by latency_ms)               as p50_ms,
  percentile_cont(0.95) within group (order by latency_ms)               as p95_ms,
  sum(coalesce(cost_usd, 0))                                             as cost_usd
from public.ai_predictions
group by feature, (created_at at time zone 'utc')::date;

create or replace view public.v_ai_model_daily as
select
  coalesce(provider, 'unknown') as provider,
  coalesce(model_id, 'unknown') as model_id,
  (created_at at time zone 'utc')::date                                   as day,
  count(*)                                                                as n,
  count(*) filter (where status = 'ok')                                   as n_ok,
  percentile_cont(0.95) within group (order by latency_ms)                as p95_ms,
  sum(coalesce(cost_usd, 0))                                              as cost_usd
from public.ai_predictions
group by coalesce(provider, 'unknown'), coalesce(model_id, 'unknown'), (created_at at time zone 'utc')::date;

create or replace view public.v_gold_set_progress as
select
  s.modality,
  count(*)                                                              as samples,
  count(distinct l.sample_id) filter (where l.rater_pass = 1)           as labeled_pass1,
  count(distinct l.sample_id) filter (where l.rater_pass = 2)           as labeled_pass2,
  count(distinct a.sample_id)                                           as adjudicated
from public.gold_samples s
left join public.gold_labels l on l.sample_id = s.id
left join public.gold_adjudicated a on a.sample_id = s.id
group by s.modality;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Seed the registry with the pre-Phase-0 baseline
--
-- prompt_sha 'unversioned' means "whatever the code does today". Prompts become
-- real versioned artifacts in Phase 1; until then the registry still gives you a
-- stable model_version to group telemetry by, and a rollback target.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.ml_model_registry (kind, name, version, provider, model_id, prompt_sha, notes, created_by)
values
  ('model', 'ai_proxy',   '2026-09-07.1', null, null, 'unversioned', 'Baseline: api/ai.js multi-provider cascade, order unchanged.', 'phase0'),
  ('model', 'speaking_eval', '2026-09-07.1', null, null, 'unversioned', 'Baseline: api/evaluate-speaking.js provider order.', 'phase0'),
  ('prompt', 'writing_eval', '2026-09-07.1', null, null, 'unversioned', 'Baseline: prompts currently built in src/lib/prompts.js.', 'phase0')
on conflict (kind, name, version) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Row level security — fail closed
--
-- These tables are written by server-side code with the service-role key, which
-- bypasses RLS. Enabling RLS with no policies means anon/authenticated keys get
-- nothing by default. Add explicit policies when (and if) a dashboard needs to
-- read them from the browser.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.ml_model_registry enable row level security;
alter table public.ai_predictions    enable row level security;
alter table public.learning_events   enable row level security;
alter table public.gold_samples      enable row level security;
alter table public.gold_labels       enable row level security;
alter table public.gold_adjudicated  enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Retention (LGPD data minimisation)
--
-- Not scheduled here on purpose — wire it to your own scheduler once you have
-- agreed the retention window. Suggested starting point:
--   delete from public.ai_predictions  where created_at < now() - interval '180 days';
--   delete from public.learning_events where created_at < now() - interval '730 days';
-- Gold set is retained deliberately: it is the evaluation asset, not telemetry.
-- ─────────────────────────────────────────────────────────────────────────────
