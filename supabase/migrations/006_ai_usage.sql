-- Stage 6: AI usage metering + spend lock defaults

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  trainer_slug text not null,
  tokens_in int not null default 0,
  tokens_out int not null default 0,
  cost_units numeric(12,4) not null default 0,
  mode text not null default 'local_examiner'
    check (mode in ('local_examiner', 'live_proxy', 'blocked_spend_lock')),
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_month_idx
  on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;

drop policy if exists ai_usage_select on public.ai_usage;
create policy ai_usage_select on public.ai_usage
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists ai_usage_insert on public.ai_usage;
create policy ai_usage_insert on public.ai_usage
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

-- Ensure spend lock stays ON by default
update public.program_settings
set ai_spend_lock = true,
    ai_monthly_budget_tokens = coalesce(ai_monthly_budget_tokens, 0)
where id = 1;

-- Live AI calls must go through server Functions with service role / host secrets.
-- Client never holds provider API keys.
