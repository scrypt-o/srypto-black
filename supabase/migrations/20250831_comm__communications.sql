-- Simple Comms MVP — A→B domain-agnostic communications
-- Creates table, indexes, view, and RLS policies.

create table if not exists public.comm__communications (
  comm_id uuid primary key default gen_random_uuid(),
  comm_type text not null check (comm_type in ('message','alert','notification')),
  user_from uuid not null references auth.users(id) on delete restrict,
  user_to uuid not null references auth.users(id) on delete restrict,
  subject text,
  body text,
  status text not null default 'sent' check (status in ('sent','read')),
  read_at timestamptz,
  meta jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists idx_comm__communications_user_to_created_at
  on public.comm__communications (user_to, created_at desc);
create index if not exists idx_comm__communications_user_from_created_at
  on public.comm__communications (user_from, created_at desc);

-- View: user-scoped inbox/feed
create or replace view public.v_comm__communications as
select *
from public.comm__communications
where auth.uid() in (user_from, user_to)
order by created_at desc;

-- RLS
alter table public.comm__communications enable row level security;

do $$ begin
  create policy comm_read_own on public.comm__communications
    for select using (auth.uid() in (user_from, user_to));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy comm_insert_sender on public.comm__communications
    for insert with check (auth.uid() = user_from);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy comm_update_recipient on public.comm__communications
    for update using (auth.uid() = user_to)
    with check (auth.uid() = user_to);
exception when duplicate_object then null; end $$;

