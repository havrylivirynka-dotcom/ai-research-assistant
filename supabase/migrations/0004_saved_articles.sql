create table public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  authors jsonb not null default '[]'::jsonb,
  abstract text,
  doi text,
  journal text,
  publisher text,
  publication_year integer,
  citations integer not null default 0,
  url text,
  ai_score numeric(3, 1) check (ai_score >= 0 and ai_score <= 10),
  ai_summary text,
  -- Structured multi-dimensional evaluation: credibility, relevance, freshness,
  -- methodologyQuality, recommendation, explanation, strengths, weaknesses, risks.
  ai_evaluation jsonb,
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(abstract, '')), 'B')
  ) stored
);

create index saved_articles_project_id_idx on public.saved_articles (project_id);
create index saved_articles_doi_idx on public.saved_articles (doi);
create index saved_articles_publication_year_idx on public.saved_articles (publication_year);
create index saved_articles_created_at_idx on public.saved_articles (created_at);
create index saved_articles_ai_score_idx on public.saved_articles (ai_score);
create index saved_articles_search_vector_idx on public.saved_articles using gin (search_vector);

alter table public.saved_articles enable row level security;

create policy "Users can view articles in their own projects"
  on public.saved_articles for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = saved_articles.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can save articles to their own projects"
  on public.saved_articles for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = saved_articles.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update articles in their own projects"
  on public.saved_articles for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = saved_articles.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete articles from their own projects"
  on public.saved_articles for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = saved_articles.project_id
        and projects.user_id = auth.uid()
    )
  );
