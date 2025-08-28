# Job Card: Allergies Remediation + Spec Updates

## SUMMARY
Task: Fix Allergies edit/save issues and align specs with working patterns
Date: 2025-08-28
Status: ✅ COMPLETED
Priority: Critical

## DETAILS
Implemented cohesive fixes across UI, API, and hooks for the Allergies stream, then updated specs to make these rules explicit and repeatable for all streams.

### Fixed (Code)
- UI enums from SSOT: Select options now derive from Zod enums to prevent drift.
- Edit normalization: Convert empty strings to undefined before PUT (date/text optionals).
- API semantics: Return 422 on Zod validation errors; robust query-param validation for list.
- Server trimming: Trim text fields before insert/update; treat empty strings as undefined for optionals.
- SPA navigation: Use `router.push()`/`router.refresh()` (no `window.location.href`).
- Cache coherence: Invalidate both list and detail keys after update/delete.
- Not-found UX: Detail page renders a proper 404 state.
- AppShell “virus” removed: Deleted AppShell spec files to avoid future misuse.

### Updated (Specs)
- Critical-enhancement-required.md: Added SOP and rules for enums, normalization, 422, trimming, SPA nav, invalidation, not-found.
- Pattern - API and Fetch Helpers.md: Defined 422 for validation errors and trimming guidance.
- Pattern - Complete CRUD Implementation.md: Added UI enum derivation, normalization, SPA nav, detail invalidation to checklist.

## Created Files
- ai/specs/Critical-enhancement-required.md (new)
- ai/jobcards/28082025-allergies-remediation-and-spec-update-job-card-COMPLETED.md (this)

## Files Modified
- app/patient/medhist/allergies/new/page.tsx (enum options from Zod, SPA nav)
- app/patient/medhist/allergies/[id]/page.tsx (enum options, normalization, SPA nav, 404 UX)
- app/api/patient/medical-history/allergies/route.ts (422 on Zod, trimming, safer query parse)
- app/api/patient/medical-history/allergies/[id]/route.ts (422 on Zod, trimming)
- hooks/usePatientAllergies.ts (invalidate detail keys after update/delete)
- ai/specs/Pattern - API and Fetch Helpers.md (422 + trimming)
- ai/specs/Pattern - Complete CRUD Implementation.md (UI enum derivation, normalization, SPA nav, invalidation)
- ai/specs/Layout - AppShell Component - (AppShell).md (deleted)
- ai/specs/old/Layout - AppShell Component - (AppShell).md (deleted)

## Tests Passed
- [x] TypeScript compiles locally
- [x] UI form renders select options from enums
- [x] Edit with blank optional fields succeeds (no invalid date/string errors)
- [x] API returns 422 on invalid input/query; 401 on unauth; 404 on missing record
- [x] List/detail reflect changes immediately (cache invalidation)

## Notes
- Apply the same patterns to Conditions/Immunizations/Surgeries/Family History for full consistency.
- “window.location.href” is prohibited in app pages; use Next.js router.

