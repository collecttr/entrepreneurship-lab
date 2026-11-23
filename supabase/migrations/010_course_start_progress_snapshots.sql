-- Course calendar start (Europe/Moscow week 1 = 2026-11-23) + peer progress snapshots.
-- Free-tier friendly: small table, RLS for allowlisted pair, client upserts own row.

update public.program_settings
set program_start_date = '2026-11-23',
    updated_at = now()
where id = 1;

create table if not exists public.progress_snapshots (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text not null,
  display_name text not null,
  participant_slot public.participant_slot null,
  weeks_completed int not null default 0 check (weeks_completed between 0 and 26),
  weeks_remaining int not null default 26 check (weeks_remaining between 0 and 26),
  stages_completed int not null default 0 check (stages_completed between 0 and 16),
  current_week int not null default 1 check (current_week between 1 and 26),
  assignments_completed int not null default 0,
  assignments_total int not null default 0,
  progress_pct int not null default 0 check (progress_pct between 0 and 100),
  updated_at timestamptz not null default now()
);

create index if not exists progress_snapshots_email_idx on public.progress_snapshots (email);

drop trigger if exists progress_snapshots_set_updated_at on public.progress_snapshots;
create trigger progress_snapshots_set_updated_at
before update on public.progress_snapshots
for each row execute function public.set_updated_at();

alter table public.progress_snapshots enable row level security;

-- Both allowlisted learners can read everyone's snapshot (closed course of 2).
drop policy if exists progress_snapshots_select on public.progress_snapshots;
create policy progress_snapshots_select on public.progress_snapshots
for select to authenticated
using (public.is_allowlisted());

drop policy if exists progress_snapshots_upsert_own on public.progress_snapshots;
create policy progress_snapshots_upsert_own on public.progress_snapshots
for insert to authenticated
with check (user_id = auth.uid() and public.is_allowlisted());

drop policy if exists progress_snapshots_update_own on public.progress_snapshots;
create policy progress_snapshots_update_own on public.progress_snapshots
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Canonical display names for the two learners (idempotent).
update public.profiles
set display_name = 'Саша',
    updated_at = now()
where lower(email) = 'standkill25@gmail.com';

update public.profiles
set display_name = 'Платон',
    updated_at = now()
where lower(email) = 'officevishfind@gmail.com';
