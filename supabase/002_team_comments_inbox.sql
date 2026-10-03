-- 002: names, managers, who did what, comments, inbox.
-- Only ADDS to the database: nothing existing is renamed or removed, so the current app keeps working.
-- Safe to run more than once. Paste into Supabase → SQL Editor → Run (confirm the warning).

-- People: a display name, venues a manager looks after, and the new Manager role.
alter table public.members add column if not exists name text;
alter table public.members add column if not exists venue_ids text[] not null default '{}';
alter table public.members drop constraint if exists members_role_check;
alter table public.members add constraint members_role_check check (role in ('owner','manager','maintenance'));

create or replace function public.my_email() returns text language sql stable as $$
  select lower(auth.jwt() ->> 'email')
$$;

-- Everyone on the team can see names and roles (for "Done by Mark", comment authors).
create or replace function public.team() returns table(email text, name text, role text, venue_ids text[])
language sql stable security definer set search_path = public as $$
  select m.email, m.name, m.role, m.venue_ids from public.members m where public.my_role() is not null
$$;

-- Anyone can change their own name (members itself stays owner-only for writes).
create or replace function public.set_my_name(new_name text) returns void
language sql security definer set search_path = public as $$
  update public.members set name = nullif(btrim(new_name), '') where email = public.my_email()
$$;

-- Managers can read venues and work with jobs and job photos.
drop policy if exists venues_read on public.venues;
create policy venues_read on public.venues for select to authenticated
  using (public.my_role() in ('owner','manager','maintenance'));

drop policy if exists jobs_team on public.jobs;
create policy jobs_team on public.jobs for all to authenticated
  using (public.my_role() in ('owner','manager','maintenance'))
  with check (public.my_role() in ('owner','manager','maintenance'));

drop policy if exists photos_jobs on storage.objects;
create policy photos_jobs on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','manager','maintenance'))
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','manager','maintenance'));

-- Who added a job and who finished it, stamped by the database (cannot be faked from a phone).
alter table public.jobs  add column if not exists created_by text;
alter table public.jobs  add column if not exists done_by text;
alter table public.notes add column if not exists created_by text;

create or replace function public.job_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(public.my_email(), new.created_by);
    if public.my_role() = 'manager' then new.done := false; new.deleted := false; end if;
    if new.done then new.done_by := new.created_by; end if;
  else
    if public.my_role() = 'manager'
       and (new.done is distinct from old.done or new.deleted is distinct from old.deleted) then
      raise exception 'Managers cannot finish or delete jobs' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
    if new.done and not old.done then new.done_by := public.my_email(); end if;
    if not new.done then new.done_by := null; end if;
  end if;
  return new;
end $$;
drop trigger if exists job_stamp on public.jobs;
create trigger job_stamp before insert or update on public.jobs for each row execute function public.job_stamp();

create or replace function public.note_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then new.created_by := coalesce(public.my_email(), new.created_by);
  else new.created_by := old.created_by; end if;
  return new;
end $$;
drop trigger if exists note_stamp on public.notes;
create trigger note_stamp before insert or update on public.notes for each row execute function public.note_stamp();

-- Comments on jobs (whole team) and on Mili's notes (owners only).
create table if not exists public.comments (
  id text primary key default gen_random_uuid()::text,
  job_id text references public.jobs(id) on delete cascade,
  note_id text references public.notes(id) on delete cascade,
  author text,
  body text not null default '',
  attachments text[] not null default '{}',
  created_at timestamptz not null default now(),
  check ((job_id is null) <> (note_id is null))
);
create index if not exists comments_job  on public.comments(job_id);
create index if not exists comments_note on public.comments(note_id);
alter table public.comments enable row level security;

create or replace function public.comment_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.author := public.my_email();
  new.created_at := now();
  return new;
end $$;
drop trigger if exists comment_stamp on public.comments;
create trigger comment_stamp before insert on public.comments for each row execute function public.comment_stamp();

