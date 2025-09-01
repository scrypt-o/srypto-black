# Communications — MVP Simple (Domain‑Agnostic A→B)

Date: 2025-08-31
Status: Approved for implementation (MVP)
Scope: Patient + Pharmacy (shared)

## Objective
- Two aspects only:
  1) Can A send to B? (A/B can be any user: patient, pharmacist, staff.)
  2) Single communications table with types (message|alert|notification) and standard timestamps.
- Non‑realtime (manual Refresh OK; optional light polling on inbox).
- UI should look production‑grade; backend intentionally minimal and replaceable later.

## Model (single table)
- Table: `comm__communications`
  - `comm_id uuid pk`
  - `comm_type text` in ('message','alert','notification')
  - `user_from uuid not null` (auth.users.id)
  - `user_to uuid not null` (auth.users.id)
  - `subject text` (nullable)
  - `body text` (nullable)
  - `status text default 'sent'` (sent|read)
  - `read_at timestamptz` (nullable)
  - `meta jsonb` (nullable)
  - `created_at timestamptz default now()`
  - `updated_at timestamptz` (optional trigger)

Notes
- Domain‑agnostic: no patient/pharmacy foreign keys required for MVP.
- Identifier strategy: API accepts `to` as email or `user_id`; resolves to `user_to` uuid before insert.
- No links/threads in MVP (keep it simple; add later if required).

## Views (SSR‑first)
- `v_comm__communications` (user‑scoped inbox/feed)
  - WHERE `auth.uid()` IN (`user_from`,`user_to`)
  - Optional filter by `comm_type` for tabbed views

(Optional convenience views if needed by routers)
- `v_patient__comm__communications` and `v_pharmacy__comm__communications` may project the same rows for each app area; both select from `comm__communications` with identical ownership filter.

## RLS (security)
- Enable RLS on `comm__communications`.
- SELECT: `auth.uid()` IN (`user_from`,`user_to`).
- INSERT: `auth.uid()` = `user_from`.
- UPDATE: Only recipient can set `read_at` and change `status` to 'read'.
- No DELETE (soft‑delete not required in MVP).

## APIs (minimal)
Base: `/api/comm`

- `POST /send`
  - Input: `{ to: string (email|uuid), type: 'message'|'alert'|'notification', subject?: string, body?: string }`
  - Resolve `to` → `user_to` (must exist). Insert row with `user_from=auth.uid()`.
  - Return 201 with created record id and timestamps.

- `GET /inbox?type=<type>&page=&pageSize=`
  - Read from `v_comm__communications` filtered by optional `type`.
  - Sort `created_at desc`.

- `GET /with/<user_id>?page=&pageSize=`
  - Conversation (messages only): rows where `comm_type='message'` and
    - (`user_from=auth.uid()` AND `user_to=<user_id>`) OR (`user_from=<user_id>` AND `user_to=auth.uid()`)

- `POST /read/<comm_id>`
  - Recipient marks read: sets `read_at=now()`, `status='read'`.

- `POST /notify`
  - System‑initiated alert/notification: `{ to: email|uuid, type: 'alert'|'notification', subject?: string, body?: string }`
  - Protected by service token or server‑only execution.

Validation (Zod)
- Enum for `type`, max lengths, non‑empty body for `message` types.

## UI (non‑realtime)
- Patient
  - `/patient/comm` → inbox (tabs: Messages, Alerts, Notifications), Refresh button, unread badges.
  - `/patient/comm/messages/[with]` → conversation A↔B, compose box (subject optional), Send.
- Pharmacy
  - `/pharmacy/comm` with the same UX; conversations open `/pharmacy/comm/messages/[with]`.
- Optional light polling (2–5s) on inbox; otherwise manual Refresh.

## Testing
- API unit tests: send (email→uuid resolve), inbox filter by type, conversation, read.
- E2E: User A sends to B; B sees in inbox after refresh; B marks read.
- Screens: desktop + mobile screenshots stored under `ai/testing/screenshots/`.

## Migration path (later)
- Add threads (`comm__threads`) if multi‑party or context linking (prescriptions/quotes) is needed.
- Add links (`comm__links`) for permission gating.
- Add attachments table and storage bucket.
- Swap to an external messaging framework; keep API contracts stable.

*** End of MVP ***
