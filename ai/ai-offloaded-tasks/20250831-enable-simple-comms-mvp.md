Title: Enable Simple Comms MVP via Supabase MCP (no migrations)
Owner: Offloaded operator (MCP-capable)
When: ASAP

Goal
- Create the single communications table, indexes, view, and RLS directly in the Supabase project via the Supabase MCP server, then confirm the patient app pages render.

Environment
- Supabase project ref: hyufvcwzuaihmyohvwpv
- MCP server name: supabase-scrypto
- QA web app: https://qa.scrypto.online (login: t@t.com / t12345)
- Optional repo reference (docs only): ai/specs/ddl/comm__communications_ddl.md

Steps (do these exactly)
1) Ensure MCP server is online
   - In your MCP client, confirm the server named "supabase-scrypto" is connected.
   - If not present, register it as:
     Command: npx
     Args: -y @supabase/mcp-server-supabase@latest --access-token sbp_... --project-ref hyufvcwzuaihmyohvwpv
     (The access token and project ref are already configured on this machine. Do not rotate.)

2) Open Supabase SQL tool (via MCP)
   - Use the SQL/Query tool provided by the supabase-scrypto server. You should be able to submit raw SQL over MCP.

3) Run this SQL block (one paste)
   - This is idempotent. It creates table, indexes, view, and RLS policies.

   ```sql
   -- Simple Comms MVP — domain-agnostic A→B
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

   create or replace view public.v_comm__communications as
   select *
   from public.comm__communications
   where auth.uid() in (user_from, user_to)
   order by created_at desc;

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
   ```

4) Verify objects (run each SQL and capture outputs)
   - Table: `select to_regclass('public.comm__communications') as table_exists;`
   - View: `select to_regclass('public.v_comm__communications') as view_exists;`
   - Policies: `select pol.polname from pg_policies pol where pol.schemaname='public' and pol.tablename='comm__communications' order by pol.polname;`

5) Optional: insert one sample message (if you know two tester emails)
   - Replace FROM_EMAIL_HERE / TO_EMAIL_HERE with real tester emails.
   ```sql
   with from_user as (
     select id as uid from auth.users where email = 'FROM_EMAIL_HERE' limit 1
   ), to_user as (
     select id as uid from auth.users where email = 'TO_EMAIL_HERE' limit 1
   )
   insert into public.comm__communications (comm_type, user_from, user_to, subject, body)
   select 'message', f.uid, t.uid, 'Test message', 'Hello from MCP!'
   from from_user f, to_user t;
   ```

6) App check (QA site)
   - Login: https://qa.scrypto.online with t@t.com / t12345
   - Open these routes and confirm they load 200:
     - `/patient/comm/inbox` (messages)
     - `/patient/comm/alerts` (alerts)
     - `/patient/comm/notifications` (notifications)
   - If you inserted a message to a tester account, it should appear in Inbox.

7) Report back (reply with)
   - The outputs from Step 4 (table_exists, view_exists, policy list).
   - A brief note: "Inbox/Alerts/Notifications routes opened (200)."
   - If you did Step 5, confirm the message appeared.

Rollback (only if asked)
```sql
drop view if exists public.v_comm__communications;
drop table if exists public.comm__communications cascade;
```

