-- 009: private comments, for the same managers as private notes (members.private_notes, switched on by an owner).
-- Such a manager can mark a comment Private: only she sees it, and it notifies nobody. Everyone else is unchanged.
-- Additive: one new column with a safe default; the comment read rule and two triggers learn about it.

alter table public.comments add column if not exists private boolean not null default false;

create or replace function public.comment_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then new.private := old.private; return new; end if;
  new.author := public.my_email();
  new.created_at := now();
  if new.private and not (public.my_role() = 'manager'
     and coalesce((select private_notes from public.members where email = public.my_email()), false)) then
    new.private := false;
  end if;
  return new;
end $$;

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select to authenticated using (
  (not private or author = public.my_email())
  and ((job_id is not null and exists (select 1 from public.jobs j where j.id = comments.job_id))
    or (note_id is not null and exists (select 1 from public.notes n where n.id = comments.note_id))));

create or replace function public.inbox_on_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare j public.jobs; n public.notes;
begin
  if new.private then return new; end if;                       -- a private comment tells nobody
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
