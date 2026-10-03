-- Operations: database setup. Paste this whole file into Supabase → SQL Editor → Run.
-- Safe to run again; it only creates what is missing.
-- BEFORE RUNNING: replace the two emails at the bottom with yours and Mili's.

-- Who may use the app, and as what. Owners see everything; maintenance sees jobs only.
create table if not exists public.members (
  email text primary key,
  role text not null check (role in ('owner','maintenance')),
  created_at timestamptz not null default now()
);

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.members where email = lower(auth.jwt() ->> 'email')
$$;

create table if not exists public.venues (
  id text primary key,
  name text not null,
  ord int not null default 0,
  created_at bigint
);

-- Mili's own notes per venue (owners only).
create table if not exists public.notes (
  id text primary key,
  venue_ids text[] not null default '{}',
  text text not null default '',
  priority int not null default 2,
  pinned boolean not null default false,
  photos text[] not null default '{}',
  done boolean not null default false,
  done_at bigint,
  deleted boolean not null default false,
  deleted_at bigint,
  created_at bigint
);

-- Maintenance jobs (owners and maintenance).
create table if not exists public.jobs (
  id text primary key,
  venue_ids text[] not null default '{}',
  all_venues boolean not null default false,
  text text not null default '',
  priority int not null default 2,
  due date,
  photos text[] not null default '{}',
  done boolean not null default false,
  done_at bigint,
  deleted boolean not null default false,
  deleted_at bigint,
  created_at bigint
);

-- Essentials: VAT, addresses, quick links (owners only).
create table if not exists public.essentials (
  id text primary key,
  label text not null,
  value text not null default '',
  ord int not null default 0
);

alter table public.members    enable row level security;
alter table public.venues     enable row level security;
alter table public.notes      enable row level security;
alter table public.jobs       enable row level security;
alter table public.essentials enable row level security;

drop policy if exists members_read  on public.members;
drop policy if exists members_write on public.members;
create policy members_read  on public.members for select to authenticated
  using (public.my_role() = 'owner' or email = lower(auth.jwt() ->> 'email'));
create policy members_write on public.members for all to authenticated
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

drop policy if exists venues_read  on public.venues;
drop policy if exists venues_write on public.venues;
create policy venues_read  on public.venues for select to authenticated
  using (public.my_role() in ('owner','maintenance'));
create policy venues_write on public.venues for all to authenticated
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

drop policy if exists notes_owner on public.notes;
create policy notes_owner on public.notes for all to authenticated
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

drop policy if exists essentials_owner on public.essentials;
create policy essentials_owner on public.essentials for all to authenticated
  using (public.my_role() = 'owner') with check (public.my_role() = 'owner');

drop policy if exists jobs_team on public.jobs;
create policy jobs_team on public.jobs for all to authenticated
  using (public.my_role() in ('owner','maintenance')) with check (public.my_role() in ('owner','maintenance'));

-- Photos: private bucket. notes/… for owners only, jobs/… for the whole team.
insert into storage.buckets (id, name, public) values ('photos','photos', false) on conflict (id) do nothing;
drop policy if exists photos_notes on storage.objects;
drop policy if exists photos_jobs  on storage.objects;
create policy photos_notes on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = 'notes' and public.my_role() = 'owner')
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'notes' and public.my_role() = 'owner');
create policy photos_jobs on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','maintenance'))
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','maintenance'));

-- Live updates between devices.
do $$
declare t text;
begin
  foreach t in array array['members','venues','notes','jobs','essentials'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- The two owners. Replace with the real addresses (keep the quotes).
insert into public.members (email, role) values
  (lower('YOUR-EMAIL@example.com'), 'owner'),
  (lower('MILI-EMAIL@example.com'), 'owner')
on conflict (email) do nothing;
