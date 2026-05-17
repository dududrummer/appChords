create table if not exists public.community_creations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dictionary', 'progression', 'exercise')),
  title text not null,
  description text,
  payload jsonb not null default '{}'::jsonb,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default now()
);

alter table public.community_creations enable row level security;

grant usage on schema public to authenticated;
grant select, insert, delete on table public.community_creations to authenticated;

drop policy if exists "community creations are readable by authenticated users" on public.community_creations;
create policy "community creations are readable by authenticated users"
on public.community_creations
for select
to authenticated
using (true);

drop policy if exists "users can publish own community creations" on public.community_creations;
create policy "users can publish own community creations"
on public.community_creations
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "users can delete own community creations" on public.community_creations;
create policy "users can delete own community creations"
on public.community_creations
for delete
to authenticated
using (auth.uid() = author_id);
