# Job Card — Middleware-Only Auth Standardization + QC Fixes (Audit Alignment)

- Date: 2025-08-29
- Owner: AI Assistant
- Status: Proposed (awaiting discussion/approval)
- Related: ai/audit/2025-08-28-codebase-qa-audit-report.md, ai/audit/26082025-layout-and-specs-audit.md
- Specs: ai/init.md (middleware-only auth), ai/specs/READ_ME_TO_CONTINUE.md, ai/specs/API and Error Semantics (Revised).md, ai/specs/SSR-First Architecture.md

## Background & Drivers
Recent audits surfaced inconsistencies between our authentication pattern in code and our documented standards:
- Code uses page-level `requireUser()` across multiple pages.
- middleware.ts currently sets headers only (no route protection).
- ai/init.md mandates middleware-only route protection; READ_ME_TO_CONTINUE includes examples using `await requireUser()` at page level.
- Additional quality concerns: use of `alert()/confirm()`, heavy `any` casting in pages/layouts, placeholder pages with empty tiles.

Goal: Reconcile auth pattern to middleware-only (single source of truth), clean up high-ROI quality issues, and validate with tests. Maintain SSR-first with client islands and correct API semantics throughout.

## Scope
- In: `middleware.ts`; all `app/patient/**` pages calling `requireUser()`; Allergies list feature confirmations/toasts; obvious `any` hot spots in patient pages and key layouts; placeholder patient pages’ empty-state UX; Playwright and unit test additions for auth semantics.
- Out (for this card): Database schema changes; non-patient domains; large-scale refactors beyond agreed issues; dependency changes.

## Decisions (Proposed)
- Route protection: middleware-only with PUBLIC_PATHS allowlist; pages no longer gate/redirect based on auth.
- Pages that need user ID: call `getServerClient().auth.getUser()` non-throwingly to read `user.id` for SSR queries.
- API routes: continue to check auth and return 401/403; do not rely on middleware for mutations.
- SSR-first: unchanged; middleware runs before SSR; islands unaffected.

## Risks & Mitigations
- Redirect loops/miscoverage: Carefully define PUBLIC_PATHS and matcher; add Playwright tests for unauthenticated redirects.
- Edge runtime constraints: Use a lightweight, edge-safe session check for middleware.
- Prefetch behavior: Ensure matcher excludes Next static assets and images; verify normal page prefetch still works.
- Type tightening regressions: Start with obvious `any` removals; avoid broad changes that spike churn.

## Work Plan (Phased)
1) Spec Reconciliation & Comms (no code)
- Align on middleware-only as the single pattern (matches ai/init.md).
- Update guidance in docs (proposal): remove page-level `requireUser()` examples from READ_ME_TO_CONTINUE; add a note in ai/specs/README about auth pattern to prevent regressions.

2) Middleware Route Protection
- Implement PUBLIC_PATHS; add edge-safe session check in `middleware.ts`.
- Redirect unauthenticated requests to `/login` (confirm path list below).
- Keep current security headers.

3) Page-Level Guard Removal
- Remove `await requireUser()` from patient pages.
- Where user is needed for SSR queries, replace with `const { data: { user } } = await supabase.auth.getUser()`; handle nulls gracefully.

4) UX: Replace alert/confirm
- In `components/features/patient/allergies/AllergiesListFeature.tsx`, replace `confirm()` with `<ConfirmDialog>` and `alert()` with toast notifications.
- Verify ESLint’s `no-alert` stays enabled.

5) Type Safety Hotspots (targeted)
- Define narrow types for tile configs used in patient pages; replace obvious `as any` casts in `app/patient/**/page.tsx` where trivial.
- Reduce `any` usage in list/layouts where keys are well-known (non-invasive adjustments only).

6) Placeholder Pages UX
- For in-progress patient pages, add consistent empty-state messaging (“Coming soon”) and avoid passing `as any` arrays; keep navigation discoverable but clear.

7) Validation & Tests
- Playwright: unauthenticated access to protected patient routes redirects to `/login`.
- Unit: API routes still return 401/403 appropriately; pages can read `user` non-throwingly.
- Smoke: SSR pages render with/without `user` (middleware ensures only with user in protected paths).

## Acceptance Criteria
- Auth: All protected patient routes require authentication via middleware; page-level `requireUser()` removed; unauthenticated requests redirect to `/login`.
- SSR: Pages still perform server data fetches; no hydration warnings; navigation prefetch remains smooth.
- Allergies list: Uses ConfirmDialog/Toast (no browser `alert/confirm`).
- Types: Noticeable reduction in unsafe `any` in targeted files; no new TypeScript errors.
- Tests: Playwright auth redirect tests pass; unit tests for API 401/403 paths pass.

## Impacted Files (Initial)
- `middleware.ts`
- `app/patient/**/page.tsx` (all pages currently calling `requireUser()`)
- `components/features/patient/allergies/AllergiesListFeature.tsx`
- Possibly: `components/layouts/*` (light type improvements only)
- Tests under `__tests__` and `tests/e2e`

## PUBLIC_PATHS (Proposed)
- `['/', '/login', '/signup', '/reset-password', '/api/auth']`
- Confirm if additional public marketing pages or health checks exist.

## Rollback Plan
- Middleware changes are isolated; revert `middleware.ts` and retain page-level `requireUser()` if needed.
- Keep changes in a feature branch until approved and validated.

## Open Questions (for discussion)
- Confirm middleware-only as the standard going forward (deprecate page-level guard pattern in specs).
- Confirm `/login` as the unauth redirect target.
- Any protected routes outside `/patient` that must be included now?
- Appetite for elevating some TypeScript/ESLint warnings post-cleanup?

## Evidence & References
- `rg` shows many `requireUser()` calls across patient pages.
- `middleware.ts` currently lacks authentication logic.
- ESLint has `no-alert: error`; Allergies feature still uses `alert()/confirm()`.
- SSR/client-islands remain compatible with middleware-only auth.

> Do not start implementation until approved. This card will remain immutable; follow-ups will be appended below after approval.

