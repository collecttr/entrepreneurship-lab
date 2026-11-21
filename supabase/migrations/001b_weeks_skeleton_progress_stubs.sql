-- Stage 2 stubs: minimal modules/weeks + skill_progress skeleton for dashboard wiring.
-- Full curriculum content arrives in Stage 3 (002/003). These tables exist so Stage 2
-- can query structure safely; seed fills week 1 unlocked.

do $$ begin
  create type public.skill_category as enum (
    'sales',
    'negotiation',
    'presentation',
    'psychology',
    'entrepreneurial',
    'marketing',
    'ops',
    'speaking'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ru text not null,
  order_index int not null unique check (order_index between 1 and 7),
  description_ru text not null default '',
  estimated_hours numeric(6,1) not null default 0
);

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  week_number int not null unique check (week_number between 1 and 26),
  title_ru text not null,
  unlock_at timestamptz null,
  is_unlocked boolean not null default false,
  summary_ru text not null default '',
  learning_goals jsonb not null default '[]'::jsonb
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ru text not null,
  category public.skill_category not null
);

create table if not exists public.skill_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  score_ema numeric(5,2) not null default 0 check (score_ema between 0 and 100),
  evidence_count int not null default 0,
  last_updated date not null default current_date,
  primary key (user_id, skill_id)
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  for_date date not null,
  items jsonb not null default '[]'::jsonb,
  unique (user_id, for_date)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  entity_type text not null,
  entity_id text null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.modules enable row level security;
alter table public.weeks enable row level security;
alter table public.skills enable row level security;
alter table public.skill_progress enable row level security;
alter table public.recommendations enable row level security;
alter table public.activity_events enable row level security;

-- Curriculum stubs: read for allowlisted; write admin
drop policy if exists modules_select on public.modules;
create policy modules_select on public.modules
for select to authenticated using (public.is_allowlisted());

drop policy if exists modules_admin on public.modules;
create policy modules_admin on public.modules
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists weeks_select on public.weeks;
create policy weeks_select on public.weeks
for select to authenticated using (public.is_allowlisted());

drop policy if exists weeks_admin on public.weeks;
create policy weeks_admin on public.weeks
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_select on public.skills;
create policy skills_select on public.skills
for select to authenticated using (public.is_allowlisted());

drop policy if exists skills_admin on public.skills;
create policy skills_admin on public.skills
for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Progress: own rows (+ admin)
drop policy if exists skill_progress_select on public.skill_progress;
create policy skill_progress_select on public.skill_progress
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists skill_progress_write on public.skill_progress;
create policy skill_progress_write on public.skill_progress
for all to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists recommendations_select on public.recommendations;
create policy recommendations_select on public.recommendations
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists recommendations_write on public.recommendations;
create policy recommendations_write on public.recommendations
for all to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists activity_events_select on public.activity_events;
create policy activity_events_select on public.activity_events
for select to authenticated
using (public.is_allowlisted());

drop policy if exists activity_events_insert on public.activity_events;
create policy activity_events_insert on public.activity_events
for insert to authenticated
with check (actor_id = auth.uid() or public.is_admin());
