-- 006: invites and fixing a mistyped email. Additive: two new functions, nothing existing changes.
-- Safe on a project without the Team (HR) app: its tables are only touched when they exist.

-- Who on the team has set up their account (has a login), for the "Not set up yet" marker. Owners only.
create or replace function public.team_setup() returns table(email text, set_up boolean)
language sql stable security definer set search_path = public as $$
  select m.email, exists (select 1 from auth.users u where lower(u.email) = m.email)
  from public.members m where public.my_role() = 'owner'
$$;
revoke all on function public.team_setup() from public, anon;
grant execute on function public.team_setup() to authenticated;

-- Change a person's email everywhere it is used: the team list, their tasks, comments and inbox, the Team app,
-- and their login if they already set one up (same password, new email). Owners only; not on yourself or another owner.
create or replace function public.change_member_email(p_old text, p_new text) returns void
language plpgsql security definer set search_path = public as $$
declare o text := lower(trim(p_old)); n text := lower(trim(p_new)); target text; uid uuid; c record;
begin
  if public.my_role() is distinct from 'owner' then raise exception 'Only an owner can do this.' using errcode = '42501'; end if;
  if n !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'Enter a valid email address.'; end if;
  if o = n then return; end if;
  select role into target from public.members where email = o;
  if target is null then raise exception 'That person is not on the team.'; end if;
  if target = 'owner' or o = public.my_email() then raise exception 'An owner''s email cannot be changed here.'; end if;
  if exists (select 1 from public.members where email = n) then raise exception 'That email is already on the team.'; end if;

  select id into uid from auth.users where lower(email) = o;
  if uid is not null then
    if exists (select 1 from auth.users where lower(email) = n) then
      raise exception 'Someone has already set up an account with that email.';
    end if;
    update auth.users set email = n, updated_at = now() where id = uid;
    update auth.identities set identity_data = jsonb_set(identity_data, '{email}', to_jsonb(n)), updated_at = now()
      where user_id = uid and provider = 'email';
  end if;

  update public.members set email = n where email = o;
  update public.notes    set assignee   = n where assignee   = o;
  update public.notes    set created_by = n where created_by = o;
  update public.notes    set done_by    = n where done_by    = o;
  update public.jobs     set created_by = n where created_by = o;
  update public.jobs     set done_by    = n where done_by    = o;
  update public.comments set author     = n where author     = o;
  update public.inbox    set recipient  = n where recipient  = o;
  update public.inbox    set actor      = n where actor      = o;
  update public.push_subscriptions set email = n where email = o;

  -- The Team (HR) app, when it is on this project. hr_people's email carries shifts and leave along (on update cascade).
  if to_regclass('public.hr_people') is not null then
    execute 'update public.hr_people set email = $2 where email = $1 and not exists (select 1 from public.hr_people where email = $2)' using o, n;
    for c in select * from (values ('hr_inbox','recipient'), ('hr_leave','decided_by'), ('hr_shifts','edited_by'), ('hr_shifts','deleted_by'),
                                   ('hr_push_subscriptions','email'), ('hr_networks','created_by')) v(t, col) loop
      if to_regclass('public.' || c.t) is not null then
        execute format('update public.%I set %I = $2 where %I = $1', c.t, c.col, c.col) using o, n;
      end if;
    end loop;
  end if;
end $$;
revoke all on function public.change_member_email(text, text) from public, anon;
grant execute on function public.change_member_email(text, text) to authenticated;
