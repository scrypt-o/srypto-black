# Job Card — SSR Alignment, Allergies Small Fixes, and CSRF Save Error

- Date: 2025-08-29
- Owner: AI Assistant
- Status: Completed (Phase 1) → Next steps listed
- Related: ai/audit/2025-08-28-codebase-qa-audit-report.md, ai/specs/README.md, ai/specs/READ_ME_TO_CONTINUE.md

## SUMMARY
Confirm SSR-first conversion, fix Allergies list polish, resolve 403 save error (CSRF), validate with build and unit tests, and propose full CRUD E2E coverage.

## CONTEXT & SPECS READ
- Read: ai/specs/README.md, READ_ME_TO_CONTINUE.md, API and Error Semantics (Revised), Security & Configuration (Revised), Navigation & URL State, Complete CRUD — Allergies (Revised), Supabase Next Auth Standard.
- Non-negotiables applied: server-first pages/shells, reads via `v_*`, URL as SSOT, API routes for writes with Zod + CSRF, middleware-only auth.

## WORK DONE
1) Repo scan and SSR confirmation
   - Verified no page-level `use client` in pages; middleware-only auth in `middleware.ts`.
   - Allergies pages read via server client from `v_patient__medhist__allergies`.

2) Branch & targeted fixes
   - Created branch `small-fixes`.
   - Allergies list page: use server wrapper `ListPageLayout` instead of `ListPageLayoutClient`.
   - Filters: derive options from Zod enums (`SeverityEnum`, `AllergenTypeEnum`) to prevent drift.
   - Search: debounce URL sync (300ms) to reduce churn.
   - Placeholder pages: replace `any` casts; type tile configs with `TileGridLayoutProps`.

3) Testing config
   - Jest excludes Playwright tests and API e2e by design; added `jest.setup.js` polyfills (TextEncoder, fetch fallback via undici).
   - Unit tests pass; build successful.

4) Merge
   - Merged `small-fixes` → `master` (message: SSR alignment + small QA fixes).

5) Save error (403) root cause and fix
   - Cause: CSRF rejection when proxy stripped `Origin`/`Referer` or `NEXT_PUBLIC_SITE_URL` mismatched deployment domain.
   - Fix: `lib/api-helpers.ts::verifyCsrf` now accepts current deployment origin (`request.nextUrl.origin`) and a comma-separated `CSRF_ALLOWED_ORIGINS` allowlist. Still blocks cross-origin.
   - Commit on master: "fix(csrf): allow current deployment origin and optional allowlist; prevent false 403 on QA when NEXT_PUBLIC_SITE_URL mismatches".

## VALIDATION
- Typecheck: OK (`npm run typecheck`).
- Unit tests: OK (Jest; Playwright excluded from Jest).
- Build: OK (`next build`). Only warnings remain in some shared components; no new errors introduced.

## EVIDENCE (FILES TO REVIEW)
- app/patient/medhist/allergies/page.tsx (server layout wrapper)
- components/features/patient/allergies/AllergiesListFeature.tsx (enum-derived filters, debounced search)
- app/patient/* placeholder pages: typed `TileGridLayoutProps` instead of `any`.
- lib/api-helpers.ts (CSRF verification fix)
- jest.config.js, jest.setup.js (test configuration)

## OUTSTANDING ITEMS
- QA deployment needed to confirm 403 resolved. Set env: `CSRF_ALLOWED_ORIGINS=https://qa.scrypto.online,http://localhost:4569`.
- Some lint/type warnings in shared layouts (`ListViewLayout`, `DetailView`, `PatientSidebar`) — unrelated to this task; candidates for separate hardening pass.
- Server/proxy occasionally serves `_next/static/...css` as `text/plain` with 503 (not a code bug). Check PM2/proxy config.

## NEXT STEPS (TEST-DRIVEN)
1) Add Playwright E2E for full CRUD
   - auth.spec.ts: verify unauthenticated `/patient/**` redirects to `/login` (storageState empty for this test).
   - allergies-delete.spec.ts: select → ConfirmDialog → delete → toast → list refresh.
   - allergies-validation.spec.ts: create/edit invalid data → assert 422 surfaced in UI.
   - allergies-filters.spec.ts: apply `severity`/`allergen_type` filters → URL updates; list reflects.
   - allergies-search.spec.ts: search → URL debounced update; SSR-refreshed list includes matches.
   - allergies-notfound.spec.ts (optional): invalid id → not-found UI.

2) Add unit tests for `verifyCsrf`
   - Allows current origin; allows configured allowlist; blocks mismatched origin; GET bypass.

3) Environment & CI
   - Ensure QA has `CSRF_ALLOWED_ORIGINS` configured; confirm proxy forwards `Origin` and `Referer`.
   - CI: run `npm run check`, unit tests, then Playwright with `BASE_URL` and a CI `storageState`.

## COMMANDS (FOR REFERENCE)
- Unit: `npm run test:unit`
- E2E: `BASE_URL=https://qa.scrypto.online npm run test:e2e` (requires `cookies.txt` → storageState)
- Build: `npm run build`

## NOTES
- Ownership enforcement remains: updates filter by `allergy_id` + `user_id`. If save still fails after CSRF fix, verify the record belongs to the authenticated user.
- Middleware excludes `_next/static` in matcher; CSS 503/MIME issues are upstream from app code.

