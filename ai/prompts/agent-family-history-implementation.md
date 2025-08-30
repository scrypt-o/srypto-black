# Agent Prompt: Implement Patient Medical History Family History Stream

## TASK OVERVIEW
Implement complete patient/medhist/family-history stream following the verified allergies reference pattern.

## MANDATORY REQUIREMENTS

### **1. READ SPECIFICATIONS FIRST**
- **Start**: `ai/specs/README.md` for reading order
- **Core**: Read `ai/specs/core/01-09` in sequence
- **Process**: Follow `ai/specs/STREAM-IMPLEMENTATION-GUIDE.md` exactly  
- **Reference**: Copy pattern from `ai/specs/ALLERGIES-REFERENCE-PATTERN.md`

### **2. VERIFY DATABASE SCHEMA**
- **Table**: `patient__medhist__family_history`
- **View**: `v_patient__medhist__family_history`
- **DDL**: Check `ai/specs/ddl/patient__medhist__family_history_ddl.md`
- **Verify**: Use Supabase MCP to confirm table/view exists and column names match DDL

### **3. URL STRUCTURE**
- **List**: `/patient/medhist/family-history` 
- **Create**: `/patient/medhist/family-history/new`
- **Detail**: `/patient/medhist/family-history/[id]`
- **API**: `/api/patient/medical-history/family-history`

### **4. EXPECTED FIELD MAPPINGS** (Based on Family History Context)
```typescript
// Expected primary fields for family history
{
  family_history_id: 'Primary key',
  relative_name: 'Name of family member',
  relationship: 'Enum: parent|sibling|grandparent|aunt_uncle|cousin|child',
  condition_name: 'Medical condition they had/have',
  age_of_onset: 'Age when condition started',
  current_status: 'Enum: active|resolved|deceased|unknown',
  genetic_risk: 'Enum: high|moderate|low|unknown',
  notes: 'Additional family medical information'
}
```

### **5. CONFIGURATION TEMPLATES**

#### List Configuration:
```typescript
// config/familyHistoryListConfig.ts
export const familyHistoryListConfig: ListFeatureConfig = {
  entityName: 'family history record',
  entityNamePlural: 'family history',
  basePath: '/patient/medhist/family-history',
  
  transformRowToItem: (row: FamilyHistoryRow): FamilyHistoryItem => ({
    id: row.family_history_id,
    title: `${row.relative_name || 'Unknown'} - ${row.condition_name || 'Unknown condition'}`,
    letter: row.relative_name?.slice(0, 2).toUpperCase() || '??',
    severity: mapGeneticRisk(row.genetic_risk), // high=critical, moderate=moderate, low=mild
    thirdColumn: row.relationship,
    data: row
  }),
  
  filterFields: [
    {
      key: 'relationship',
      label: 'Relationship',
      options: RelationshipEnum.options.map(opt => ({ value: opt, label: opt.replace('_', ' ') }))
    },
    {
      key: 'genetic_risk', 
      label: 'Genetic Risk',
      options: GeneticRiskEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'current_status',
      label: 'Status',
      options: StatusEnum.options.map(opt => ({ value: opt, label: opt }))
    }
  ],
  
  hooks: { useDelete: useDeleteFamilyHistory },
  searchPlaceholder: 'Search family history...',
  pageTitle: 'Family History',
  thirdColumnLabel: 'Relationship'
}
```

#### Detail Configuration:
```typescript
// config/familyHistoryDetailConfig.ts
export const familyHistoryDetailConfig: DetailFeatureConfig = {
  entityName: 'family history record', 
  entityNamePlural: 'family history',
  listPath: '/patient/medhist/family-history',
  
  formSchema: familyHistoryFormSchema,
  transformRowToFormData: (row) => ({ /* DDL mappings */ }),
  transformFormDataToApiInput: (formData) => ({
    relative_name: formData.relative_name?.trim() || undefined,
    relationship: formData.relationship || undefined, 
    condition_name: formData.condition_name?.trim() || undefined,
    age_of_onset: formData.age_of_onset?.trim() || undefined,
    current_status: formData.current_status || undefined,
    genetic_risk: formData.genetic_risk || undefined,
    notes: formData.notes?.trim() || undefined,
  }),
  
  fields: [
    { key: 'relative_name', label: 'Relative Name', type: 'text', required: true },
    { 
      key: 'relationship', 
      label: 'Relationship', 
      type: 'select', 
      required: true,
      options: RelationshipEnum.options.map(opt => ({ value: opt, label: opt.replace('_', ' ') }))
    },
    { key: 'condition_name', label: 'Medical Condition', type: 'text', required: true },
    { key: 'age_of_onset', label: 'Age of Onset', type: 'text', placeholder: 'Age when condition started' },
    {
      key: 'current_status',
      label: 'Current Status',
      type: 'select',
      options: StatusEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'genetic_risk',
      label: 'Genetic Risk',
      type: 'select', 
      options: GeneticRiskEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    { key: 'notes', label: 'Additional Notes', type: 'textarea', rows: 4 }
  ],
  
  hooks: { useUpdate: useUpdateFamilyHistory, useDelete: useDeleteFamilyHistory }
}
```

### **6. SUCCESS CRITERIA**
- **Family tree functionality**: List shows relative relationships clearly
- **Risk assessment**: Genetic risk levels properly displayed with severity colors
- **Medical tracking**: Conditions and onset ages captured
- **Search capability**: Find by relative name, condition, or relationship
- **Complete CRUD**: Full create/read/update/delete cycle

### **7. SPECIAL CONSIDERATIONS**
- **Display format**: Show relative name + condition in title for clarity
- **Severity mapping**: Map genetic_risk to UI severity (high=critical, moderate=moderate, low=mild)
- **Relationship labels**: Convert snake_case to readable (aunt_uncle → "Aunt/Uncle")
- **Date handling**: Age of onset may be age number or date

**DELIVERABLE**: Complete family history stream enabling genetic risk tracking and family medical condition management.