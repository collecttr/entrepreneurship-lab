-- Stage 5: private documents, versions, comments, Storage bucket policies

do $$ begin
  create type public.document_category as enum (
    'essay',
    'research_report',
    'analytical_note',
    'commercial_proposal',
    'product_presentation',
    'negotiation_strategy',
    'final_work'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.ai_eval_status as enum (
    'none',
    'pending_ai',
    'manual_only',
    'completed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.document_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description_md text not null default '',
  category public.document_category not null,
  week_number int null check (week_number is null or week_number between 1 and 26),
  assignment_code text null,
  source_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_files (
  id uuid primary key default gen_random_uuid(),
  document_group_id uuid not null references public.document_groups (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  submission_id uuid null,
  exam_attempt_id uuid null,
  path text not null,
  filename text not null,
  mime text not null,
  size_bytes bigint not null check (size_bytes > 0),
  version int not null default 1,
  created_at timestamptz not null default now(),
  unique (document_group_id, version)
);

create table if not exists public.document_comments (
  id uuid primary key default gen_random_uuid(),
  document_group_id uuid not null references public.document_groups (id) on delete cascade,
  document_file_id uuid null references public.document_files (id) on delete set null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body_md text not null,
  quote_md text null,
  anchor jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_evaluations (
  id uuid primary key default gen_random_uuid(),
  document_group_id uuid not null references public.document_groups (id) on delete cascade,
  document_file_id uuid null references public.document_files (id) on delete set null,
  ai_status public.ai_eval_status not null default 'pending_ai',
  ai_score numeric(5,2) null,
  ai_feedback_md text null,
  manual_score numeric(5,2) null,
  manual_feedback_md text null,
  updated_at timestamptz not null default now(),
  unique (document_group_id)
);

create index if not exists document_files_group_idx on public.document_files (document_group_id, version desc);
create index if not exists document_comments_group_idx on public.document_comments (document_group_id, created_at);

alter table public.document_groups enable row level security;
alter table public.document_files enable row level security;
alter table public.document_comments enable row level security;
alter table public.document_evaluations enable row level security;

-- Owner + peer (allowlisted) can read after upload; write own / admin
drop policy if exists document_groups_select on public.document_groups;
create policy document_groups_select on public.document_groups
for select to authenticated using (public.is_allowlisted());

drop policy if exists document_groups_write on public.document_groups;
create policy document_groups_write on public.document_groups
for all to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists document_files_select on public.document_files;
create policy document_files_select on public.document_files
for select to authenticated using (public.is_allowlisted());

drop policy if exists document_files_write on public.document_files;
create policy document_files_write on public.document_files
for all to authenticated
using (owner_id = auth.uid() or public.is_admin())
with check (owner_id = auth.uid() or public.is_admin());

drop policy if exists document_comments_select on public.document_comments;
create policy document_comments_select on public.document_comments
for select to authenticated using (public.is_allowlisted());

drop policy if exists document_comments_insert on public.document_comments;
create policy document_comments_insert on public.document_comments
for insert to authenticated
with check (author_id = auth.uid() and public.is_allowlisted());

drop policy if exists document_evaluations_select on public.document_evaluations;
create policy document_evaluations_select on public.document_evaluations
for select to authenticated using (public.is_allowlisted());

drop policy if exists document_evaluations_write on public.document_evaluations;
create policy document_evaluations_write on public.document_evaluations
for all to authenticated
using (public.is_admin() or public.is_allowlisted())
with check (public.is_admin() or public.is_allowlisted());

-- Private Storage bucket (no public access). Downloads only via signed URLs after authz.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {user_id}/{group_id}/v{version}/{filename}
drop policy if exists documents_storage_select on storage.objects;
create policy documents_storage_select on storage.objects
for select to authenticated
using (
  bucket_id = 'documents'
  and public.is_allowlisted()
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or public.is_allowlisted()
  )
);

drop policy if exists documents_storage_insert on storage.objects;
create policy documents_storage_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists documents_storage_update on storage.objects;
create policy documents_storage_update on storage.objects
for update to authenticated
using (
  bucket_id = 'documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

drop policy if exists documents_storage_delete on storage.objects;
create policy documents_storage_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'documents'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);

-- NOTE: Never create permanent public URLs. Use short-lived signed URLs from a server Function
-- after checking authz (see src/lib/document-storage.ts createSignedDownloadUrl).
