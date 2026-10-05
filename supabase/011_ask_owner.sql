-- 011: a manager can ask Mili for something. When a manager adds a task in one of her areas she may give it to an
-- owner instead of herself; the owner sees it under "For me" and gets the usual "task" inbox entry (004's trigger).
-- Additive: only note_stamp() changes, and only for a manager's INSERT. Everything else is exactly 008.

create or replace function public.note_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
declare may_private boolean := public.my_role() = 'manager'
  and coalesce((select private_notes from public.members where email = public.my_email()), false);
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(public.my_email(), new.created_by);
    -- A manager's task is her own, unless she is asking an owner for it.
    if public.my_role() = 'manager'
       and not exists (select 1 from public.members where email = new.assignee and role = 'owner') then
      new.assignee := public.my_email();
    end if;
    if public.my_role() = 'admin' then new.done := false; new.deleted := false; end if;
    if new.done then new.done_by := new.created_by; end if;
    if not may_private then new.private := false; end if;
    -- A request to an owner is never private: the owner has to see it.
    if new.assignee is distinct from public.my_email() and public.my_role() = 'manager' then new.private := false; end if;
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
    -- …and a request stays visible to the owner it was given to.
    if public.my_role() = 'manager' and old.assignee is distinct from public.my_email() then new.private := old.private; end if;
  end if;
  return new;
end $$;
