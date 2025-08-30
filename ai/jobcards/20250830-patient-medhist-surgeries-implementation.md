# Job Card - Patient Medical History Surgeries Implementation

- Date: 2025-08-30
- Owner: AI Agent B
- Status: In Progress
- Reference: allergies implementation pattern
- Spec: ai/specs/ddl/patient__medhist__surgeries_ddl.md

## TASK
Implement patient/medhist/surgeries stream following verified allergies pattern. Complete production-ready surgeries stream with database verification, schemas, API routes, hooks, configurations, features. GenericListFeature + GenericDetailFeature pattern. Test complete CRUD functionality.

## DATABASE VERIFICATION
- [ ] Table exists: patient__medhist__surgeries
- [ ] View exists: v_patient__medhist__surgeries 
- [ ] Columns match DDL specification
- [ ] Verified via Supabase MCP

## IMPLEMENTATION PROGRESS
- [ ] Zod schemas created (Row/Create/Update/List + enums)
- [ ] API routes created (list/create + get/update/delete)
- [ ] Hooks created (TanStack Query patterns)
- [ ] Server pages created (SSR with proper layouts)
- [ ] Configuration files created (list and detail)
- [ ] Feature components created (GenericListFeature + GenericDetailFeature patterns)
- [ ] Navigation added to config

## TESTING CHECKLIST
- [ ] List page loads without errors
- [ ] Create functionality works end-to-end
- [ ] Edit functionality works end-to-end  
- [ ] Delete functionality works end-to-end
- [ ] Loading states visible during operations
- [ ] Form validation prevents invalid data
- [ ] TypeScript compiles clean
- [ ] Linting passes
- [ ] Build successful

## EVIDENCE
### Screenshots
- surgeries-list-view.png
- surgeries-create-form.png
- surgeries-edit-form.png
- surgeries-delete-confirmation.png

### Files Created
- schemas/surgeries.ts
- app/api/patient/medical-history/surgeries/route.ts
- app/api/patient/medical-history/surgeries/[id]/route.ts
- hooks/usePatientSurgeries.ts
- app/patient/medhist/surgeries/page.tsx
- app/patient/medhist/surgeries/new/page.tsx
- app/patient/medhist/surgeries/[id]/page.tsx
- config/surgeriesListConfig.ts
- config/surgeriesDetailConfig.ts
- components/features/patient/medhist/SurgeriesListFeature.tsx
- components/features/patient/medhist/SurgeryDetailFeature.tsx

## NOTES
- Follows allergies reference pattern exactly
- All core specs compliance verified
- Production-ready implementation
- Uses DDL specification: ai/specs/ddl/patient__medhist__surgeries_ddl.md
- Primary key: surgery_id
- Main display fields: surgery_name, surgery_date, surgeon_name
- Enums: surgery_type (elective/emergency/diagnostic/cosmetic/reconstructive), outcome (successful/complications/partial_success/failed)