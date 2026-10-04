-- 005: only owners can permanently delete maintenance jobs (everyone else can still add, edit and comment;
-- maintenance can still finish and soft-delete). Comments and inbox entries go with the job automatically.
drop policy if exists jobs_team   on public.jobs;
drop policy if exists jobs_read   on public.jobs;
drop policy if exists jobs_add    on public.jobs;
drop policy if exists jobs_change on public.jobs;
drop policy if exists jobs_remove on public.jobs;
create policy jobs_read   on public.jobs for select to authenticated using (public.my_role() in ('owner','admin','manager','maintenance'));
create policy jobs_add    on public.jobs for insert to authenticated with check (public.my_role() in ('owner','admin','manager','maintenance'));
create policy jobs_change on public.jobs for update to authenticated
  using (public.my_role() in ('owner','admin','manager','maintenance')) with check (public.my_role() in ('owner','admin','manager','maintenance'));
create policy jobs_remove on public.jobs for delete to authenticated using (public.my_role() = 'owner');
