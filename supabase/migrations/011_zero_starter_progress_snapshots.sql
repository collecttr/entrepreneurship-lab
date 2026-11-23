-- Course restart clean slate (2026-11-23): zero peer-board progress_snapshots
-- for Саша / Платон when there is no real course work yet.
-- Free tier: run once in Supabase SQL Editor after deploy of the client fix.
-- Safe to re-run (idempotent zeros).

-- Prefer full wipe of starter noise (both learners). Re-sync from the app
-- will upsert truthful 0% rows on next dashboard visit.
update public.progress_snapshots
set
  weeks_completed = 0,
  weeks_remaining = 26,
  stages_completed = 0,
  current_week = 1,
  assignments_completed = 0,
  progress_pct = 0,
  updated_at = now()
where lower(email) in (
  'standkill25@gmail.com',   -- Саша
  'officevishfind@gmail.com' -- Платон
)
or assignments_completed = 0;

-- Optional hard delete if you want empty table until first login sync:
-- delete from public.progress_snapshots
-- where lower(email) in ('standkill25@gmail.com', 'officevishfind@gmail.com');
