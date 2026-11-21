-- Fix post-login bounce: allowlist/profile RLS chicken-egg
-- Apply in Supabase SQL Editor after 001–006.

-- Allowlist check via JWT email (works before profiles row exists)
create or replace function public.is_allowlisted()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_emails ae
    where lower(ae.email) = lower(
      coalesce(
        nullif(auth.jwt() ->> 'email', ''),
        (select p.email from public.profiles p where p.id = auth.uid())
      )
    )
  );
$$;

-- Explicit RPC for client allowlist checks (bypasses allowed_emails SELECT RLS)
create or replace function public.is_email_allowlisted(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_emails ae
    where lower(ae.email) = lower(check_email)
  );
$$;

grant execute on function public.is_email_allowlisted(text) to authenticated, anon;

-- Own profile always readable (recover / upsert path)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_allowlisted());

-- Insert own row only when JWT email is allowlisted (or admin)
drop policy if exists profiles_admin_insert on public.profiles;
create policy profiles_admin_insert on public.profiles
for insert to authenticated
with check (
  public.is_admin()
  or (id = auth.uid() and public.is_allowlisted())
);
