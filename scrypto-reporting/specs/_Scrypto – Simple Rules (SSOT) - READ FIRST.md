
# Scrypto – Simple Rules (SSOT)

This is the concise source of truth for how Scrypto is built today. Treat it as the onboarding page; when detailed specs change, update this file in the same PR.

## Scope (Phase 1)

- Domains: Patient only (Pharmacy planned). One Patient sidebar. Cross‑links to Pharmacy are TBD in a future phase.
- Build features as vertical slices: DB → API → Hooks → Pages → Tests.

## Naming & Paths

- Three levels: Domain / Group / Item
  - Domain: `patient` (phase 1)
  - Group: stable shortcodes (DB oriented): `comm, persinfo, presc, medications, location, deals, vitality, carenet, medhist, labresults, rewards`
  - Item: kebab‑case slugs (e.g., `family-history`)
- URL: `/patient/<group>/<item>` (e.g., `/patient/medhist/family-history`)
- DB naming:
  - Table: `patient__<group>__<item>`
  - View (reads): `v_patient__<group>__<item>`
  - Optional RPC: `fn_<domain>__<group>__<item>__<verb>`
- Mapping key: `patient__<group>__<item>` (same as table)
- Zod: field names use snake_case (match DB); schema/type identifiers use PascalCase (e.g., `FamilyHistoryRowSchema`, `FamilyHistoryRow`).

## Data Flow (SSR-first)

- Reads occur in server pages from RLS views (`v_*`).
- Client components are presentational; mutations go through hooks.
- No `requireUser()` in pages (middleware protects routes).

## API Pattern & Security

- CRUD-first to tables/views; soft delete with `is_active = false` (never hard delete).
- Non‑GET requires CSRF + auth:
  - Call `verifyCsrf(request)` and return early if invalid.
  - Authenticate via `supabase.auth.getUser()` or helper `getAuthenticatedApiClient()`.
  - Auth routes under `/app/api/auth/**` are exempt from CSRF/auth checks.
- Ownership enforcement: filter on `user_id = <current user>` for writes.
- Errors: return `{ error: string, code?: string }` with appropriate status.
- List Query contract: `?page&pageSize&search&sort_by&sort_dir` (all implemented list endpoints must support).
- Next.js App Router with foldered `route.ts`.

## Hooks (TanStack)

- One file per entity exports: `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`, plus `XKeys`.
- Use mutation callbacks (`onSuccess/onError`) then invalidate keys.

## Pages & Layouts

- Content layouts:
  - `ListViewLayout` for list/search/pagination.
  - `DetailViewLayout` for create/edit/view (sticky actions, ConfirmDialog, Toast).
  - `TileGridLayout` for tile dashboards.
- Page shells (consolidation target): a single `PageShell` (server) + `PageShellClient` (client) that render Sidebar/Header/Footer/Chat and embed the content layout above.

## Sidebar

- One reusable component (`PatientSidebar`) + `patientNav` config.
- Sidebar reflects permissions; enforcement is via middleware + RLS + CSRF/auth, not via the UI.

## Database & RLS Standards

- Tables include: `<entity>_id` PK, `user_id`, `created_at`, `updated_at?`, `deleted_at?`.
- Views (`v_*`) handle read filtering; exclude soft‑deleted where applicable.
- RLS enabled on all tables with owner/role policies.

## Cardinality

- Mark items as `single` (one per user) or `many`.
- Examples: `profile` = single; `addresses`/`allergies` = many.

## Files/Uploads

- Supabase Storage per domain; signed URLs; RLS on object paths.
- Write endpoints (e.g., upload) require CSRF + auth; validate bucket names and object ownership.

## Errors & Testing

- UI shows Toast + inline error based on `{ error, code }`.
- Tests per entity: minimal API happy paths + schema validations; add E2E where useful.
- Save screenshots under `ai/testing/screenshots/<slug>/`.

## Lint Guardrails (enforced locally)

- `scrypto/no-requireUser-in-pages`: No `requireUser()` in pages under `app/patient/**/page.tsx`.
- `scrypto/server-reads-from-views`: Server pages must read from `v_*` views.
- `scrypto/api-route-requires-csrf`: Non‑GET API handlers must call `verifyCsrf(request)`.
- `scrypto/api-route-requires-auth`: Non‑GET API handlers must auth check (`auth.getUser()` or `getAuthenticatedApiClient()`).
- `scrypto/prefer-enum-options`: Prefer Zod enum `.options` over `Object.values(Enum.enum)`.
- `scrypto/prefer-view-layout-names`: Prefer `*ViewLayout` names over `*View`.
- `scrypto/prefetch-guidance` (warn): Prefer `<Link prefetch>` over `router.push('/internal')`.

---

## Example: Allergies

- URL: `/patient/medhist/allergies`
- Table: `patient__medhist__allergies`
- View: `v_patient__medhist__allergies`
- Zod: `AllergyRow`, `AllergyCreateInput`, `AllergyUpdateInput`, `AllergyListQuery`, `AllergyListResponse`
- API:
  - `GET/POST /api/patient/medhist/allergies`
  - `GET/PUT/DELETE /api/patient/medhist/allergies/[allergy_id]`
  - Non‑GET handlers include:
    - `const csrf = verifyCsrf(request); if (csrf) return csrf`
    - `const { supabase, user } = await getAuthenticatedApiClient()`
- Hooks: `useAllergiesList|ById|Create|Update|Delete`
- Pages: list/new/detail using layouts above; reads from `v_*` on server.

> When detailed specs change, update this SSOT in the same PR. This file is intentionally concise and aligned with our lint guardrails and current implementation.
