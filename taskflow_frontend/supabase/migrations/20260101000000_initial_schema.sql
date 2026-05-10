-- Initial schema: tables, RLS, triggers, auth handoff.
-- Idempotent: safe on a fresh project AND on a project that already has it.

-- =============================================================
-- Helpers
-- =============================================================
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- public.users  (1:1 with auth.users; holds app-level profile fields)
-- =============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text default 'UTC',
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

drop trigger if exists update_profiles_updated_at on public.users;
create trigger update_profiles_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

-- Auto-create a public.users row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- public.tasks
-- =============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'in-progress', 'done')),
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Users can manage their own tasks" on public.tasks;
create policy "Users can manage their own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

drop trigger if exists update_tasks_updated_at on public.tasks;
create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at_column();

-- =============================================================
-- public.subtasks
-- =============================================================
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subtasks enable row level security;

drop policy if exists "Users can manage subtasks of their own tasks" on public.subtasks;
create policy "Users can manage subtasks of their own tasks"
  on public.subtasks for all
  using (
    exists (
      select 1 from public.tasks
      where tasks.id = subtasks.task_id
        and tasks.user_id = auth.uid()
    )
  );

drop trigger if exists update_subtasks_updated_at on public.subtasks;
create trigger update_subtasks_updated_at
  before update on public.subtasks
  for each row execute function public.update_updated_at_column();
