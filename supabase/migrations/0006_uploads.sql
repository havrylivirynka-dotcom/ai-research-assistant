create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  size bigint not null,
  extracted_text text,
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  -- Structured PDF analysis: summary, keyContributions, strengths, weaknesses,
  -- limitations, possibleCitations, methods, findings.
  ai_analysis jsonb,
  uploaded_at timestamptz not null default now()
);

create index uploads_project_id_idx on public.uploads (project_id);
create index uploads_status_idx on public.uploads (status);
create index uploads_uploaded_at_idx on public.uploads (uploaded_at);

alter table public.uploads enable row level security;

create policy "Users can view uploads in their own projects"
  on public.uploads for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can add uploads to their own projects"
  on public.uploads for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update uploads in their own projects"
  on public.uploads for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete uploads from their own projects"
  on public.uploads for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );
