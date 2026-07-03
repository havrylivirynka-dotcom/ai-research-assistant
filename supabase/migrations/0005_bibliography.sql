create table public.bibliography (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  reference_text text not null,
  source_type text,
  ai_score numeric(3, 1) check (ai_score >= 0 and ai_score <= 10),
  recommendation text
    check (recommendation in (
      'Highly Recommended', 'Recommended', 'Acceptable',
      'Use With Caution', 'Not Recommended'
    )),
  -- Structured checker output: duplicates, outdated flags, language coverage, issues[].
  ai_analysis jsonb,
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(reference_text, ''))
  ) stored
);

create index bibliography_project_id_idx on public.bibliography (project_id);
create index bibliography_created_at_idx on public.bibliography (created_at);
create index bibliography_ai_score_idx on public.bibliography (ai_score);
create index bibliography_search_vector_idx on public.bibliography using gin (search_vector);

alter table public.bibliography enable row level security;

create policy "Users can view bibliography in their own projects"
  on public.bibliography for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = bibliography.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can add bibliography to their own projects"
  on public.bibliography for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = bibliography.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update bibliography in their own projects"
  on public.bibliography for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = bibliography.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete bibliography from their own projects"
  on public.bibliography for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = bibliography.project_id
        and projects.user_id = auth.uid()
    )
  );
