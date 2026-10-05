-- 010: people can delete their own inbox entries (swipe left in the Inbox). Only their own; nothing else changes.
drop policy if exists inbox_delete_mine on public.inbox;
create policy inbox_delete_mine on public.inbox for delete to authenticated using (recipient = public.my_email());
