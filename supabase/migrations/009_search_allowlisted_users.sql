-- Email search among allowlisted registered profiles (closed course, 2 learners)
-- Apply in Supabase SQL Editor after 001–008.

create or replace function public.search_allowlisted_users(search_query text default '')
returns table (
  id uuid,
  email text,
  display_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.display_name
  from public.profiles p
  inner join public.allowed_emails ae
    on lower(ae.email) = lower(p.email)
  where
    public.is_allowlisted()
    and p.id is distinct from auth.uid()
    and (
      nullif(trim(coalesce(search_query, '')), '') is null
      or lower(p.email) like '%' || lower(trim(search_query)) || '%'
      or lower(p.display_name) like '%' || lower(trim(search_query)) || '%'
    )
  order by p.email asc
  limit 20;
$$;

revoke all on function public.search_allowlisted_users(text) from public;
grant execute on function public.search_allowlisted_users(text) to authenticated;
