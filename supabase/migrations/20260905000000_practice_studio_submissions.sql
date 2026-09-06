-- Practice Studio final submissions
--
-- Apply this migration in the linked Supabase project before enabling the
-- one-submission learner flow in production. The client stores the full
-- response in content JSONB, while the relational columns are used for RLS,
-- teacher/student queries, and the database-level one-submit guarantee.

create extension if not exists pgcrypto;

create table if not exists public.practice_submissions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- The existing application data adapter uses these columns. Add them only
-- when this is an older project where the table was created manually.
alter table public.practice_submissions
  add column if not exists teacher_id uuid references public.profiles(id) on delete cascade,
  add column if not exists student_id uuid references public.students(id) on delete cascade,
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

-- A final attempt is keyed by the authenticated student and the stable topic
-- selection (mode/part/question/topic), never by a browser-generated ID.
create unique index if not exists practice_submissions_student_session_key_unique
  on public.practice_submissions (student_id, (content ->> 'sessionKey'))
  where content ? 'sessionKey';

create index if not exists practice_submissions_teacher_created_at_idx
  on public.practice_submissions (teacher_id, created_at desc);

create index if not exists practice_submissions_student_created_at_idx
  on public.practice_submissions (student_id, created_at desc);

alter table public.practice_submissions enable row level security;

-- A learner may see and create only their own final submission. They receive
-- no UPDATE policy, so an attempt cannot be changed after it is submitted.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_submissions'
      and policyname = 'practice_submissions_student_read_own'
  ) then
    create policy practice_submissions_student_read_own
      on public.practice_submissions
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.students student
          where student.id = practice_submissions.student_id
            and student.auth_user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_submissions'
      and policyname = 'practice_submissions_student_insert_own'
  ) then
    create policy practice_submissions_student_insert_own
      on public.practice_submissions
      for insert
      to authenticated
      with check (
        exists (
          select 1
          from public.students student
          where student.id = practice_submissions.student_id
            and student.auth_user_id = auth.uid()
            and student.teacher_id = practice_submissions.teacher_id
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'practice_submissions'
      and policyname = 'practice_submissions_teacher_manage_roster'
  ) then
    create policy practice_submissions_teacher_manage_roster
      on public.practice_submissions
      for all
      to authenticated
      using (teacher_id = auth.uid())
      with check (teacher_id = auth.uid());
  end if;
end $$;
