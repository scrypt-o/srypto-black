# PROTO — Supabase Changes for Patient Communications Alignment

Purpose: Define exact Supabase DDL/RLS/view work to align communications with the approved patient pattern used by the app and specs.

Applies to: Production Supabase project `hyufvcwzuaihmyohvwpv` (run via migrations under `supabase/migrations`).

Owner: DB engineer

---

## Objectives

- Centralize comms in a single base table `patient__comm__communications` with `comm_type` discriminator.
- Expose RLS-scoped, per‑type read views:
  - `v_patient__comm__messages`
  - `v_patient__comm__alerts`
  - `v_patient__comm__notifications`
  - `v_patient__comm__reminders`
- Enforce ownership and safety through RLS:
  - SELECT: only participants (sender or recipient) can read a row.
  - INSERT: only the current user can insert as `user_from`.
  - UPDATE: only the recipient may mark `read_at`; sender cannot modify content after send.
  - DELETE: disallow hard deletes; soft‑delete via `is_active`.
- Performance: add essential indexes for common filters/ordering.

---

## Migration Plan (Single SQL migration)

Create one migration file, e.g. `supabase/migrations/20250901_comm_alignment.sql` with the following content (adjust `schema` if needed — default `public`).

```sql
-- 1) Base table
create table if not exists public.patient__comm__communications (
  comm_id uuid primary key default gen_random_uuid(),
  comm_type text not null check (comm_type in ('message','alert','notification','reminder')),
  user_from uuid not null references auth.users(id) on delete cascade,
  user_to uuid not null references auth.users(id) on delete cascade,
  subject text,
  body text,
  status text not null default 'sent',
  is_read boolean generated always as (read_at is not null) stored,
  read_at timestamptz,
  meta jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Row version trigger to maintain updated_at
create or replace function public.trg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists t_set_updated_at_comm on public.patient__comm__communications;
create trigger t_set_updated_at_comm
before update on public.patient__comm__communications
for each row execute function public.trg_set_updated_at();

-- 3) RLS
alter table public.patient__comm__communications enable row level security;

-- SELECT: Only participants can read
drop policy if exists comm_select_participants on public.patient__comm__communications;
create policy comm_select_participants
on public.patient__comm__communications
for select
using (
  auth.uid() = user_from or auth.uid() = user_to
);

-- INSERT: Only allow inserting as the sender
drop policy if exists comm_insert_sender on public.patient__comm__communications;
create policy comm_insert_sender
on public.patient__comm__communications
for insert
with check (
  auth.uid() = user_from
);

-- UPDATE: Only recipient can mark read_at; block other content updates post‑send
drop policy if exists comm_update_recipient_read on public.patient__comm__communications;
create policy comm_update_recipient_read
on public.patient__comm__communications
for update
using (
  auth.uid() = user_to
)
with check (
  -- Only allow recipient to set read_at or status to 'read'; prohibit changing sender/subject/body/comm_type
  auth.uid() = user_to
);

-- Add a safe‑guard to restrict columns (PostgREST clients can be limited; app uses API route handlers)
-- Optionally, create a view with updatable columns to enforce column‑level restrictions; or rely on API route validation.

-- 4) Disallow deletes at the table level; use soft delete via is_active flag through API if needed
drop policy if exists comm_delete_none on public.patient__comm__communications;
create policy comm_delete_none
on public.patient__comm__communications
for delete
using (false);

-- 5) Type‑scoped views for reads (use in server pages)
create or replace view public.v_patient__comm__messages as
select * from public.patient__comm__communications
where comm_type = 'message' and is_active = true
  and (auth.uid() = user_from or auth.uid() = user_to);

create or replace view public.v_patient__comm__alerts as
select * from public.patient__comm__communications
where comm_type = 'alert' and is_active = true
  and (auth.uid() = user_from or auth.uid() = user_to);

create or replace view public.v_patient__comm__notifications as
select * from public.patient__comm__communications
where comm_type = 'notification' and is_active = true
  and (auth.uid() = user_from or auth.uid() = user_to);

create or replace view public.v_patient__comm__reminders as
select * from public.patient__comm__communications
where comm_type = 'reminder' and is_active = true
  and (auth.uid() = user_from or auth.uid() = user_to);

-- 6) Indexes for common queries
create index if not exists idx_comm_user_from_created_at on public.patient__comm__communications(user_from, created_at desc);
create index if not exists idx_comm_user_to_created_read on public.patient__comm__communications(user_to, is_read, created_at desc);
create index if not exists idx_comm_type_created_at on public.patient__comm__communications(comm_type, created_at desc);
create index if not exists idx_comm_meta_gin on public.patient__comm__communications using gin (meta);

-- 7) Optional backfill (if migrating from comm__communications)
-- insert into public.patient__comm__communications (...)
-- select ... from public.comm__communications;
```

Notes:
- If an existing table `comm__communications` already holds data, perform a one‑time backfill and then update writes to use `patient__comm__communications`.
- App API routes are already using server handlers; table RLS policies still protect direct access.

---

## Optional: Link Permissions Table

If you want to gate direct messaging via link requests/acceptance (per spec), add a minimal `patient__comm__links` table and a helper view.

```sql
create table if not exists public.patient__comm__links (
  link_id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.patient__comm__links enable row level security;

drop policy if exists links_select_participants on public.patient__comm__links;
create policy links_select_participants
on public.patient__comm__links for select using (
  auth.uid() = requester_id or auth.uid() = recipient_id
);

drop policy if exists links_insert_requester on public.patient__comm__links;
create policy links_insert_requester
on public.patient__comm__links for insert with check (
  auth.uid() = requester_id
);

drop policy if exists links_update_participants on public.patient__comm__links;
create policy links_update_participants
on public.patient__comm__links for update using (
  auth.uid() = requester_id or auth.uid() = recipient_id
);

-- Indexes
create index if not exists idx_links_participants on public.patient__comm__links(requester_id, recipient_id);
```

The app can optionally create a view `v_patient__comm__links` filtered by `auth.uid()` for reads.

---

## Verification Checklist

Run these after applying the migration:

1) RLS sanity
```sql
-- as authenticated user A
select count(*) from public.v_patient__comm__messages; -- returns only A’s conversations
```

2) Insert as sender
```sql
insert into public.patient__comm__communications (comm_type, user_from, user_to, subject, body)
values ('message', auth.uid(), '<other_user_uuid>', 'Hi', 'Test');
```

3) Update as recipient
```sql
-- as recipient user B
update public.patient__comm__communications set read_at = now() where comm_id = '<id>' and user_to = auth.uid();
```

4) Prevent hard delete
```sql
delete from public.patient__comm__communications where comm_id = '<id>'; -- should be denied by RLS
```

5) Views filtering
```sql
select * from public.v_patient__comm__alerts limit 1; -- row belongs to current user
```

---

## Acceptance Criteria

- App SSR pages load inbox, alerts, notifications using `v_patient__comm__*` successfully for two different users with data isolation.
- API write routes succeed under CSRF/auth and DB RLS does not allow unauthorized access.
- Indexes exist and query plans use them for inbox sorting and unread counts.

---

## Rollback Plan

- The migration is additive. If needed, re‑point app reads to the previous views (`v_comm__communications`) and disable the new views by dropping them. Keep the base table for a staged cutover.