drop policy if exists comments_read   on public.comments;
drop policy if exists comments_add    on public.comments;
drop policy if exists comments_change on public.comments;
drop policy if exists comments_remove on public.comments;
create policy comments_read on public.comments for select to authenticated using (
  (job_id is not null and public.my_role() in ('owner','manager','maintenance'))
  or (note_id is not null and public.my_role() = 'owner'));
create policy comments_add on public.comments for insert to authenticated with check (
  (job_id is not null and public.my_role() in ('owner','manager','maintenance'))
  or (note_id is not null and public.my_role() = 'owner'));
create policy comments_change on public.comments for update to authenticated
  using (author = public.my_email()) with check (author = public.my_email());
create policy comments_remove on public.comments for delete to authenticated
  using (author = public.my_email() or public.my_role() = 'owner');

-- Inbox: one row per person per event. Written only by the triggers below.
create table if not exists public.inbox (
  id bigint generated always as identity primary key,
  recipient text not null,
  kind text not null check (kind in ('comment','new_job','job_done')),
  job_id text references public.jobs(id) on delete cascade,
  note_id text references public.notes(id) on delete cascade,
  actor text,
  preview text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  pushed_at timestamptz
);
create index if not exists inbox_recipient on public.inbox(recipient, read_at);
alter table public.inbox enable row level security;
drop policy if exists inbox_mine      on public.inbox;
drop policy if exists inbox_mark_read on public.inbox;
create policy inbox_mine on public.inbox for select to authenticated using (recipient = public.my_email());
create policy inbox_mark_read on public.inbox for update to authenticated
  using (recipient = public.my_email()) with check (recipient = public.my_email());

-- Who hears about a job: owners, maintenance, managers of its venue (or of any venue for "All venues"), and whoever added it.
create or replace function public.job_audience(j public.jobs) returns setof text
language sql stable security definer set search_path = public as $$
  select email from public.members where role in ('owner','maintenance')
  union
  select email from public.members where role = 'manager' and (j.all_venues or venue_ids && j.venue_ids)
  union
  select j.created_by where j.created_by is not null
$$;

create or replace function public.inbox_on_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare j public.jobs; n public.notes;
begin
  if new.job_id is not null then
    select * into j from public.jobs where id = new.job_id;
    insert into public.inbox(recipient, kind, job_id, actor, preview)
      select a, 'comment', new.job_id, new.author, left(new.body, 140)
      from public.job_audience(j) a where a is distinct from new.author;
  else
    insert into public.inbox(recipient, kind, note_id, actor, preview)
      select email, 'comment', new.note_id, new.author, left(new.body, 140)
      from public.members where role = 'owner' and email is distinct from new.author;
  end if;
  return new;
end $$;
drop trigger if exists inbox_on_comment on public.comments;
create trigger inbox_on_comment after insert on public.comments for each row execute function public.inbox_on_comment();

-- New job: maintenance and the venue's managers hear about it (owners usually create jobs themselves).
-- Finished job: owners, the venue's managers and whoever added it.
create or replace function public.inbox_on_job() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and not new.done then
    insert into public.inbox(recipient, kind, job_id, actor, preview)
      select email, 'new_job', new.id, new.created_by, left(new.text, 140) from public.members
      where (role = 'maintenance' or (role = 'manager' and (new.all_venues or venue_ids && new.venue_ids)))
        and email is distinct from new.created_by;
  elsif tg_op = 'UPDATE' and new.done and not old.done then
    insert into public.inbox(recipient, kind, job_id, actor, preview)
      select a, 'job_done', new.id, new.done_by, left(new.text, 140) from (
        select email a from public.members where role = 'owner'
        union select email from public.members where role = 'manager' and (new.all_venues or venue_ids && new.venue_ids)
        union select new.created_by where new.created_by is not null
      ) r where a is distinct from new.done_by;
  end if;
  return new;
end $$;
drop trigger if exists inbox_on_job on public.jobs;
create trigger inbox_on_job after insert or update on public.jobs for each row execute function public.inbox_on_job();

do $$
declare t text;
begin
  foreach t in array array['comments','inbox'] loop
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
