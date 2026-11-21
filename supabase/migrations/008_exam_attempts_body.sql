-- Exam attempt body + updated_at for live slug↔UUID sync from the SPA.
-- Safe to re-run. Client keeps slug ids in localStorage and maps via exams(week_number, kind).

alter table public.exam_attempts
  add column if not exists body_md text not null default '',
  add column if not exists updated_at timestamptz not null default now();
