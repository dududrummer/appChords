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

create table if not exists public.community_creation_likes (
  creation_id uuid not null references public.community_creations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (creation_id, user_id)
);

create table if not exists public.community_creation_comments (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid not null references public.community_creations(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists community_creation_likes_creation_id_idx
on public.community_creation_likes (creation_id);

create index if not exists community_creation_comments_creation_id_created_at_idx
on public.community_creation_comments (creation_id, created_at);

alter table public.community_creation_likes enable row level security;
alter table public.community_creation_comments enable row level security;

grant select, insert, delete on table public.community_creation_likes to authenticated;
grant select, insert, delete on table public.community_creation_comments to authenticated;

drop policy if exists "community likes are readable by authenticated users" on public.community_creation_likes;
create policy "community likes are readable by authenticated users"
on public.community_creation_likes
for select
to authenticated
using (true);

drop policy if exists "users can like as themselves" on public.community_creation_likes;
create policy "users can like as themselves"
on public.community_creation_likes
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = user_id
);

drop policy if exists "users can remove own likes" on public.community_creation_likes;
create policy "users can remove own likes"
on public.community_creation_likes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "community comments are readable by authenticated users" on public.community_creation_comments;
create policy "community comments are readable by authenticated users"
on public.community_creation_comments
for select
to authenticated
using (true);

drop policy if exists "users can comment as themselves" on public.community_creation_comments;
create policy "users can comment as themselves"
on public.community_creation_comments
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = author_id
);

drop policy if exists "users can delete own comments" on public.community_creation_comments;
create policy "users can delete own comments"
on public.community_creation_comments
for delete
to authenticated
using (auth.uid() = author_id);

notify pgrst, 'reload schema';
