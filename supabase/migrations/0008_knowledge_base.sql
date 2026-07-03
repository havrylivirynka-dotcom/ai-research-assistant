-- Official regulation documents (e.g. МАН competition rules) used to ground
-- the МАН Expert RAG assistant. Managed via scripts/ingest-knowledge-base.ts
-- using the service role key; regular users only ever read from this table.

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  order_number text,
  issuing_authority text,
  effective_date date,
  status text not null default 'active' check (status in ('active', 'superseded')),
  source text,
  created_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents (id) on delete cascade,
  content text not null,
  section_ref text,
  chunk_index integer not null,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now()
);

create index knowledge_chunks_document_id_idx on public.knowledge_chunks (document_id);
create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;

create policy "Authenticated users can read knowledge documents"
  on public.knowledge_documents for select
  to authenticated
  using (true);

create policy "Authenticated users can read knowledge chunks"
  on public.knowledge_chunks for select
  to authenticated
  using (true);

-- Similarity search RPC used by the RAG retrieval pipeline.
create function public.match_knowledge_chunks(
  query_embedding extensions.vector(1536),
  match_count integer default 6,
  similarity_threshold float default 0.5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  section_ref text,
  similarity float
)
language sql
stable
set search_path = public, extensions
as $$
  select
    knowledge_chunks.id,
    knowledge_chunks.document_id,
    knowledge_chunks.content,
    knowledge_chunks.section_ref,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks
  where 1 - (knowledge_chunks.embedding <=> query_embedding) > similarity_threshold
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
$$;
