# Agent Prompt: Implement Patient Medical History Surgeries Stream

## TASK OVERVIEW
Implement complete patient/medhist/surgeries stream following the verified allergies reference pattern.

## MANDATORY REQUIREMENTS

### **1. READ SPECIFICATIONS FIRST**
- **Start**: `ai/specs/README.md` for reading order
- **Core**: Read `ai/specs/core/01-09` in sequence  
- **Process**: Follow `ai/specs/STREAM-IMPLEMENTATION-GUIDE.md` exactly
- **Reference**: Copy pattern from `ai/specs/ALLERGIES-REFERENCE-PATTERN.md`

### **2. VERIFY DATABASE SCHEMA**
- **Table**: `patient__medhist__surgeries`
- **View**: `v_patient__medhist__surgeries` 
- **DDL**: Check `ai/specs/ddl/patient__medhist__surgeries_ddl.md`
- **Verify**: Use Supabase MCP to confirm table/view exists and column names match DDL

### **3. KEY FIELD MAPPINGS** (Based on Expected DDL)
```typescript
// Expected primary fields for surgeries
{
  surgery_id: 'Primary key',
  procedure_name: 'Main display field', 
  surgery_date: 'Date performed',
  surgeon_name: 'Performing surgeon',
  hospital_name: 'Where performed',
  procedure_type: 'Enum: elective|emergency|reconstructive|cosmetic',
  outcome: 'Enum: successful|complicated|failed',
  complications: 'Text description',
  recovery_notes: 'Post-operative notes',
  follow_up_required: 'Boolean flag'
}
```

### **4. CONFIGURATION TEMPLATES**

#### List Configuration:
```typescript
// config/surgeriesListConfig.ts
export const surgeriesListConfig: ListFeatureConfig = {
  entityName: 'surgery',
  entityNamePlural: 'surgeries', 
  basePath: '/patient/medhist/surgeries',
  
  transformRowToItem: (row: SurgeryRow): SurgeryItem => ({
    id: row.surgery_id,
    title: row.procedure_name || 'Unknown Procedure',
    letter: row.procedure_name?.slice(0, 2).toUpperCase() || '??',
    severity: mapOutcome(row.outcome), // successful=normal, complicated=moderate, failed=severe
    thirdColumn: row.surgery_date,
    data: row
  }),
  
  filterFields: [
    {
      key: 'procedure_type',
      label: 'Procedure Type', 
      options: ProcedureTypeEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'outcome',
      label: 'Outcome',
      options: OutcomeEnum.options.map(opt => ({ value: opt, label: opt }))
    }
  ],
  
  hooks: { useDelete: useDeleteSurgery },
  searchPlaceholder: 'Search surgeries...',
  pageTitle: 'Surgeries & Procedures',
  exportHeaders: ['Procedure', 'Date', 'Surgeon', 'Hospital', 'Outcome']
}
```

#### Detail Configuration:
```typescript
// config/surgeriesDetailConfig.ts
export const surgeriesDetailConfig: DetailFeatureConfig = {
  entityName: 'surgery',
  entityNamePlural: 'surgeries',
  listPath: '/patient/medhist/surgeries',
  
  formSchema: surgeryFormSchema,
  transformRowToFormData: (row) => ({ /* DDL mappings */ }),
  transformFormDataToApiInput: (formData) => ({ 
    // Normalize data for API
    procedure_name: formData.procedure_name?.trim() || undefined,
    surgery_date: formData.surgery_date?.trim() || undefined,
    surgeon_name: formData.surgeon_name?.trim() || undefined,
    // ... other field normalization
  }),
  
  fields: [
    { key: 'procedure_name', label: 'Procedure Name', type: 'text', required: true },
    { key: 'surgery_date', label: 'Surgery Date', type: 'date', required: true },
    { key: 'surgeon_name', label: 'Surgeon', type: 'text' },
    { key: 'hospital_name', label: 'Hospital', type: 'text' },
    { 
      key: 'procedure_type', 
      label: 'Procedure Type', 
      type: 'select',
      options: ProcedureTypeEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'outcome',
      label: 'Outcome', 
      type: 'select',
      options: OutcomeEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    { key: 'complications', label: 'Complications', type: 'textarea', rows: 3 },
    { key: 'recovery_notes', label: 'Recovery Notes', type: 'textarea', rows: 3 }
  ],
  
  hooks: { useUpdate: useUpdateSurgery, useDelete: useDeleteSurgery }
}
```

### **5. SUCCESS CRITERIA**
- **Complete CRUD**: Create surgery → view details → edit → delete
- **Navigation**: Accessible from medical history menu
- **Filtering**: By procedure type and outcome
- **Search**: By procedure name, surgeon, hospital
- **Validation**: Required fields enforced, enums validated
- **Code quality**: Follows 40-line pattern, passes lint rules

### **6. TESTING CHECKLIST**
- [ ] Navigation from `/patient/medhist` works
- [ ] List loads surgeries correctly
- [ ] Create form validates and saves  
- [ ] Detail view shows all fields
- [ ] Edit mode enables and saves
- [ ] Delete confirmation works
- [ ] Filter by procedure type works
- [ ] Search functionality works
- [ ] Export CSV functionality works

**DELIVERABLE**: Complete surgeries stream with verified CRUD functionality following allergies reference pattern.