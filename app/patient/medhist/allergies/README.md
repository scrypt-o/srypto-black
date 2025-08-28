Allergies Module — Server‑First Pattern

What this demonstrates
- Server pages: `page.tsx`, `[id]/page.tsx`, and `new/page.tsx` are server components using the Supabase server client to read from the `v_patient__medhist__allergies` view.
- Client islands only for interactivity:
  - `AllergiesListIsland.tsx` renders the list UI, manages URL‑driven state via a small Zustand slice, and performs mutations.
  - `AllergyDetailIsland.tsx` renders view/edit detail sections and handles update/delete.
  - `NewAllergyIsland.tsx` renders the create form and handles submit.
- Composed layouts: Server wrappers (`ListPageLayout`, `DetailPageLayout`) compose tiny client chrome (`Client*Chrome`) and mount the islands as children. No page‑level `use client`.
- URL‑driven list state: The list store hydrates from `searchParams` (page/search/filters/sort) and syncs back to the URL (debounced) to trigger new SSR reads.
- Correct API semantics: Mutations go through existing API routes with Zod validation (422), auth (401/403), not found (404), and trimming/normalization on the server.

Key files
- Server pages: `app/patient/medhist/allergies/{page.tsx,[id]/page.tsx,new/page.tsx}`
- Features: `components/features/patient/allergies/{AllergiesListFeature,AllergyDetailFeature,AllergyCreateFeature}.tsx`
- Layouts: `components/layouts/{ListPageLayout,DetailPageLayout,ListPageLayoutClient,DetailPageLayoutClient}.tsx`
- Store: `lib/state/listStore.ts`
- API: `app/api/patient/medical-history/allergies/*`

Recent Updates (Aug 28, 2025)
- Schema improvements: Updated `AllergyRowSchema` to use proper enums (`AllergenTypeEnum`, `SeverityEnum`) instead of strings for better type safety and early drift detection
- Severity mapping: Added explicit support for `life_threatening` severity level with strong red visual indicator
- Component migration: Replaced legacy list with `AllergiesListFeature` using `ListViewLayout`
- Deprecated: `AllergiesListView` marked as deprecated - uses direct Supabase calls instead of API routes

Notes
- Add DB indexes for `(user_id, created_at DESC)` and common filters (`allergen`, `severity`, `allergen_type`) for performance.
- Accessibility basics: inputs labeled, `aria-sort` on sortable headers via `ListViewLayout`.
- Security hardening: CSRF origin checks, security headers via `middleware.ts`, per‑user pages marked `dynamic = 'force-dynamic'`.
- Severity enum values: `mild`, `moderate`, `severe`, `life_threatening` (maps to visual indicators in UI)
