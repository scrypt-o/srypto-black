# Critical Enhancements Required — Stream Multiplication SOP

## Purpose
- Establish non‑negotiable rules and a minimal, repeatable 1–4 step guide to multiply new “streams” (domain → group → item) using only the DDL and the naming map.
- Fix recurrent defects (enum drift, input normalization, error semantics) and fold them into standards to prevent reoccurrence across 50+ streams.

---

## Immediate Critical Enhancements (apply across all streams)
- Enum options from SSOT: Derive UI select options from Zod enums (never hard‑code). Prevents drift like insect/latex when schema allows only food|medication|environmental|other.
- Normalize optional fields on submit: Convert empty strings to `undefined` before POST/PUT for optional columns (e.g., `first_observed` date). Mirrors create/edit behavior.
- Validation status semantics: Return 422 on Zod validation failures; reserve 400 for malformed requests, 500 for server faults. UI surfaces messages via `ApiError`.
- Harden query param parsing: Validate `page`, `pageSize`, and filters (enums) server‑side; clamp `pageSize` ≤ 100; 422 on invalid.
- Navigation consistency: Prefer SPA navigation (`router.push`, `router.refresh`) over `window.location.href` to preserve app state.
- Cache coherence: After create/update/delete, invalidate list key and the relevant detail key.
- Trimming: Trim text fields server‑side before writes to avoid noisy diffs and validation edge cases.
- Not‑found UX: On 404 in detail view, show a small “record not found” state with back action.

---

## Golden Rules (add to Dev Guide)
- SSOT enforcement: Zod schemas in `schemas/` are the single source of truth for enums, input shapes, and response types. UI derives from Zod, API validates with Zod.
- Reads via views only: Use `v_*` views for all reads; filter by `auth.uid()` and `is_active=true`. Writes go to base tables; soft delete via `is_active=false`.
- Error contract: APIs must return `422` for validation errors with `{ error, details }`; `401/403` for auth/perm; `404` for not found; `500` only for unexpected.
- Facade first: Use `/lib/query/runtime.ts` hooks (no direct TanStack) for Phase 1. Invalidate queries with the canonical keys object.
- Naming convention everywhere: `{domain}__{group}__{item}` for DB; file paths and component names follow the map. Do not invent new names.
- Job card + spec required: No work without a job card and a referenced spec. Append‑only job cards.

---

## 1–4 Guide: Multiply a Stream from DDL + Map

Given only the DDL for `{domain}__{group}__{item}` and the domain→group→item map, follow exactly:

1) Model from DDL (Zod = SSOT)
- Read `ai/specs/database-ddl/{domain}__{group}__{item}_ddl.md` and confirm column names, nullability, and enum constraints.
- Create `schemas/{item}.ts` (or nested path `schemas/{domain}/{group}/{item}.ts` if the repo uses subfolders):
  - `RowSchema` mirrors the table columns exactly (nullable where nullable, strings for timestamps/dates as ISO/`YYYY-MM-DD`).
  - `CreateInputSchema` and `UpdateInputSchema` in business‑logic form (required vs optional), plus `ListQuerySchema` and `ListResponseSchema`.
  - Export enums from the DDL checks (e.g., `AllergenTypeEnum`, `SeverityEnum`).

2) API contracts (CRUD‑first, view‑only reads)
- Files:
  - `app/api/{domain}/{group-readable}/{item}/route.ts` → `GET` list with pagination/filter; `POST` create.
  - `app/api/{domain}/{group-readable}/{item}/[id]/route.ts` → `GET` single via view; `PUT` update; `DELETE` soft delete.
- Rules:
  - Auth via `getServerClient()` and `supabase.auth.getUser()`; `401` if unauthenticated.
  - Reads: `from('v_{domain}__{group}__{item}')` only; writes: `from('{domain}__{group}__{item}')`.
  - Validate query/body with Zod; return `422` on Zod errors with `{ error: 'Invalid input', details }`.
  - Trim all text fields before writes; set `updated_at` on updates; set `user_id` on creates; filter updates/deletes by `user_id` and `id`.

3) Hooks (Facade) and Keys
- File: `hooks/use{ItemPlural}.ts` (or `hooks/{domain}/{group}/use{Item}.ts` if nested).
- Provide `Keys = { all, list(params), detail(id) }` used by the facade and invalidation.
- Implement `useList`, `useById`, `useCreate`, `useUpdate`, `useDelete` using `useQuery`/`useMutation` from `/lib/query/runtime`.
- Invalidate on mutation success:
  - `invalidateQueries(Keys.all)` and `invalidateQueries(Keys.detail(id))` as applicable.

4) Pages (Layouts) and Navigation
- Paths:
  - List: `app/{domain}/{group-readable}/{item}/page.tsx`
  - New: `app/{domain}/{group-readable}/{item}/new/page.tsx`
  - Detail/Edit: `app/{domain}/{group-readable}/{item}/[id]/page.tsx`
- Use `ListViewLayout` for list; `DetailViewLayout` for new/detail pages with `formId`.
- Derive select options from Zod enums (e.g., `Object.values(MyEnum.enum)`), not hard‑coded arrays.
- Normalize optional fields on submit: convert empty strings to `undefined`.
- Use `router.push()`/`router.refresh()` for navigation; never `window.location.href`.
- Add nav entry to `config/{domain}Nav.ts` using the canonical map.

---

## API Status & Error Rules (copy/paste)
- 200: Success (GET/PUT/DELETE) • 201: Created (POST)
- 401: Unauthorized (no session) • 403: Forbidden (RLS/permission)
- 404: Not found (missing record) • 422: Zod validation error
- 500: Internal server error (unexpected)
- Response shape for errors: `{ error: string, code?: string, details?: unknown }`

---

## Naming & Path Mapping (canonical)
- DB table: `{domain}__{group}__{item}` → e.g., `patient__medhist__allergies`
- View: `v_{domain}__{group}__{item}` → `v_patient__medhist__allergies`
- API: `/api/{domain-readable}/{group-readable}/{item}` → `/api/patient/medical-history/allergies`
- Component: `Patient{Group}{Item}.tsx` when a single component is needed
- Paths: `app/{domain-readable}/{group-readable}/{item}/...`

---

## Definition of Done (per stream)
- Zod schemas created (Row/Create/Update/List) and exported enums; UI options derived from enums.
- API routes implemented with view‑only reads, validated inputs, correct status codes, trimming, and soft delete.
- Hooks implemented with facade; proper cache invalidation.
- Pages wired with layouts; SPA navigation used; form normalization done.
- E2E: List, create, edit, delete happy paths + one invalid input case; screenshots saved to `ai/testing/screenshots/`.
- Job card updated with evidence; link to this SOP in the job card.

---

## Quick Checklist (repeat for each new stream)
1. Read DDL doc and map the names.
2. Create Zod schemas (+ enums) from DDL.
3. Implement API endpoints (list/create, get/update/delete) with validation and error semantics.
4. Build hooks with facade and keys; invalidate correctly.
5. Create list/new/detail pages using layouts; derive options from enums; normalize inputs.
6. Add nav entry; verify route protection via middleware.
7. Run E2E; save screenshots; append job card.

