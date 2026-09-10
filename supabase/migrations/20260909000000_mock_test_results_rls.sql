-- 20260909000000_mock_test_results_rls.sql
-- Audit remediation (SEC-DATA-1): the teacher dashboard previously read this
-- table directly from the browser with the ANON key. That path is now routed
-- through the authenticated, teacher-scoped /api/get-submissions handler, but
-- we still enable RLS here as defense-in-depth so the table can never be read
-- unauthenticated even if a client regresses.
--
-- REVIEW BEFORE APPLYING: confirm the actual column set matches. The app
-- filters by `teacher_id = <teacher email>` (see api/_routes/get-submissions.js),
-- so the policy keys on the caller's Supabase auth email. If your deployment
-- stores teacher_id as a UUID instead, change the USING clause to compare
-- against auth.uid().

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'mock_test_results'
  ) then
    -- Fail closed: no anon access, ever.
    alter table public.mock_test_results enable row level security;

    drop policy if exists mock_test_results_teacher_select on public.mock_test_results;
    create policy mock_test_results_teacher_select
      on public.mock_test_results for select
      to authenticated
      using ( teacher_id = (select email from auth.users where id = auth.uid()) );

    drop policy if exists mock_test_results_teacher_write on public.mock_test_results;
    create policy mock_test_results_teacher_write
      on public.mock_test_results for all
      to authenticated
      using ( teacher_id = (select email from auth.users where id = auth.uid()) )
      with check ( teacher_id = (select email from auth.users where id = auth.uid()) );

    drop policy if exists mock_test_results_student_own on public.mock_test_results;
    create policy mock_test_results_student_own
      on public.mock_test_results for select
      to authenticated
      using ( student_id = auth.uid() );
  end if;
end $$;
