-- Stage 2: profiles, allowlist, program_settings, RLS base
-- Apply with: supabase db push  OR  paste into SQL editor

create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('learner', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.participant_slot as enum ('A', 'B');
exception when duplicate_object then null;
end $$;

-- Allowed emails (blocks future sign-ups; bootstrap inserts the two learners)
create table if not exists public.allowed_emails (
  email text primary key,
  invited_by uuid null,
  created_at timestamptz not null default now()
);

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role public.user_role not null default 'learner',
  participant_slot public.participant_slot null,
  avatar_path text null,
  timezone text not null default 'Europe/Moscow',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.program_settings (
  id int primary key default 1 check (id = 1),
  current_unlocked_week int not null default 1 check (current_unlocked_week between 1 and 26),
  program_start_date date not null default current_date,
  hours_per_week_target int not null default 240,
  ai_spend_lock boolean not null default true,
  ai_monthly_budget_tokens int not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.program_settings (id)
values (1)
on conflict (id) do nothing;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists program_settings_set_updated_at on public.program_settings;
create trigger program_settings_set_updated_at
before update on public.program_settings
for each row execute function public.set_updated_at();

-- Create profile + enforce allowlist on new auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  select exists (
    select 1 from public.allowed_emails ae where lower(ae.email) = lower(new.email)
  ) into allowed;

  if not allowed then
    raise exception 'Email % is not on the allowlist', new.email;
  end if;

  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helpers for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_allowlisted()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.allowed_emails ae on lower(ae.email) = lower(p.email)
    where p.id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.allowed_emails enable row level security;
alter table public.program_settings enable row level security;

-- profiles: both participants can read; write own row; admin all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (public.is_allowlisted());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
for insert to authenticated
with check (public.is_admin() or id = auth.uid());

-- allowed_emails: readable by allowlisted; write admin only
drop policy if exists allowed_emails_select on public.allowed_emails;
create policy allowed_emails_select on public.allowed_emails
for select to authenticated
using (public.is_allowlisted() or public.is_admin());

drop policy if exists allowed_emails_admin_write on public.allowed_emails;
create policy allowed_emails_admin_write on public.allowed_emails
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- program_settings: read authenticated allowlist; write admin
drop policy if exists program_settings_select on public.program_settings;
create policy program_settings_select on public.program_settings
for select to authenticated
using (public.is_allowlisted());

drop policy if exists program_settings_admin_update on public.program_settings;
create policy program_settings_admin_update on public.program_settings
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Disable public client sign-up preference note:
-- In Supabase Dashboard → Authentication → Providers → Email:
-- turn OFF "Enable sign ups" (accounts created via Admin API / bootstrap only).
