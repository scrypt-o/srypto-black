# Job Card: Allergies — Textbook, Sustainable Implementation (No Quick Fixes)

## SUMMARY
Task: Make Allergies the gold‑standard vertical slice (UI, API, state, tests) to serve as the canonical example for all streams.
Date: 2025-08-28
Status: ✅ COMPLETED
Priority: Critical

## GOALS (What “Textbook” Means)
- Single source of truth for list state (no duplicated “local” state inside layout components).
- Deterministic behavior across navigation: search/filters/sort/page persist across list → detail → back.
- SSOT enforcement: UI options derived from Zod enums; API validates with Zod and returns 422; server trims input.
- SPA navigation everywhere; no `window.location.href`.
- Cache coherence: list + detail keys invalidate correctly on create/update/delete.
- Evidence: Playwright MCP tests + screenshots saved per spec.

## NON‑GOALS
- No global state frameworks beyond the minimal store slice required for list state.
- No TanStack Query (Phase 1 facade remains) beyond facade compatibility.
- No visual redesign beyond minor polishing for accessibility and mobile.

## ARCHITECTURE DECISIONS
- Controlled List Layout: `ListViewLayout` becomes a purely controlled component (no internal state for search/filters/sort/selection).
- List State Store: Introduce a tiny Zustand slice per list (e.g., `createListSlice('allergies')`) with sessionStorage persistence.
- URL Sync: Reflect `page`, `search`, and key `filters` in the URL; hydrate store from URL on mount for deep links.
- Server Semantics: Keep 422 for Zod validation errors; trim/normalize input server‑side; optional Phase 2 to add server sorting (`sort_by`, `sort_dir`).
- Accessibility: Sortable headers with `aria-sort`; filter count is announced; buttons have labels.

## IMPLEMENTATION PLAN

Phase 0 — Baseline verification (done)
- Verify existing API 422 + trimming; enum derivation; SPA nav; cache invalidation; not‑found UX in detail.

Phase 1 — State architecture (controlled + store)
1. Refactor `components/layouts/ListViewLayout.tsx` to controlled:
   - Remove `localSearch`, `localFilters`, `sort` and associated sync effects.
   - Add props: `filters`, `onFilterChange`, `sort`, `onSortChange`, `selectedIds`, `onSelectionChange`.
   - Emit events only; derive nothing internally.
2. Add store: `lib/state/listStore.ts` with `createListSlice(key)` using Zustand + sessionStorage.
   - State: `page`, `pageSize`, `search`, `filters`, `sort`, `selected`.
   - Actions: `setPage`, `setSearch` (debounced by caller), `setFilters`, `setSort`, `setSelected`, `clear`.
3. Wire Allergies list page to the store and pass controlled props to `ListViewLayout`.
   - Hydrate store from URL on mount; update URL on change (replace/merge query params).

Phase 2 — API sorting (completed)
4. Implemented `sort_by`, `sort_dir` support in `/api/patient/medical-history/allergies` GET.
   - Zod-validated; whitelisted (created_at, allergen, severity, allergen_type); default created_at desc.
   - Updated `useAllergiesList` to pass sort to API.

Phase 3 — Tests + Accessibility + Docs
5. Playwright MCP E2E (qa.scrypto.online):
   - Persistency: Set filters + search; navigate to detail and back; state persists.
   - Sorting: Toggle sort; verify order; persist across back/forward.
   - CRUD: Create → appears in list; Edit → detail + list update; Delete → row disappears.
   - Auth errors: 401 shows login intent; 422 shows friendly validation message.
6. Accessibility polish:
   - `aria-sort` on headers; label buttons; confirm filter badges are read.
7. Documentation:
   - Update `ai/specs/Pattern - Complete CRUD Implementation.md` with controlled list + store guidance.
   - Add short README section under `app/patient/medhist/allergies/` summarizing the pattern.

## FILES ADDED
- `lib/state/listStore.ts` (Zustand slice factory)

## FILES MODIFIED
- `components/layouts/ListViewLayout.tsx` (controlled props, remove internal state; fixed enum options)
- `app/patient/medhist/allergies/page.tsx` (wired store + URL sync; server sort)
- `app/api/patient/medical-history/allergies/route.ts` (server sorting + validation; kept 422 semantics)
- `hooks/usePatientAllergies.ts` (pass sort params to API)
- `ai/specs/Pattern - Complete CRUD Implementation.md` (controlled list + store note; previously updated)

## DEFINITION OF DONE
- Controlled ListViewLayout with no local state for search/filters/sort/selection.
- Allergies list uses Zustand store + URL sync; state persists across navigation.
- API accepts and validates sort params (if Phase 2 enabled); otherwise client sort remains stable.
- Playwright MCP evidence: screenshots saved to `ai/testing/screenshots/` following naming convention.
- Specs reflect the architecture: controlled list pattern + store slice.
- All TypeScript & ESLint checks pass; no console errors in browser.

## RISKS & MITIGATIONS
- Risk: Over‑coupling the layout to a specific store.
  - Mitigation: Keep layout controlled and store‑agnostic; store lives in page.
- Risk: URL/store divergence.
  - Mitigation: Single responsible “sync” in page with guarded `replace` updates.

## EVIDENCE TO CAPTURE
- `YYYYMMDD-allergies-list-persist.png` (filters/search survive back nav)
- `YYYYMMDD-allergies-sort-asc-desc.png`
- `YYYYMMDD-allergies-crud-sequence.png` (create/edit/delete)

## NOTES
- Apply this pattern to Conditions/Immunizations/Surgeries/Family History after sign‑off.
- No reintroduction of global shells; composed layouts remain the standard.
