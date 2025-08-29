# Recommended approach

- **Vertical slices > scattered tasks.** Ship 1 feature end-to-end (DB → API → Hooks → Pages → Tests), then clone the slice.
    
- **No DB procs (for now).** RLS + views are enough. Mark the **DB Proc** column as **N/A** across the sheet. If/when you truly need a server-side transaction, add a tiny stored proc later.
    
- **One SSOT for shapes.** Zod schemas in `/schemas` (DB = API = Zod = Hooks = Pages).
    

---

# Phased plan

## Phase 0 — Foundation (once)

1. **Auth & data plumbing**
    
    - Add `/app/api/auth/callback/route.ts` (cookie sync).
        
    - `lib/supabase/client.tsx` + `server.ts` (getUserOrNull/requireUser).
        
    - `lib/QueryProvider.tsx` and wrap the app.
        
2. **UI patterns**
    
    - Drop in `ConfirmDialog`, `Toast`, `States` and wire them into `ListViewLayout`/`DetailViewLayout`.
        
3. **Nav + structure**
    
    - Shared `NavSidebar` + `config/patientNav.ts` / `config/adminNav.ts`.
        
4. **Standards**
    
    - Create `/schemas` folder; keep snake_case keys.
        
    - Confirm folder structure matches your SSOT (you already have the doc).
        

> ✅ When Phase 0 is done you can implement any feature in a few focused files.

---

## Phase 1 — Pilot vertical slice: **Patient → Medical History → Allergies**

This proves the stack and becomes your template.

**DB**

- `patient__medhist__allergies` (table with `deleted_at`).
    
- `v_patient__medhist__allergies` (view for reads).
    
- RLS: owner-only select/insert/update (user_id = auth.uid()).
    

**Zod**

- `/schemas/allergy.ts`: `Row`, `CreateInput`, `UpdateInput`, `ListQuery`, `ListResponse`.
    

**API**

- `GET/POST /api/patient/medhist/allergies`
    
- `GET/PUT/DELETE /api/patient/medhist/allergies/[allergy_id]` (DELETE = soft delete).
    

**Hooks**

- `/hooks/useAllergies.ts`: keys + list/detail/create/update/delete (callback style).
    

**Pages**

- List (`/patient/medhist/allergies`) with search + pagination.
    
- Create (`/patient/medhist/allergies/new`) using `DetailViewLayout`.
    
- Edit (`/patient/medhist/allergies/[allergy_id]`) with restore banner if `deleted_at`.
    

**Tests**

- API happy paths (list, create, update, delete).
    
- Playwright: list loads, create saves, edit updates, delete confirms → row disappears.
    

> ✅ Update the sheet row to **✅** everywhere (DB Proc = **–**).

---

## Phase 2 — Roll the pattern across **Medical History**

Do these next because they’re structurally identical to allergies:

1. **conditions**
    
2. **immunizations**
    
3. **surgeries**
    
4. **family_hist**
    

For each:

- Duplicate the allergies slice (table/view/RLS → Zod → API → hooks → pages → tests).
    
- Keep the minimal fields; don’t over-model v1.
    
- Mark DB Proc column as **–**.
    

---

## Phase 3 — **Personal Info**

Order of impact:

1. **profile** (single-record detail page)
    
2. **addresses** (list + detail)
    
3. **emergency_contacts** (list + detail)
    
4. **dependents** (list + detail)
    
5. **medical_aid** (single-record)
    
6. **documents** (needs storage)
    

Add storage only for **documents**:

- Supabase bucket `patient_documents`.
    
- RLS: user_id-scoped read/write.
    
- Use your `file-upload-pattern` for the UI + signed URLs.
    

---

## Phase 4 — **Prescriptions & Medications**

Start with the simpler parts; defer scanning/OCR until base data flows are solid.

1. **prescriptions** (list/detail)
    
2. **medications** (list/detail)
    
3. **medications (patient domain)** history/adherence (list/detail)
    
