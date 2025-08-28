# Scrypto – High‑Level Overview (Patterns Summary)

**Updated:** August 25, 2025  
**Audience:** PMs, engineers, and AI agents  
**Goal:** One-page(ish) orientation to the whole system: what patterns we use, where things live, and how features get built.

---

## 1) Architecture in one glance

**Stack:** Next.js (App Router) + Supabase (Postgres, Auth, Storage) + TanStack Query + Zod + Tailwind.  
**Philosophy:** Small, repeatable patterns; one obvious way to do everything.

```
Browser (UX) ──> Pages (compose)
                 │
                 ▼
             Hooks (fetch/mutate via API)
                 │
                 ▼
          API (Zod-validated handlers; RLS-safe)
                 │
                 ▼
      Supabase (Views for reads, Tables for writes, RLS)
```

---

## 2) Folder map (where things live)

- **ai/specs/** — Single source of truth for patterns & guides (Auth, List/Detail, TileGrid, CRUD).
    
- **app/** — Routes & pages. Pages compose patterns + hooks; API handlers live under `app/api/*`.
    
- **components/** — Pure UI: `layouts/` (TileGrid, ListView, DetailView) and `patterns/` (ConfirmDialog, Toast, States). No fetching.
    
- **config/** — Static data like nav trees (patient/admin) used by sidebars.
    
- **hooks/** — One file per entity, exporting 5 hooks + keys (list/detail/create/update/delete).
    
- **lib/supabase/** — Auth clients: `client.tsx` (browser + AuthProvider) and `server.ts` (cookies + helpers).
    
- **schemas/** — Zod = SSOT for shapes (Row, Create, Update, ListQuery, ListResponse). Keys are snake_case.
    
- **supabase/** — SQL migrations, views, RLS policies, optional RPC functions.
    

---

## 3) Core patterns (what to use)

### A) Authentication

- **Split:** Client (UX + `AuthProvider`) / Server (cookies via object‑spread setter) / API (`requireUser`).
    
- **Sync:** Client posts session changes to `/api/auth/callback` → server sets/clears cookies.
    
- **RSC:** Use `getUserOrNull()` to protect pages; redirect unauthenticated.
    

### B) API (CRUD‑first, RPC‑optional)

- **Default:** CRUD to tables/views; soft delete sets `is_active = false` (never hard‑delete).
    
- **Optional:** Flip to `supabase.rpc('fn_<domain>__<group>__<item>__verb')` for atomic multi‑table logic—inputs/outputs still match the same Zod.
    
- **Errors:** `{ error: string, code?: string }`. **List** query: `?page&pageSize&search`.
    

### C) Data contracts (Zod = SSOT)

- Keep **DB = API = Zod = Hooks = Pages** field names identical, in **snake_case**.
    
- Every entity ships: `Row`, `CreateInput`, `UpdateInput`, `ListQuery`, `ListResponse`.
    

### D) Hooks (TanStack Query)

- One file per entity, exports: `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`, plus `XKeys`.
    
- Mutations use callbacks (`onSuccess/onError`), not `mutateAsync`, and invalidate relevant keys.
    

### E) UI patterns

- **TileGridLayout** — dashboard / navigation tiles.
    
- **ListViewLayout** — searchable, paginated tables (server‑driven). Slots for Empty/Error/Skeleton.
    
- **DetailViewLayout** — single‑record forms with sticky actions; integrates ConfirmDialog & Toast.
    
- **ConfirmDialog / Toast / States** — standard safety & feedback primitives.
    

### F) Database & RLS

- Reads via `v_<domain>__<group>__<item>` views; writes to `<domain>__<group>__<item>` tables.
    
- RLS policies enforce tenant/user isolation (`user_id = auth.uid()`).
    
- **Soft delete** everywhere via `is_active` boolean. Views filter where `is_active = true`.
    

### G) Files / uploads (when needed)

- Supabase Storage buckets per domain; signed URLs; RLS for object paths bound to `user_id`.
    
- Use the `file-upload-pattern` UI for consistent UX.
    

---

## 4) Naming & conventions

- **Pathing:** `/patient/<group>/<item>` (e.g., `/patient/medhist/allergies`).
    
- **DB objects:** `domain__group__item` (tables) and `v_domain__group__item` (views). Optional RPC: `fn_domain__group__item__verb`.
    
- **Fields:** snake_case end‑to‑end: `allergen`, `severity`, `created_at`, `deleted_at`.
    
- **Errors:** API returns `{ error, code? }`; UI shows Toast + inline error.
    

---

## 5) How to build a feature (vertical slice)

1. **DB:** table + view + RLS; add `deleted_at`.
    
2. **Schemas:** Zod `Row/Create/Update/ListQuery/ListResponse` (snake_case).
    
3. **API:** list/detail + create/update/delete handlers (CRUD mode). Keep RPC optional behind a flag if needed.
    
4. **Hooks:** 5 hooks + keys; callback mutations; cache invalidation.
    
5. **Pages:** List (search/pagination), Create, Edit using ListView/DetailView + patterns.
    
6. **Tests:** API happy paths; Playwright e2e for list/create/edit/delete (screenshots under `ai/testing/screenshots/`).
    

> Build **Allergies** first, then clone the slice for Conditions, Immunizations, Surgeries, and Family History.

---

## 6) Definition of Done (per entity)

- ✅ **DB**: table, view, RLS, soft delete.
    
- ✅ **Zod**: all contracts present; names match DB.
    
- ✅ **API**: CRUD handlers validated by Zod; consistent error envelope.
    
- ✅ **Hooks**: 5 exported hooks + keys; invalidations wired.
    
- ✅ **Pages**: List + Detail (+ Create) with states, confirm, toast.
    
- ✅ **Tests**: API + e2e happy paths; screenshots saved.
    

---

## 7) Anti‑patterns to avoid

- Components that fetch or mutate data directly.
    
- Client using Supabase DB for protected data (bypasses RLS/API).
    
- Camel↔snake mapping layers; drifting field names between layers.
    
- Using `mutateAsync` in core flows (prefer callbacks for predictable UX).
    
- LocalStorage tokens or manual cookie fiddling.
    

---

## 8) Quick example: Allergies (names only)

- **Table:** `patient__medhist__allergies`
    
- **View:** `v_patient__medhist__allergies`
    
- **Routes:** `/api/patient/medhist/allergies[/:allergy_id]`
    
- **Zod:** `AllergyRow`, `AllergyCreateInput`, `AllergyUpdateInput`, `AllergyListQuery`, `AllergyListResponse`
    
- **Hooks:** `useAllergiesList|ById|Create|Update|Delete`
    
- **Pages:** `/patient/medhist/allergies`, `/new`, `/[allergy_id]`
    

> This is the template for every other entity: copy, rename, keep the same contracts.

---

