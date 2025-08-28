# Job Card: Allergies — Server Components Conversion (SSR-first, No API Changes)

## SUMMARY
Task: Convert Allergies pages and shells to server components (SSR-first), keep APIs unchanged, and use small client islands only where needed.
Date: 2025-08-28
Status: Planned
Priority: Critical

## SCOPE
- Pages: `app/patient/medhist/allergies/page.tsx`, `app/patient/medhist/allergies/[id]/page.tsx`, `app/patient/medhist/allergies/new/page.tsx` → server components.
- Shells: `ListPageLayout`, `DetailPageLayout`, `AppHeader`, `PatientSidebar` → server-by-default; extract minimal client islands (search, filters, theme toggle, toasts, buttons).
- Data fetch: Use Supabase server client in server pages/shells (reads via `v_patient__medhist__allergies` view).
- Mutations: Keep using existing API routes (no API contract changes).
- Navigation: Prefer `<Link prefetch>`; use `router.prefetch()` only where imperative.
- Performance target: Route transition TTI < 800ms on typical mobile viewport (390×844) in QA build.

## OUT OF SCOPE (for this job)
- No changes to API semantics (422/trim/normalization already in place for Allergies; keep).
- No DB schema changes (indexes can be added in a separate DB hardening job).
- No Playwright screenshots (per instruction, skip for now).

## ARCHITECTURE DECISIONS
- SSR-first: Pages fetch server-side with Supabase server client. Client islands handle interactivity only (forms/search/filters/buttons).
- Shells server-by-default: Move heavy layout containers to server; mount client islands inside them (e.g., `SearchBar`, `FilterPanel`, `ThemeToggle`, `ToastProvider` children).
- Data boundary: Pass fetched data as props to client islands; avoid browser → API → DB double hops for reads.
- Auth: Continue to rely on `middleware.ts` for protection; use server client `getUser()` if needed in server tree.

## IMPLEMENTATION PLAN

Phase 1 — Prepare server shells (safe refactor)
1. Split layout components:
   - Convert `components/layouts/ListPageLayout.tsx` and `DetailPageLayout.tsx` to server by default (remove `'use client'`).
   - Extract minimal client islands: keep `SearchBar`, `FilterPanel`, and interactive controls as client components; import them dynamically or pass as children.
   - `AppHeader`: make server; isolate user-menu/theme toggle as client island if required.
   - `PatientSidebar`: make server; fetch current user via server client; keep sign-out/action buttons as client if needed.

2. Keep `ListViewLayout.tsx` and `DetailViewLayout.tsx` as client islands (already client). Ensure they accept data/handlers via props and remain pure.

Phase 2 — Convert Allergies pages to server components
3. `app/patient/medhist/allergies/page.tsx` (Server):
   - Fetch list server-side using Supabase server client against `v_patient__medhist__allergies` with URL params (page, pageSize, search, filters, sort).
   - Render server `ListPageLayout` and pass data + initial state to client `ListViewLayout` island.
   - Replace row actions with `<Link prefetch>` for detail; “Add” uses `<Link prefetch>` to `/new`.

4. `app/patient/medhist/allergies/[id]/page.tsx` (Server):
   - Fetch detail server-side from `v_patient__medhist__allergies`.
   - Render server `DetailPageLayout` and mount a small client form island for edit mode only.

5. `app/patient/medhist/allergies/new/page.tsx` (Server):
   - Render server `DetailPageLayout` with client form island for create.

Phase 3 — Prefetch and polish (no API change)
6. Add `<Link prefetch>` to list rows/title and actions where possible; otherwise call `router.prefetch()` on hover/focus.
7. Keep Zustand store for list UX (search/filters/sort/page + URL sync). The page hydrates islands with initial state from URL.

## FILES TO MODIFY
- `components/layouts/ListPageLayout.tsx` (server by default; client islands inside)
- `components/layouts/DetailPageLayout.tsx` (server by default; client islands inside)
- `components/layouts/AppHeader.tsx` (server; client bits split)
- `components/nav/PatientSidebar.tsx` (server; client bits split)
- `app/patient/medhist/allergies/page.tsx` (server; server-side data fetch; pass to island)
- `app/patient/medhist/allergies/[id]/page.tsx` (server; server-side data fetch; pass to island)
- `app/patient/medhist/allergies/new/page.tsx` (server; pass to island)

## DEFINITION OF DONE
- Allergies pages render as server components; reads occur server-side via Supabase server client.
- Layouts are server by default; interactive UI is isolated in small client islands.
- Navigation uses `<Link prefetch>` where applicable; perceived transition time < 800ms on QA build.
- No API changes made; all mutations still flow through existing routes.
- TypeScript and lint pass; no hydration warnings; no client bundle bloat from shells.

## RISKS & MITIGATIONS
- Risk: Mixing server shells with client islands incorrectly causes hydration mismatch.
  - Mitigation: Keep islands pure, pass only serializable props; avoid passing functions deep unless needed.
- Risk: Sidebar/header require client-only behavior.
  - Mitigation: Extract those behaviors into tiny client components and mount them inside server shells.

## NOTES
- DB indexes (optional but recommended) planned as a separate job card (DB hardening) to further reduce list latency.
- After Allergies SSR is deployed and verified, replicate for Conditions/Immunizations/Surgeries/Family History.
