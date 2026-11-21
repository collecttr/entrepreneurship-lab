-- Stage 3: curriculum core — modules/weeks already stubbed in 001b; extend + sources/assignments/rubrics/exams

do $$ begin
  create type public.participant_slot_assignment as enum ('A', 'B', 'both');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deliverable_type as enum ('text', 'doc', 'slides', 'audio_note', 'defense');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.exam_kind as enum ('midterm', 'final');
exception when duplicate_object then null;
end $$;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ru text not null,
  title_original text not null default '',
  provider text not null,
  url text not null,
  license_note text not null default '',
  is_free boolean not null default true,
  is_optional_paid boolean not null default false,
  estimated_study_minutes int not null default 0,
  language text not null default 'en',
  verified_at date null,
  why_ru text not null default '',
  parts_ru text not null default '',
  understand_ru text not null default '',
  questions_ru jsonb not null default '[]'::jsonb
);

create table if not exists public.week_sources (
  week_id uuid not null references public.weeks (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  is_mandatory boolean not null default true,
  study_minutes_planned int not null default 0,
  order_index int not null default 1,
  primary key (week_id, source_id)
);

create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ru text not null,
  criteria jsonb not null default '[]'::jsonb
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  code text not null unique,
  participant_slot public.participant_slot_assignment not null,
  title_ru text not null,
  brief_md text not null,
  deliverable_type public.deliverable_type not null default 'text',
  max_minutes int not null default 60,
  rubric_id uuid null references public.rubrics (id),
  due_offset_days int not null default 7
);

create table if not exists public.week_skills (
  week_id uuid not null references public.weeks (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  weight numeric(3,2) not null default 1 check (weight >= 0 and weight <= 1),
  primary key (week_id, skill_id)
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  week_number int not null check (week_number between 1 and 26),
  kind public.exam_kind not null,
  title_ru text not null,
  brief_md text not null,
  rubric_id uuid null references public.rubrics (id),
  unique (week_number, kind)
);

-- Week content sections (Stage 3 detail)
alter table public.weeks
  add column if not exists problem_ru text not null default '',
  add column if not exists outcomes jsonb not null default '[]'::jsonb,
  add column if not exists concepts jsonb not null default '[]'::jsonb,
  add column if not exists debate_ru text not null default '',
  add column if not exists case_ru text not null default '',
  add column if not exists simulation_ru text not null default '',
  add column if not exists reflection jsonb not null default '[]'::jsonb,
  add column if not exists error_watchlist jsonb not null default '[]'::jsonb,
  add column if not exists sales_drill_ru text not null default '';

alter table public.sources enable row level security;
alter table public.week_sources enable row level security;
alter table public.rubrics enable row level security;
alter table public.assignments enable row level security;
alter table public.week_skills enable row level security;
alter table public.exams enable row level security;

drop policy if exists sources_select on public.sources;
create policy sources_select on public.sources for select to authenticated using (public.is_allowlisted());
drop policy if exists sources_admin on public.sources;
create policy sources_admin on public.sources for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists week_sources_select on public.week_sources;
create policy week_sources_select on public.week_sources for select to authenticated using (public.is_allowlisted());
drop policy if exists week_sources_admin on public.week_sources;
create policy week_sources_admin on public.week_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists rubrics_select on public.rubrics;
create policy rubrics_select on public.rubrics for select to authenticated using (public.is_allowlisted());
drop policy if exists rubrics_admin on public.rubrics;
create policy rubrics_admin on public.rubrics for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists assignments_select on public.assignments;
create policy assignments_select on public.assignments for select to authenticated using (public.is_allowlisted());
drop policy if exists assignments_admin on public.assignments;
create policy assignments_admin on public.assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists week_skills_select on public.week_skills;
create policy week_skills_select on public.week_skills for select to authenticated using (public.is_allowlisted());
drop policy if exists week_skills_admin on public.week_skills;
create policy week_skills_admin on public.week_skills for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists exams_select on public.exams;
create policy exams_select on public.exams for select to authenticated using (public.is_allowlisted());
drop policy if exists exams_admin on public.exams;
create policy exams_admin on public.exams for all to authenticated using (public.is_admin()) with check (public.is_admin());
