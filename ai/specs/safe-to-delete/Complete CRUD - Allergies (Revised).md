# Complete CRUD — Allergies (Revised)

## Goal
Textbook SSR-first Allergies module: server-rendered shells, URL-driven list state, API-routed writes, Zod-validated inputs.

## Pages (Server)
- List: `app/patient/medhist/allergies/page.tsx`
  - Auth: `await requireUser()`
  - Parse `searchParams` via Zod (page/pageSize/search/filters/sort)
  - Read: `v_patient__medhist__allergies` with sorting, filters, pagination
  - Pass `{ initialData, total, initialState }` into the client feature component
- Detail: `app/patient/medhist/allergies/[id]/page.tsx`
  - Fetch from view by `allergy_id`; `notFound()` on miss
  - Render `DetailPageLayout` with `AllergyDetailFeature`
- Create: `app/patient/medhist/allergies/new/page.tsx`
  - Render `DetailPageLayout` with `AllergyCreateFeature`

## Client Page/View Components
- List: `AllergiesList` (feature client component)
  - Hydrate list store from props; sync store → URL (debounced)
  - Use `<Link prefetch>` for detail and `addHref`
  - Deletions: call `useDeleteAllergy()` and `router.refresh()` on success
  - Columns include `aria-sort` via `ListViewLayout`; filters auto-generated for `severity` and `allergen_type`
- Detail: `AllergyDetail`
  - React Hook Form + Zod; trims optional fields to `undefined`
  - `useUpdateAllergy()`; on success toast + `router.refresh()`
  - Soft delete via `useDeleteAllergy()`; back to list
- Create: `AllergyCreate`
  - `useCreateAllergy()`; on success toast + push back to list

## API Routes (Writes)
- List GET / Create POST: `app/api/patient/medical-history/allergies/route.ts`
- Detail GET / Update PUT / Delete DELETE: `app/api/patient/medical-history/allergies/[id]/route.ts`
- Semantics: 422 (Zod), 400 (JSON), 401/403 (auth), 404 (missing), 500 (unexpected)
- Trim inputs server-side; map empty → `undefined`

## Schemas
- File: `schemas/allergies.ts`
- Enums: `AllergenTypeEnum`, `SeverityEnum`
- Inputs: `AllergyCreateInputSchema`, `AllergyUpdateInputSchema`
- List: `AllergyListQuerySchema`, `AllergyListResponseSchema`

## Pitfalls & Fixes
- Do not fetch list on client first paint → pass `initialData` from server
- No page-level `use client` in pages; only in client features and layout clients
- Use view `v_*` for reads; base table for writes (RLS applies)
- Keep URL as single source of truth for list state
