-- Enforce one homework submission per student (exercise once only)
-- Mirrors the Practice Studio unique-session guarantee for homework assignments.

-- Submissions table stores one row per (homework, student) attempt.
-- A second INSERT with the same homework_id + student_id must fail so the
-- app's once-only check has a database-level backstop (handles cross-device races).

create unique index if not exists submissions_homework_student_unique
  on public.submissions (homework_id, student_id);

-- Optional: backfill guard - remove duplicate older rows, keep newest
-- (no-op if no duplicates). Uncomment to clean existing data before enforcing.
-- delete from public.submissions a using public.submissions b
-- where a.homework_id = b.homework_id
--   and a.student_id = b.student_id
--   and a.submitted_at < b.submitted_at
--   and a.id <> b.id;
