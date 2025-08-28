# Job Card: Final Allergies Audit (Textbook Verification)

## SUMMARY
Task: Audit Allergies end-to-end as the canonical example; validate against specs and SOPs.
Date: 2025-08-28
Status: Planned
Priority: Critical

## SCOPE
- Architecture: Controlled list (no internal state), Zustand store, URL sync.
- API: 422 on Zod errors, trim/normalize inputs, server-side sorting.
- UI/UX: Zod-derived enum options, SPA navigation, edit normalization, not-found UX.
- Cache: List + detail invalidation on mutations.
- Accessibility: Sort headers expose `aria-sort`; actionable controls have labels.
- Documentation: Specs and job cards reflect implementation.

## CHECKLIST
- [ ] List state is single source of truth (store), ListViewLayout is controlled-only.
- [ ] URL reflects `search`, `allergen_type`, `severity`, `page`, `sort_by`, `sort_dir` and hydrates store on mount.
- [ ] API validates query/body; returns 422 with `details` on Zod errors; trims/normalizes inputs.
- [ ] Server-side sort works for: created_at, allergen, severity, allergen_type.
- [ ] Forms derive options from Zod; submit normalization converts empty strings to `undefined`.
- [ ] SPA navigation everywhere (`router.push`, `router.refresh`), no `window.location.href`.
- [ ] Cache invalidation updates list and specific detail entries after update/delete.
- [ ] Headers indicate sort with `aria-sort` (asc/desc/none); filter badge changes are discoverable.
- [ ] No console errors; TypeScript passes; lint passes.
- [ ] README or brief doc included for developers (pattern summary under allergies folder).

## FILES UNDER AUDIT
- `app/patient/medhist/allergies/page.tsx`
- `app/patient/medhist/allergies/new/page.tsx`
- `app/patient/medhist/allergies/[id]/page.tsx`
- `components/layouts/ListViewLayout.tsx`
- `hooks/usePatientAllergies.ts`
- `app/api/patient/medical-history/allergies/route.ts`
- `app/api/patient/medical-history/allergies/[id]/route.ts`
- `lib/state/listStore.ts`
- Specs: `ai/specs/Pattern - Complete CRUD Implementation.md`, `ai/specs/Pattern - API and Fetch Helpers.md`, `ai/specs/Critical-enhancement-required.md`

## RISKS
- URL/store divergence if multiple writers exist.
- Sort parameters not whitelisted correctly.

## NOTES
- Playwright evidence deferred per request; manual verification acceptable for this audit. Add screenshots later if required.

