-- 004: Admin role, tasks assigned to managers, managers' own tasks per area.
-- Only ADDS to the database. Mili's existing notes stay private to owners.
-- Who sees a note:
--   owner    -> everything
--   admin    -> tasks (assigned to someone, or written by a non-owner); never owners' private notes
--   manager  -> notes assigned to them, and notes they wrote
--   maintenance -> no notes

alter table public.members drop constraint if exists members_role_check;
alter table public.members add constraint members_role_check check (role in ('owner','admin','manager','maintenance'));

alter table public.notes add column if not exists assignee text;
alter table public.notes add column if not exists done_by text;
create index if not exists notes_assignee on public.notes(assignee);

create or replace function public.can_see_note(n public.notes) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.my_role()
    when 'owner'   then true
    when 'admin'   then n.assignee is not null
                        or (n.created_by is not null and n.created_by not in (select email from public.members where role = 'owner'))
    when 'manager' then n.assignee = public.my_email() or n.created_by = public.my_email()
    else false end
$$;

drop policy if exists notes_owner  on public.notes;
drop policy if exists notes_read   on public.notes;
drop policy if exists notes_add    on public.notes;
drop policy if exists notes_change on public.notes;
drop policy if exists notes_remove on public.notes;
create policy notes_read   on public.notes for select to authenticated using (public.can_see_note(notes));
create policy notes_add    on public.notes for insert to authenticated with check (public.my_role() in ('owner','admin','manager'));
create policy notes_change on public.notes for update to authenticated using (public.can_see_note(notes)) with check (public.can_see_note(notes));
create policy notes_remove on public.notes for delete to authenticated using (public.my_role() = 'owner');

-- Stamps and limits, enforced by the database (cannot be bypassed from a phone):
--   managers' tasks are always assigned to themselves and they cannot reassign;
--   admins cannot finish or delete; whoever finishes is recorded.
create or replace function public.note_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(public.my_email(), new.created_by);
    if public.my_role() = 'manager' then new.assignee := public.my_email(); end if;
    if public.my_role() = 'admin' then new.done := false; new.deleted := false; end if;
    if new.done then new.done_by := new.created_by; end if;
  else
    new.created_by := old.created_by;
    if public.my_role() = 'admin'
       and (new.done is distinct from old.done or new.deleted is distinct from old.deleted) then
      raise exception 'Admins cannot finish or delete tasks' using errcode = '42501';
    end if;
    if public.my_role() = 'manager' then new.assignee := old.assignee; end if;
    if new.done and not old.done then new.done_by := public.my_email(); end if;
    if not new.done then new.done_by := null; end if;
  end if;
  return new;
end $$;

-- Admins work with maintenance jobs like managers do (add, edit, comment; not finish or delete).
create or replace function public.job_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(public.my_email(), new.created_by);
    if public.my_role() in ('manager','admin') then new.done := false; new.deleted := false; end if;
    if new.done then new.done_by := new.created_by; end if;
  else
    if public.my_role() in ('manager','admin')
       and (new.done is distinct from old.done or new.deleted is distinct from old.deleted) then
      raise exception 'Only maintenance and owners can finish or delete jobs' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
    if new.done and not old.done then new.done_by := public.my_email(); end if;
    if not new.done then new.done_by := null; end if;
  end if;
  return new;
end $$;

drop policy if exists venues_read on public.venues;
create policy venues_read on public.venues for select to authenticated
  using (public.my_role() in ('owner','admin','manager','maintenance'));

drop policy if exists jobs_team on public.jobs;
create policy jobs_team on public.jobs for all to authenticated
  using (public.my_role() in ('owner','admin','manager','maintenance'))
  with check (public.my_role() in ('owner','admin','manager','maintenance'));

-- Photos: notes/… stays owners-only (Mili's private notes); tasks/… for owners, admins and managers.
drop policy if exists photos_jobs  on storage.objects;
drop policy if exists photos_tasks on storage.objects;
create policy photos_jobs on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','admin','manager','maintenance'))
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'jobs' and public.my_role() in ('owner','admin','manager','maintenance'));
create policy photos_tasks on storage.objects for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = 'tasks' and public.my_role() in ('owner','admin','manager'))
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'tasks' and public.my_role() in ('owner','admin','manager'));

-- Comments: on jobs for the whole team; on notes for whoever can see that note.
drop policy if exists comments_read on public.comments;
drop policy if exists comments_add  on public.comments;
create policy comments_read on public.comments for select to authenticated using (
  (job_id is not null and public.my_role() in ('owner','admin','manager','maintenance'))
  or (note_id is not null and exists (select 1 from public.notes n where n.id = note_id)));
create policy comments_add on public.comments for insert to authenticated with check (
  (job_id is not null and public.my_role() in ('owner','admin','manager','maintenance'))
  or (note_id is not null and exists (select 1 from public.notes n where n.id = note_id)));

-- Inbox: new kinds for tasks.
alter table public.inbox drop constraint if exists inbox_kind_check;
alter table public.inbox add constraint inbox_kind_check check (kind in ('comment','new_job','job_done','task','task_done'));

-- Who hears about a job: owners, admins, maintenance, managers of its area, and whoever added it.
create or replace function public.job_audience(j public.jobs) returns setof text
language sql stable security definer set search_path = public as $$
  select email from public.members where role in ('owner','admin','maintenance')
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
    select * into n from public.notes where id = new.note_id;
    -- owners always; plus the person the task is assigned to and whoever wrote it
    insert into public.inbox(recipient, kind, note_id, actor, preview)
      select a, 'comment', new.note_id, new.author, left(new.body, 140) from (
        select email a from public.members where role = 'owner'
        union select n.assignee union select n.created_by
      ) r where a is not null and a is distinct from new.author;
  end if;
  return new;
end $$;

-- Tasks: the assignee hears when a task is given to them; the writer hears when it is finished.
create or replace function public.inbox_on_note() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.assignee is not null and new.assignee is distinct from coalesce(public.my_email(), new.created_by)
     and (tg_op = 'INSERT' or new.assignee is distinct from old.assignee) then
    insert into public.inbox(recipient, kind, note_id, actor, preview)
      values (new.assignee, 'task', new.id, coalesce(public.my_email(), new.created_by), left(new.text, 140));
  end if;
  if tg_op = 'UPDATE' and new.done and not old.done and new.created_by is distinct from new.done_by and new.created_by is not null then
    insert into public.inbox(recipient, kind, note_id, actor, preview)
      values (new.created_by, 'task_done', new.id, new.done_by, left(new.text, 140));
  end if;
  return new;
end $$;
drop trigger if exists inbox_on_note on public.notes;
create trigger inbox_on_note after insert or update on public.notes for each row execute function public.inbox_on_note();
