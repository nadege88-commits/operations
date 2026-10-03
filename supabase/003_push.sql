-- 003: push notifications. Only ADDS to the database; the current app keeps working.

-- Each person's on/off switch, and when we last sent them a push (for the 10-minute bundling).
alter table public.members add column if not exists push_enabled boolean not null default true;
alter table public.members add column if not exists last_push_at timestamptz;

-- One row per phone/browser that allowed notifications.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  email text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists push_own_read on public.push_subscriptions;
create policy push_own_read on public.push_subscriptions for select to authenticated using (email = public.my_email());

-- Phones register and unregister through these, always under the signed-in person's own email.
create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text)
returns void language sql security definer set search_path = public as $$
  insert into public.push_subscriptions(endpoint, email, p256dh, auth, user_agent)
  select p_endpoint, public.my_email(), p_p256dh, p_auth, left(p_user_agent, 300) where public.my_role() is not null
  on conflict (endpoint) do update set email = excluded.email, p256dh = excluded.p256dh, auth = excluded.auth,
    user_agent = excluded.user_agent, created_at = now()
$$;
create or replace function public.remove_push_subscription(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and email = public.my_email()
$$;
create or replace function public.set_my_push(enabled boolean) returns void
language sql security definer set search_path = public as $$
  update public.members set push_enabled = enabled where email = public.my_email()
$$;

-- Timers for the sender (the schedule itself is added once the sender is deployed).
create extension if not exists pg_cron;
create extension if not exists pg_net;
