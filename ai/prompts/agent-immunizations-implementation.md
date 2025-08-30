# Agent Prompt: Implement Patient Medical History Immunizations Stream

## TASK OVERVIEW
Implement complete patient/medhist/immunizations stream following the verified allergies reference pattern.

## MANDATORY REQUIREMENTS

### **1. READ SPECIFICATIONS FIRST**
- **Start**: `ai/specs/README.md` for reading order
- **Core**: Read `ai/specs/core/01-09` in sequence
- **Process**: Follow `ai/specs/STREAM-IMPLEMENTATION-GUIDE.md` exactly
- **Reference**: Copy pattern from `ai/specs/ALLERGIES-REFERENCE-PATTERN.md`

### **2. VERIFY DATABASE SCHEMA**
- **Table**: `patient__medhist__immunizations` 
- **View**: `v_patient__medhist__immunizations`
- **DDL**: Check `ai/specs/ddl/patient__medhist__immunizations_ddl.md`
- **Verify**: Use Supabase MCP to confirm table/view exists and column names match DDL

### **3. IMPLEMENTATION STEPS**
Follow the 9-step process from STREAM-IMPLEMENTATION-GUIDE.md:

#### Step 1-3: Infrastructure
1. **Parse**: domain=patient, group=medhist, item=immunizations
2. **Verify database**: Table + view exist, columns match DDL
3. **Create Zod schemas**: `schemas/immunizations.ts` with proper enums

#### Step 4-5: API Layer  
4. **Create API routes**: 
   - `app/api/patient/medical-history/immunizations/route.ts` (GET list, POST create)
   - `app/api/patient/medical-history/immunizations/[id]/route.ts` (GET, PUT, DELETE)
5. **Create hooks**: `hooks/usePatientImmunizations.ts` with TanStack Query patterns

#### Step 6: Server Pages
6. **Create server pages**:
   - `app/patient/medhist/immunizations/page.tsx` (list - SSR)
   - `app/patient/medhist/immunizations/new/page.tsx` (create)
   - `app/patient/medhist/immunizations/[id]/page.tsx` (detail)

#### Step 7: Configuration-Driven Components
7. **Create configurations**:
   - `config/immunizationsListConfig.ts` (DDL field mappings)
   - `config/immunizationsDetailConfig.ts` (form fields + validation)
8. **Create minimal features**:
   - `components/features/patient/medhist/ImmunizationsListFeature.tsx` (27 lines)
   - `components/features/patient/medhist/ImmunizationDetailFeature.tsx` (13 lines)

#### Step 8-9: Testing & Navigation
9. **Add navigation**: Update medical history config
10. **Test end-to-end**: Complete CRUD cycle with Playwright verification

### **4. CONFIGURATION PATTERN**

#### List Configuration Template:
```typescript
// config/immunizationsListConfig.ts
export const immunizationsListConfig: ListFeatureConfig = {
  entityName: 'immunization',
  entityNamePlural: 'immunizations',
  basePath: '/patient/medhist/immunizations',
  
  transformRowToItem: (row: ImmunizationRow): ImmunizationItem => ({
    id: row.immunization_id,
    title: row.vaccine_name || 'Unknown Vaccine',
    letter: row.vaccine_name?.slice(0, 2).toUpperCase() || '??',
    severity: mapStatus(row.status), // Map to UI severity levels
    // ... other DDL field mappings
    data: row
  }),
  
  filterFields: [
    {
      key: 'status',
      label: 'Status',
      options: StatusEnum.options.map(opt => ({ value: opt, label: opt }))
    }
    // ... other filters from DDL enums
  ],
  
  hooks: { useDelete: useDeleteImmunization },
  searchPlaceholder: 'Search immunizations...',
  pageTitle: 'Immunizations'
}
```

#### Detail Configuration Template:
```typescript
// config/immunizationsDetailConfig.ts  
export const immunizationsDetailConfig: DetailFeatureConfig = {
  entityName: 'immunization',
  entityNamePlural: 'immunizations',
  listPath: '/patient/medhist/immunizations',
  
  formSchema: immunizationFormSchema,
  transformRowToFormData: (row) => ({ /* DDL mappings */ }),
  transformFormDataToApiInput: (formData) => ({ /* normalization */ }),
  
  fields: [
    {
      key: 'vaccine_name',
      label: 'Vaccine Name', 
      type: 'text',
      required: true,
      description: 'Name of vaccine administered'
    }
    // ... other DDL fields
  ],
  
  hooks: { useUpdate: useUpdateImmunization, useDelete: useDeleteImmunization }
}
```

#### Minimal Feature Components:
```typescript
// components/features/patient/medhist/ImmunizationsListFeature.tsx
export default function ImmunizationsListFeature(props) {
  return <GenericListFeature {...props} config={immunizationsListConfig} />
}

// components/features/patient/medhist/ImmunizationDetailFeature.tsx  
export default function ImmunizationDetailFeature({ immunization }) {
  return <GenericDetailFeature data={immunization} config={immunizationsDetailConfig} />
}
```

### **5. SUCCESS CRITERIA**

#### Must Pass:
- ✅ **TypeScript compilation**: `npm run typecheck`
- ✅ **Lint validation**: `npx eslint .` (no pattern violations)
- ✅ **Complete CRUD**: Create → Read → Update → Delete cycle working
- ✅ **Screenshot evidence**: Save proof of working functionality

#### Deliverables:
- **Working stream**: Full CRUD functionality 
- **Clean code**: 40 lines following generic pattern
- **Documentation**: Updated specs if needed
- **Test evidence**: Playwright screenshots of working features

### **6. CRITICAL NOTES**

- **Follow allergies pattern EXACTLY** - it's the proven reference
- **Use GenericListFeature + GenericDetailFeature** - no custom implementations
- **DDL is source of truth** - all field mappings come from database spec
- **Test thoroughly** - verify each operation before marking complete
- **No shortcuts** - quality must match allergies standard

### **7. AGENT VALIDATION**

**Success markers**:
- Navigation from medical history works
- List loads and displays immunizations
- Filter/search functionality works  
- Create form validates and saves
- Detail view shows data correctly
- Edit mode enables and saves properly
- Delete confirmation and removal works

**Failure indicators**:
- TypeScript compilation errors
- Lint rule violations
- "TODO" or placeholder components
- Broken CRUD operations
- Missing or incorrect field mappings

**DELIVER COMPLETE + FUNCTIONAL IMMUNIZATIONS STREAM** following the established architecture patterns.