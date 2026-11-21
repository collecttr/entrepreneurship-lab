-- Stage 4: chat, forum, assignment comments + Realtime publication

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body_md text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz null,
  attachment_name text null,
  attachment_stub boolean not null default false
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid null references public.weeks (id) on delete set null,
  week_number int null check (week_number is null or week_number between 1 and 26),
  title text not null,
  description_md text not null default '',
  kind text not null default 'question' check (kind in ('debate', 'question', 'case', 'source', 'general')),
  author_id uuid not null references public.profiles (id) on delete cascade,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body_md text not null,
  parent_id uuid null references public.discussion_posts (id) on delete cascade,
  quote_md text null,
  attachment_name text null,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_comments (
  id uuid primary key default gen_random_uuid(),
  assignment_code text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body_md text not null,
  quote_md text null,
  created_at timestamptz not null default now()
);

create index if not exists messages_created_at_idx on public.messages (created_at);
create index if not exists discussion_posts_discussion_idx on public.discussion_posts (discussion_id, created_at);
create index if not exists assignment_comments_code_idx on public.assignment_comments (assignment_code, created_at);

alter table public.messages enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_posts enable row level security;
alter table public.assignment_comments enable row level security;

-- Both allowlisted learners can read/write chat and forum
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
for select to authenticated using (public.is_allowlisted());

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
for insert to authenticated
with check (sender_id = auth.uid() and public.is_allowlisted());

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
for update to authenticated
using (public.is_allowlisted())
with check (public.is_allowlisted());

drop policy if exists discussions_select on public.discussions;
create policy discussions_select on public.discussions
for select to authenticated using (public.is_allowlisted());

drop policy if exists discussions_write on public.discussions;
create policy discussions_write on public.discussions
for all to authenticated
using (public.is_allowlisted())
with check (author_id = auth.uid() or public.is_admin());

drop policy if exists discussion_posts_select on public.discussion_posts;
create policy discussion_posts_select on public.discussion_posts
for select to authenticated using (public.is_allowlisted());

drop policy if exists discussion_posts_insert on public.discussion_posts;
create policy discussion_posts_insert on public.discussion_posts
for insert to authenticated
with check (author_id = auth.uid() and public.is_allowlisted());

drop policy if exists assignment_comments_select on public.assignment_comments;
create policy assignment_comments_select on public.assignment_comments
for select to authenticated using (public.is_allowlisted());

drop policy if exists assignment_comments_insert on public.assignment_comments;
create policy assignment_comments_insert on public.assignment_comments
for insert to authenticated
with check (author_id = auth.uid() and public.is_allowlisted());

-- Realtime (run in Supabase; ignore if publication already has tables)
do $$
begin
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null; when undefined_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.discussion_posts;
  exception when duplicate_object then null; when undefined_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.assignment_comments;
  exception when duplicate_object then null; when undefined_object then null;
  end;
end $$;
