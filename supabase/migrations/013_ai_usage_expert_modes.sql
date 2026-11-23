-- Hybrid expert exam: keep live_proxy for serverless free-tier calls.
-- Modes stay: local_examiner | live_proxy | blocked_spend_lock
-- (expert_llm is a client/UI label; metering rows use live_proxy.)

alter table public.ai_usage
  drop constraint if exists ai_usage_mode_check;

alter table public.ai_usage
  add constraint ai_usage_mode_check
  check (mode in ('local_examiner', 'live_proxy', 'blocked_spend_lock'));

comment on table public.ai_usage is
  'AI usage: local_examiner (client), live_proxy (Vercel /api/expert-exam free LLMs), blocked_spend_lock';

-- Defaults remain free-tier friendly; paid spend still locked at app level.
update public.program_settings
set ai_spend_lock = true
where id = 1;
