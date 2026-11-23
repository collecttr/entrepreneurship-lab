-- Cross-device UI prefs (last chat peer, forum topic, routes) — free-tier friendly.
-- Own-row RLS only. Apply in Supabase SQL Editor after 001–013.

create table if not exists public.ui_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists ui_prefs_set_updated_at on public.ui_prefs;
create trigger ui_prefs_set_updated_at
before update on public.ui_prefs
for each row execute function public.set_updated_at();

alter table public.ui_prefs enable row level security;

-- Own user only (no peer read of navigation context)
drop policy if exists ui_prefs_select_own on public.ui_prefs;
create policy ui_prefs_select_own on public.ui_prefs
for select to authenticated
using (user_id = auth.uid());

drop policy if exists ui_prefs_insert_own on public.ui_prefs;
create policy ui_prefs_insert_own on public.ui_prefs
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists ui_prefs_update_own on public.ui_prefs;
create policy ui_prefs_update_own on public.ui_prefs
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists ui_prefs_delete_own on public.ui_prefs;
create policy ui_prefs_delete_own on public.ui_prefs
for delete to authenticated
using (user_id = auth.uid());

-- Realtime so phone ↔ PC picks up last path without full reload (optional; client also pulls on login)
do $$
begin
  begin
    alter publication supabase_realtime add table public.ui_prefs;
  exception when duplicate_object then null; when undefined_object then null;
  end;
end $$;
