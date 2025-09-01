# Communications — v1 (Non‑Realtime, SSR-first)

Date: 2025-08-31
Status: Approved for implementation
Owners: Patient domain

## Goals
- Let patients send/receive simple messages.
- Central table for messages/alerts/notifications/reminders.
- Simple permission: link (pending → accepted) gates who can message whom.
- SSR reads from views; TanStack for mutations.

## Data Model (DDL sketch)
Tables (snake_case; soft delete via is_active optional later):

- `patient__comm__communications`
  - `comm_id uuid pk`
  - `comm_type text check (in 'message','alert','notification','reminder')`
  - `user_from uuid not null`
  - `user_to uuid not null`
  - `subject text` (nullable)
  - `body text` (nullable)
  - `status text default 'sent'` (sent/received/read)
  - `read_at timestamptz` (nullable)
  - `meta jsonb` (nullable)
  - `created_at timestamptz default now()`
  - `updated_at timestamptz`

- `patient__comm__links`
  - `link_id uuid pk`
  - `requester_id uuid not null`
  - `recipient_id uuid not null`
  - `status text default 'pending'` (pending/accepted/rejected/blocked)
  - `created_at timestamptz default now()`
  - `updated_at timestamptz`

Views (RLS-friendly reads):
- `v_patient__comm__messages` → WHERE comm_type='message' AND (user_from=auth.uid() OR user_to=auth.uid())
- `v_patient__comm__alerts` → comm_type='alert' + same ownership filter
- `v_patient__comm__notifications` → comm_type='notification' + same filter
- `v_patient__comm__reminders` → comm_type='reminder' + same filter

RLS (high level):
- communications:
  - SELECT: `auth.uid() IN (user_from,user_to)`
  - INSERT: `auth.uid() = user_from`
  - UPDATE: only recipient may set `read_at`; sender cannot modify after send
- links:
  - SELECT: `auth.uid() IN (requester_id,recipient_id)`
  - INSERT: `auth.uid() = requester_id`
  - UPDATE: recipient can accept/reject; requester can cancel

## API (Next Route Handlers; CSRF + auth + Zod)

Base path: `/api/patient/comm`

1) `GET /users` — list potential recipients (for now, all users)
   - Output: `{ users: Array<{ id, name, email? }> }`

2) `POST /links` — request permission to message
   - Input: `{ recipient_id: uuid }`
   - If link exists and accepted → 200 no-op; if pending → 200; else create pending.

3) `POST /links/[id]/accept` | `/reject` | `/block`
   - Recipient transitions status.

4) `POST /messages` — send message (comm_type='message')
   - Input: `{ user_to: uuid, subject?: string, body: string }`
   - If link accepted → insert message (201)
   - Else → create pending link (if none) and insert a notification to recipient: 202 `{ action: 'request_sent' }`

5) `GET /messages?with=<user_id>&page=..&pageSize=..` — list conversation

6) `POST /messages/[id]/read` — mark as read (recipient only)

7) `GET /alerts` | `/notifications` | `/reminders` — list respective comms

Error semantics: 401 (unauth), 403 (CSRF), 422 (Zod), 429 (rate limit optional), 500 (unexpected).

## Zod Schemas
```ts
export const CommTypeEnum = z.enum(['message','alert','notification','reminder'])
export const MessageCreateSchema = z.object({
  user_to: z.string().uuid(),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
})
export const LinkCreateSchema = z.object({ recipient_id: z.string().uuid() })
```

## Pages (SSR-first)

- `/patient/comm` (hub tiles): Messages, Alerts, Notifications, Reminders
- `/patient/comm/messages` (list + compose)
  - Server fetch initial list from `v_patient__comm__messages`
  - Compose (client): To (users GET), Subject, Body → POST /messages
- `/patient/comm/messages/[user_id]` (conversation)
  - Server preloads recent items; client can paginate with TanStack (optional)
- `/patient/comm/alerts` | `/notifications` | `/reminders`
  - Server list via views; mark read via POST

## TanStack Usage (where it is)

- Mutations (client):
  - `useRequestLink` → POST /links
  - `useAcceptLink` / `useRejectLink`
  - `useSendMessage` → POST /messages
  - `useMarkRead` → POST /messages/[id]/read

- Queries (optional client-side):
  - `useConversation(withUser)` using `useInfiniteQuery` for lazy pagination
  - SSR provides initialData to hydrate; query key e.g. `['comm','conv',withUser]`

Patterns:
- SSR reads from views; pass `initialData`
- Client actions use TanStack `useMutation` + invalidate queries (`['comm']` / `['comm','conv',withUser]`)

## Testing
- Unit (API): links create/accept/reject, messages send (accepted vs pending), ownership + CSRF
- E2E: user A → send to B w/o link → request-sent; user B accepts; A sends again → message appears for both

## Future (not in v1)
- Realtime (Supabase Realtime or WebSockets)
- Attachments (table + storage bucket)
- Role-aware directories and exposure policies
- Outbound channels (email/SMS/push) for alerts/reminders

