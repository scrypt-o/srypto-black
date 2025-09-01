# DDL — comm__communications (MVP Simple)

Date: 2025-08-31
Status: Draft (MVP, simple A→B)

## Table
```sql
create table if not exists comm__communications (
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
```

## Indexes
```sql
create index if not exists idx_comm__communications_user_to_created_at
  on comm__communications (user_to, created_at desc);
create index if not exists idx_comm__communications_user_from_created_at
  on comm__communications (user_from, created_at desc);
```

## View (user-scoped inbox/feed)
```sql
create or replace view v_comm__communications as
select *
from comm__communications
where auth.uid() in (user_from, user_to)
order by created_at desc;
```

## RLS
```sql
alter table comm__communications enable row level security;

-- Read own messages (sender or recipient)
create policy comm_read_own on comm__communications
  for select using (auth.uid() in (user_from, user_to));

-- Sender can insert
create policy comm_insert_sender on comm__communications
  for insert with check (auth.uid() = user_from);

-- Recipient can mark read (update read_at, status)
create policy comm_update_recipient on comm__communications
  for update using (auth.uid() = user_to)
  with check (auth.uid() = user_to);
```

## Notes
- Updated_at: add trigger if needed later; not required for MVP.
- Identifier resolution (email→uuid) happens in API layer, not stored here.
- No delete for MVP; add soft delete later if needed.

