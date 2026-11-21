-- Stage 3: submissions, exam_attempts, recommendations already partially in 001b

do $$ begin
  create type public.submission_status as enum ('draft', 'submitted', 'returned', 'graded');
exception when duplicate_object then null;
end $$;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  status public.submission_status not null default 'draft',
  body_md text not null default '',
  submitted_at timestamptz null,
  grade_score numeric(5,2) null,
  grade_feedback_md text null,
  graded_by uuid null references public.profiles (id),
  graded_at timestamptz null,
  version int not null default 1,
  unique (assignment_id, author_id, version)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  status public.submission_status not null default 'draft',
  score numeric(5,2) null,
  feedback_md text null,
  submitted_at timestamptz null,
  unique (exam_id, author_id)
);

alter table public.submissions enable row level security;
alter table public.exam_attempts enable row level security;

drop policy if exists submissions_select on public.submissions;
create policy submissions_select on public.submissions
for select to authenticated
using (author_id = auth.uid() or public.is_admin());

drop policy if exists submissions_write on public.submissions;
create policy submissions_write on public.submissions
for all to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists exam_attempts_select on public.exam_attempts;
create policy exam_attempts_select on public.exam_attempts
for select to authenticated
using (author_id = auth.uid() or public.is_admin());

drop policy if exists exam_attempts_write on public.exam_attempts;
create policy exam_attempts_write on public.exam_attempts
for all to authenticated
using (author_id = auth.uid() or public.is_admin())
with check (author_id = auth.uid() or public.is_admin());

-- Progress is derived from submissions.status in (submitted, graded), never from page views.
