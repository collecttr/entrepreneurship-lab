-- Peer progress board live updates (Саша / Платон) — free-tier friendly.
-- One small table already RLS'd; enable Realtime so the other learner sees upserts without refresh.

do $$
begin
  begin
    alter publication supabase_realtime add table public.progress_snapshots;
  exception when duplicate_object then null; when undefined_object then null;
  end;
end $$;
