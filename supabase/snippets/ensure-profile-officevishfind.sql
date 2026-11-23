-- Ensure allowlist + profiles row for Платон (officevishfind@gmail.com)
-- Run in Supabase → SQL Editor as project owner (bypasses RLS).
-- Auth user must already exist (Dashboard → Authentication → Users).

insert into public.allowed_emails (email)
values ('officevishfind@gmail.com')
on conflict (email) do nothing;

insert into public.profiles (id, email, display_name, role, participant_slot, timezone)
select
  u.id,
  lower(u.email),
  'Платон',
  'learner'::public.user_role,
  'A'::public.participant_slot,
  'Europe/Moscow'
from auth.users u
where lower(u.email) = 'officevishfind@gmail.com'
on conflict (id) do update
set
  email = excluded.email,
  display_name = 'Платон',
  role = coalesce(public.profiles.role, 'learner'::public.user_role),
  participant_slot = coalesce(public.profiles.participant_slot, 'A'::public.participant_slot),
  updated_at = now();

-- Verify
select p.id, p.email, p.display_name, p.role, p.participant_slot, ae.email as allowlisted
from public.profiles p
left join public.allowed_emails ae on lower(ae.email) = lower(p.email)
where lower(p.email) = 'officevishfind@gmail.com';
