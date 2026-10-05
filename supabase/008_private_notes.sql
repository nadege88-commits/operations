-- 008: private notes for chosen managers. An owner turns on "Private notes" for a manager in Settings → People; that
-- manager can then mark a note Private, and only she sees it (not owners, not admins). Comments on it notify nobody else.
-- Additive: two new columns with safe defaults; the note read rule and two triggers learn about private notes.

alter table public.members add column if not exists private_notes boolean not null default false;
alter table public.notes   add column if not exists private boolean not null default false;

-- Who sees a note: a private note only its writer; everything else as before.
create or replace function public.can_see_note(n public.notes) returns boolean
language sql stable security definer set search_path = public as $$
  select case when coalesce(n.private, false) then n.created_by = public.my_email()
  else case public.my_role()
    when 'owner'   then true
    when 'admin'   then n.assignee is not null
                        or (n.created_by is not null and n.created_by not in (select email from public.members where role = 'owner'))
    when 'manager' then n.assignee = public.my_email() or n.created_by = public.my_email()
    else false end
  end
$$;

-- Only a manager with private notes switched on can make her own note private (or public again).
create or replace function public.note_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
declare may_private boolean := public.my_role() = 'manager'
  and coalesce((select private_notes from public.members where email = public.my_email()), false);
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(public.my_email(), new.created_by);
    if public.my_role() = 'manager' then new.assignee := public.my_email(); end if;
    if public.my_role() = 'admin' then new.done := false; new.deleted := false; end if;
    if new.done then new.done_by := new.created_by; end if;
    if not may_private then new.private := false; end if;
  else
    new.created_by := old.created_by;
    if public.my_role() = 'admin'
       and (new.done is distinct from old.done or new.deleted is distinct from old.deleted) then
      raise exception 'Admins cannot finish or delete tasks' using errcode = '42501';
    end if;
    if public.my_role() = 'manager' then new.assignee := old.assignee; end if;
    if new.done and not old.done then new.done_by := public.my_email(); end if;
    if not new.done then new.done_by := null; end if;
    if new.private is distinct from old.private and not (may_private and old.created_by = public.my_email()) then
      new.private := old.private;
    end if;
  end if;
  return new;
end $$;

-- Comments: a private note tells nobody (only its writer can comment on it anyway).
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
    if coalesce(n.private, false) then return new; end if;
    -- owners always; plus the person the task is assigned to and whoever wrote it
    insert into public.inbox(recipient, kind, note_id, actor, preview)
      select a, 'comment', new.note_id, new.author, left(new.body, 140) from (
        select email a from public.members where role = 'owner'
        union select n.assignee union select n.created_by
      ) r where a is not null and a is distinct from new.author;
  end if;
  return new;
end $$;
