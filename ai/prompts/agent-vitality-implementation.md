# Agent Prompt: Implement Patient Vitality & Vital Signs Stream

## TASK OVERVIEW
Implement complete patient/vitality/vital-signs stream following the verified allergies reference pattern.

## MANDATORY REQUIREMENTS

### **1. READ SPECIFICATIONS FIRST**
- **Start**: `ai/specs/README.md` for reading order
- **Core**: Read `ai/specs/core/01-09` in sequence
- **Process**: Follow `ai/specs/STREAM-IMPLEMENTATION-GUIDE.md` exactly
- **Reference**: Copy pattern from `ai/specs/ALLERGIES-REFERENCE-PATTERN.md`

### **2. VERIFY DATABASE SCHEMA**
- **Table**: `patient__vitality__vital_signs`
- **View**: `v_patient__vitality__vital_signs`
- **DDL**: Check `ai/specs/ddl/patient__vitality__vital_signs_ddl.md`
- **Verify**: Use Supabase MCP to confirm table/view exists and column names match DDL

### **3. URL STRUCTURE**
- **List**: `/patient/vitality/vital-signs`
- **Create**: `/patient/vitality/vital-signs/new`
- **Detail**: `/patient/vitality/vital-signs/[id]`
- **API**: `/api/patient/vitality/vital-signs`

### **4. EXPECTED FIELD MAPPINGS** (Based on Vital Signs Context)
```typescript
// Expected primary fields for vital signs
{
  vital_sign_id: 'Primary key',
  measurement_type: 'Enum: blood_pressure|heart_rate|temperature|weight|height|bmi|oxygen_saturation',
  systolic_value: 'For blood pressure (top number)',
  diastolic_value: 'For blood pressure (bottom number)', 
  measurement_value: 'For single-value measurements',
  measurement_unit: 'Unit of measurement (mmHg, bpm, °C, kg, cm, %)',
  measured_at: 'Timestamp of measurement',
  measured_by: 'Who took the measurement',
  device_used: 'Measurement device/method',
  status: 'Enum: normal|elevated|high|low|critical',
  notes: 'Additional measurement notes'
}
```

### **5. CONFIGURATION TEMPLATES**

#### List Configuration:
```typescript
// config/vitalSignsListConfig.ts
export const vitalSignsListConfig: ListFeatureConfig = {
  entityName: 'vital sign',
  entityNamePlural: 'vital signs',
  basePath: '/patient/vitality/vital-signs',
  
  transformRowToItem: (row: VitalSignRow): VitalSignItem => ({
    id: row.vital_sign_id,
    title: formatVitalSign(row), // "Blood Pressure: 120/80 mmHg" or "Heart Rate: 72 bpm"
    letter: row.measurement_type?.slice(0, 2).toUpperCase() || '??',
    severity: mapVitalStatus(row.status), // normal=normal, elevated=mild, high=severe, critical=critical
    thirdColumn: row.measured_at,
    data: row
  }),
  
  filterFields: [
    {
      key: 'measurement_type',
      label: 'Measurement Type',
      options: MeasurementTypeEnum.options.map(opt => ({ 
        value: opt, 
        label: opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    },
    {
      key: 'status',
      label: 'Status',
      options: VitalStatusEnum.options.map(opt => ({ value: opt, label: opt }))
    }
  ],
  
  hooks: { useDelete: useDeleteVitalSign },
  searchPlaceholder: 'Search vital signs...',
  pageTitle: 'Vital Signs',
  thirdColumnLabel: 'Measured',
  exportHeaders: ['Type', 'Value', 'Unit', 'Status', 'Date', 'Measured By']
}

// Helper function for display formatting
const formatVitalSign = (row: VitalSignRow): string => {
  const type = row.measurement_type?.replace('_', ' ') || 'Unknown'
  
  if (row.measurement_type === 'blood_pressure' && row.systolic_value && row.diastolic_value) {
    return `${type}: ${row.systolic_value}/${row.diastolic_value} ${row.measurement_unit || 'mmHg'}`
  }
  
  if (row.measurement_value) {
    return `${type}: ${row.measurement_value} ${row.measurement_unit || ''}`
  }
  
  return type
}
```

#### Detail Configuration:
```typescript
// config/vitalSignsDetailConfig.ts
export const vitalSignsDetailConfig: DetailFeatureConfig = {
  entityName: 'vital sign',
  entityNamePlural: 'vital signs',
  listPath: '/patient/vitality/vital-signs',
  
  formSchema: vitalSignFormSchema,
  transformRowToFormData: (row) => ({ /* DDL mappings */ }),
  transformFormDataToApiInput: (formData) => ({
    measurement_type: formData.measurement_type || undefined,
    systolic_value: formData.systolic_value ? parseFloat(formData.systolic_value) : undefined,
    diastolic_value: formData.diastolic_value ? parseFloat(formData.diastolic_value) : undefined,
    measurement_value: formData.measurement_value ? parseFloat(formData.measurement_value) : undefined,
    measurement_unit: formData.measurement_unit?.trim() || undefined,
    measured_at: formData.measured_at?.trim() || undefined,
    measured_by: formData.measured_by?.trim() || undefined,
    device_used: formData.device_used?.trim() || undefined,
    status: formData.status || undefined,
    notes: formData.notes?.trim() || undefined,
  }),
  
  fields: [
    {
      key: 'measurement_type',
      label: 'Measurement Type',
      type: 'select',
      required: true,
      options: MeasurementTypeEnum.options.map(opt => ({ 
        value: opt, 
        label: opt.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    },
    { key: 'systolic_value', label: 'Systolic (Top Number)', type: 'text', placeholder: 'For blood pressure' },
    { key: 'diastolic_value', label: 'Diastolic (Bottom Number)', type: 'text', placeholder: 'For blood pressure' },
    { key: 'measurement_value', label: 'Measurement Value', type: 'text', placeholder: 'For single-value measurements' },
    { key: 'measurement_unit', label: 'Unit', type: 'text', placeholder: 'mmHg, bpm, °C, kg, cm, %' },
    { key: 'measured_at', label: 'Measured At', type: 'date', required: true },
    { key: 'measured_by', label: 'Measured By', type: 'text', placeholder: 'Healthcare provider or self' },
    { key: 'device_used', label: 'Device Used', type: 'text', placeholder: 'Blood pressure cuff, scale, etc.' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: VitalStatusEnum.options.map(opt => ({ value: opt, label: opt }))
    },
    { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 }
  ],
  
  hooks: { useUpdate: useUpdateVitalSign, useDelete: useDeleteVitalSign }
}
```

### **6. SPECIAL CONSIDERATIONS**
- **Blood pressure handling**: Both systolic and diastolic values with validation
- **Multiple measurement types**: Different units and value formats
- **Status mapping**: Normal/elevated/high/critical with appropriate severity colors
- **Time tracking**: Precise measurement timestamps important for trends
- **Device tracking**: Equipment used affects measurement accuracy

### **7. SUCCESS CRITERIA**
- **Multi-type support**: Handle blood pressure, heart rate, temperature, weight, etc.
- **Proper formatting**: Display values with units correctly
- **Status indication**: Color-coded normal/elevated/high/critical levels
- **Search functionality**: Find by measurement type, status, date range
- **Data integrity**: Proper number validation for measurement values

**DELIVERABLE**: Complete vital signs stream enabling comprehensive health metrics tracking with proper medical data validation.