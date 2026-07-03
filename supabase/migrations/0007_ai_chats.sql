create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  mode text not null default 'research_assistant'
    check (mode in (
      'research_assistant', 'man_expert', 'source_evaluator',
      'pdf_analyzer', 'bibliography_checker', 'structure_generator'
    )),
  title text,
  created_at timestamptz not null default now()
);

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.ai_chats (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  -- Retrieved knowledge_chunks references for grounded МАН Expert answers.
  citations jsonb,
  tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create index ai_chats_project_id_idx on public.ai_chats (project_id);
create index ai_messages_chat_id_idx on public.ai_messages (chat_id);
create index ai_messages_created_at_idx on public.ai_messages (created_at);

alter table public.ai_chats enable row level security;
alter table public.ai_messages enable row level security;

create policy "Users can view chats in their own projects"
  on public.ai_chats for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = ai_chats.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can create chats in their own projects"
  on public.ai_chats for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = ai_chats.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete chats from their own projects"
  on public.ai_chats for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = ai_chats.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can view messages in their own chats"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_chats
      join public.projects on projects.id = ai_chats.project_id
      where ai_chats.id = ai_messages.chat_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can add messages to their own chats"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_chats
      join public.projects on projects.id = ai_chats.project_id
      where ai_chats.id = ai_messages.chat_id
        and projects.user_id = auth.uid()
    )
  );
