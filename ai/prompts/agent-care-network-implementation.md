# Agent Prompt: Implement Patient Care Network Stream

## TASK OVERVIEW
Implement complete patient/care-network/caregivers stream following the verified allergies reference pattern.

## MANDATORY REQUIREMENTS

### **1. READ SPECIFICATIONS FIRST**
- **Start**: `ai/specs/README.md` for reading order
- **Core**: Read `ai/specs/core/01-09` in sequence
- **Process**: Follow `ai/specs/STREAM-IMPLEMENTATION-GUIDE.md` exactly
- **Reference**: Copy pattern from `ai/specs/ALLERGIES-REFERENCE-PATTERN.md`

### **2. VERIFY DATABASE SCHEMA**
- **Table**: `patient__care__caregivers`
- **View**: `v_patient__care__caregivers`
- **DDL**: Check `ai/specs/ddl/patient__care__caregivers_ddl.md`
- **Verify**: Use Supabase MCP to confirm table/view exists and column names match DDL

### **3. URL STRUCTURE**
- **List**: `/patient/care-network/caregivers`
- **Create**: `/patient/care-network/caregivers/new`
- **Detail**: `/patient/care-network/caregivers/[id]`
- **API**: `/api/patient/care-network/caregivers`

### **4. EXPECTED FIELD MAPPINGS** (Based on Care Network Context)
```typescript
// Expected primary fields for caregivers
{
  caregiver_id: 'Primary key',
  caregiver_name: 'Full name of caregiver',
  caregiver_surname: 'Last name',
  relationship: 'Enum: spouse|parent|child|sibling|friend|professional|other',
  caregiver_type: 'Enum: primary|secondary|emergency|medical|legal',
  phone_primary: 'Main contact number',
  phone_secondary: 'Alternative contact', 
  email: 'Email address',
  address: 'Physical address',
  emergency_contact: 'Boolean - available for emergencies',
  medical_decision_authority: 'Boolean - can make medical decisions',
  availability: 'Text - when available to help',
  special_instructions: 'Care instructions or notes'
}
```

### **5. CONFIGURATION TEMPLATES**

#### List Configuration:
```typescript
// config/caregiversListConfig.ts
export const caregiversListConfig: ListFeatureConfig = {
  entityName: 'caregiver',
  entityNamePlural: 'caregivers',
  basePath: '/patient/care-network/caregivers',
  
  transformRowToItem: (row: CaregiverRow): CaregiverItem => ({
    id: row.caregiver_id,
    title: `${row.caregiver_name || ''} ${row.caregiver_surname || ''}`.trim() || 'Unknown Caregiver',
    letter: (row.caregiver_name?.slice(0, 1) + (row.caregiver_surname?.slice(0, 1) || '')).toUpperCase() || '??',
    severity: mapCaregiverType(row.caregiver_type), // primary=critical, emergency=severe, secondary=moderate
    thirdColumn: row.relationship,
    data: row
  }),
  
  filterFields: [
    {
      key: 'relationship',
      label: 'Relationship',
      options: RelationshipEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'caregiver_type',
      label: 'Caregiver Type', 
      options: CaregiverTypeEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'emergency_contact',
      label: 'Emergency Contact',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    }
  ],
  
  hooks: { useDelete: useDeleteCaregiver },
  searchPlaceholder: 'Search caregivers...',
  pageTitle: 'Care Network',
  thirdColumnLabel: 'Relationship'
}
```

#### Detail Configuration:
```typescript
// config/caregiversDetailConfig.ts
export const caregiversDetailConfig: DetailFeatureConfig = {
  entityName: 'caregiver',
  entityNamePlural: 'caregivers',
  listPath: '/patient/care-network/caregivers',
  
  formSchema: caregiverFormSchema,
  transformRowToFormData: (row) => ({ /* DDL mappings */ }),
  transformFormDataToApiInput: (formData) => ({
    caregiver_name: formData.caregiver_name?.trim() || undefined,
    caregiver_surname: formData.caregiver_surname?.trim() || undefined,
    relationship: formData.relationship || undefined,
    caregiver_type: formData.caregiver_type || undefined,
    phone_primary: formData.phone_primary?.trim() || undefined,
    phone_secondary: formData.phone_secondary?.trim() || undefined,
    email: formData.email?.trim() || undefined,
    address: formData.address?.trim() || undefined,
    emergency_contact: formData.emergency_contact === 'true',
    medical_decision_authority: formData.medical_decision_authority === 'true',
    availability: formData.availability?.trim() || undefined,
    special_instructions: formData.special_instructions?.trim() || undefined,
  }),
  
  fields: [
    { key: 'caregiver_name', label: 'First Name', type: 'text', required: true },
    { key: 'caregiver_surname', label: 'Last Name', type: 'text', required: true },
    {
      key: 'relationship',
      label: 'Relationship',
      type: 'select',
      required: true,
      options: RelationshipEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    {
      key: 'caregiver_type', 
      label: 'Caregiver Type',
      type: 'select',
      required: true,
      options: CaregiverTypeEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    { key: 'phone_primary', label: 'Primary Phone', type: 'text', required: true },
    { key: 'phone_secondary', label: 'Secondary Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea', rows: 2 },
    {
      key: 'emergency_contact',
      label: 'Emergency Contact',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      key: 'medical_decision_authority',
      label: 'Medical Decision Authority',
      type: 'select', 
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    { key: 'availability', label: 'Availability', type: 'textarea', rows: 2 },
    { key: 'special_instructions', label: 'Special Instructions', type: 'textarea', rows: 3 }
  ],
  
  hooks: { useUpdate: useUpdateCaregiver, useDelete: useDeleteCaregiver }
}
```

### **6. SUCCESS CRITERIA**
- **Contact management**: Phone, email, address tracking
- **Authority levels**: Emergency contact and medical decision permissions
- **Relationship tracking**: Family vs professional caregivers
- **Quick access**: Emergency contact filtering and search
- **Communication**: Clear availability and instruction notes

### **7. SPECIAL CONSIDERATIONS**
- **Privacy sensitive**: Caregiver contact information requires careful handling
- **Emergency access**: Quick filtering for emergency contacts
- **Authority indicators**: Clear display of medical decision authority
- **Contact validation**: Proper phone/email format validation in forms
- **Type hierarchy**: Primary > Emergency > Secondary caregiver priority

**DELIVERABLE**: Complete care network management enabling comprehensive caregiver coordination and emergency contact management.