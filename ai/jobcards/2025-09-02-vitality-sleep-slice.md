## SUMMARY
Task: Implement vitality sleep slice (schema, API, hook, minimal UI)
Date: 2025-09-02T00:00:00.000Z
Status: Ongoing

## DETAILS
Goal: Establish a repeatable pattern for vitality sub-features by implementing the `sleep` vertical slice per `ai/specs/ddl/patient_vitality_grouped_ddl.md`.

Scope:
- Zod schemas for `patient__vitality__sleep` + list/query/response
- API routes `/api/patient/vitality/sleep` and `/api/patient/vitality/sleep/[id]`
- Hook `usePatientSleep` using TanStack Query
- Minimal list page `/patient/vitality/sleep` using ListPageLayout + ListViewLayout

Assumptions:
- Table: `patient__vitality__sleep`
- View: `v_patient__vitality__sleep`
- PK: `sleep_id` (consistent with existing naming like `allergy_id`)
- Soft delete via `is_active=false`

## Created Files
- schemas/sleep.ts
- app/api/patient/vitality/sleep/route.ts
- app/api/patient/vitality/sleep/[id]/route.ts
- hooks/usePatientSleep.ts
- app/patient/vitality/sleep/page.tsx

## Tests Passed
- [ ] TS compiles
- [ ] Feature works
- [ ] Screenshot captured

## Notes
Pattern matches allergies/conditions CRUD structure: SSR for list, client hook for interactions, views for reads, tables for writes, CSRF on write.

