-- Public profile mirror of auth.users, plus per-user settings and API usage tables.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  language text not null default 'uk',
  ai_model text not null default 'gpt-5.1',
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default now()
);

create table public.api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  endpoint text not null,
  tokens integer not null default 0,
  cost numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);

create table public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  query text not null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index users_email_idx on public.users (email);
create index user_settings_user_id_idx on public.user_settings (user_id);
create index api_usage_user_id_idx on public.api_usage (user_id);
create index api_usage_created_at_idx on public.api_usage (created_at);
create index search_history_user_id_idx on public.search_history (user_id);
create index search_history_created_at_idx on public.search_history (created_at);

-- Keep public.users.updated_at current.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

-- Mirror new Supabase Auth signups into public.users and seed default settings.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.user_settings (user_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Row Level Security

alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.api_usage enable row level security;
alter table public.search_history enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can view their own api usage"
  on public.api_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert their own api usage"
  on public.api_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own search history"
  on public.search_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own search history"
  on public.search_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own search history"
  on public.search_history for delete
  using (auth.uid() = user_id);
