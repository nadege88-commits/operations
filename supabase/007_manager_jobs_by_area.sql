-- 007: managers only see maintenance jobs for their own areas, jobs marked "All areas", and jobs they added themselves.
-- Owners, admins and maintenance still see every job. Comments on a job follow the job. Live updates follow the same rule.
-- Replaces the read/change rules on jobs and the read rule on comments; no data changes.

create or replace function public.can_see_job(j public.jobs) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.my_role()
    when 'owner' then true
    when 'admin' then true
    when 'maintenance' then true
    when 'manager' then coalesce(j.all_venues, false)
                        or j.created_by = public.my_email()
                        or coalesce(j.venue_ids && (select venue_ids from public.members where email = public.my_email()), false)
    else false end
$$;
revoke all on function public.can_see_job(public.jobs) from public, anon;
grant execute on function public.can_see_job(public.jobs) to authenticated;

drop policy if exists jobs_read on public.jobs;
create policy jobs_read on public.jobs for select to authenticated using (public.can_see_job(jobs.*));

drop policy if exists jobs_change on public.jobs;
create policy jobs_change on public.jobs for update to authenticated
  using (public.can_see_job(jobs.*))
  with check (public.my_role() = any (array['owner','admin','manager','maintenance']));

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select to authenticated using (
  (job_id is not null and exists (select 1 from public.jobs j where j.id = comments.job_id))
  or (note_id is not null and exists (select 1 from public.notes n where n.id = comments.note_id)));

drop policy if exists comments_add on public.comments;
create policy comments_add on public.comments for insert to authenticated with check (
  (job_id is not null and exists (select 1 from public.jobs j where j.id = comments.job_id))
  or (note_id is not null and exists (select 1 from public.notes n where n.id = comments.note_id)));