4. **scans** (only after storage is working; create a simple upload + “pending processing” status; OCR can be stubbed at first)
    

---

## Phase 5 — **Communications**

- **alerts**, **notifications**, **messages**: start with list/detail and a single “unread/read” boolean.
    
- Later: background jobs, push delivery, scheduling.
    

---

## Phase 6 — **Vitality** & **Lab Results**

- Model each as time-series lists with a compact detail editor.
    
- Keep initial schemas tiny (`value`, `unit`, `recorded_at`, notes).
    
- Add charts later—don’t block CRUD.
    

---

## Phase 7 — **Admin / Feature Request**

- Straight CRUD (list/detail).
    
- Add a “status” enum and activity log table if needed.
    
- Gate with admin role in RLS policies.
    

---

# Definition of Done (per row in your table)

Mark a cell ✅ only when all criteria below are true:

**DB Table**

- Table created with primary key, `user_id`, timestamps, `deleted_at` nullable.
    
- RLS enabled; policies restrict to `auth.uid()`.
    

**DB View**

- `v_<domain>__<group>__<item>` reading from the table and (optionally) filtering out `deleted_at IS NOT NULL` (or do that in queries).
    

**DB Proc**

- **N/A** for core CRUD (use RLS + views). Use only if you need multi-table transactions.
    

**API**

- Route handlers exist for list/detail + create/update/delete.
    
- All inputs validated by Zod; responses shaped as Zod Row/ListResponse.
    

**Hooks**

- One hooks file with keys + 5 hooks (list/detail/create/update/delete).
    
- Mutations use callbacks; invalidate on success.
    

**Zod**

- Row/Create/Update/ListQuery/ListResponse with snake_case keys matching DB.
    

**Page**

- List page with search + pagination; Detail page(s) using `DetailViewLayout`; Delete uses confirm + toast; Restore banner if soft-deleted.
    

**Tests**

- API happy paths + Playwright e2e for list/create/edit/delete.
    
- Screenshots saved under `ai/testing/screenshots/...`.
    

---

# Exact order I’d ship (from your sheet)

1. **Foundation (Phase 0)**
    
2. **patient → medhist → allergies** (Phase 1 pilot)
    
3. **patient → medhist → conditions, immunizations, surgeries, family_hist**
    
4. **patient → persinfo → profile, addresses, emergency_contacts, dependents, medical_aid, documents (with storage)**
    
5. **patient → presc → prescriptions, medications, scans** (scans last)
    
6. **patient → medications → history, adherence**
    
7. **patient → comm → alerts, notifications, messages**
    
8. **patient → labresults → results**
    
9. **patient → vitality → vital_signs, body_measure, activity, sleep, nutrition, mental, reproductive**
    
10. **admin → feature → request**
    

---

## Tiny migration templates (copy/paste & adapt)

**Table**

```sql
-- supabase/migrations/XXXX_allergies.sql
create table if not exists public.patient__medhist__allergies (
  allergy_id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  allergen text not null,
  severity text not null check (severity in ('mild','moderate','severe')),
  reaction text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

alter table public.patient__medhist__allergies enable row level security;

create policy "owner_read_allergies"
  on public.patient__medhist__allergies for select
  using (user_id = auth.uid());

create policy "owner_write_allergies"
  on public.patient__medhist__allergies for insert
  with check (user_id = auth.uid());

create policy "owner_update_allergies"
  on public.patient__medhist__allergies for update
  using (user_id = auth.uid());
```

**View**

```sql
create or replace view public.v_patient__medhist__allergies as
  select *
  from public.patient__medhist__allergies
  where deleted_at is null;
```

> You can filter `deleted_at` in API instead of the view if you prefer. RLS still applies.

---

## Sheet tweaks (quality of life)

- Change **DB Proc** cells to **–** for all rows (unless you truly require a proc).
    
- Add a **“Notes”** column (optional) to record quirks per item (“needs storage”, “single-record only”, “has enum”).
    

---
