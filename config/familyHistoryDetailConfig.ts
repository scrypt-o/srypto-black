import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { FamilyHistoryRow, FamilyHistoryFormData } from '@/schemas/family-history'
import { familyHistoryFormSchema, RelationshipEnum } from '@/schemas/family-history'
import { useUpdateFamilyHistory, useDeleteFamilyHistory } from '@/hooks/usePatientFamilyHistory'

// Transform database row to form data (family history-specific)
const transformRowToFormData = (row: FamilyHistoryRow): FamilyHistoryFormData => ({
  relative: row.relative || '',
  condition: row.condition || '',
  relationship: (row.relationship || '') as FamilyHistoryFormData['relationship'],
  age_at_onset: row.age_at_onset || undefined,
  notes: row.notes || '',
})

// Transform form data to API input format (family history-specific normalization)
const transformFormDataToApiInput = (formData: FamilyHistoryFormData) => ({
  relative: formData.relative?.trim() || undefined,
  condition: formData.condition?.trim() || undefined,
  relationship: formData.relationship || undefined,
  age_at_onset: formData.age_at_onset || undefined,
  notes: formData.notes?.trim() || undefined,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'relative',
    label: 'Relative Name',
    type: 'text',
    required: false,
    placeholder: 'Enter relative name (optional)',
    description: 'Name of family member (for identification)'
  },
  {
    key: 'condition',
    label: 'Medical Condition',
    type: 'text',
    required: true,
    placeholder: 'Enter medical condition',
    description: 'The medical condition or disease'
  },
  {
    key: 'relationship',
    label: 'Relationship',
    type: 'select',
    required: true,
    description: 'Family relationship (affects genetic risk assessment)',
    options: RelationshipEnum.options.map(opt => ({
      value: opt,
      label: opt.charAt(0).toUpperCase() + opt.slice(1)
    }))
  },
  {
    key: 'age_at_onset',
    label: 'Age at Onset',
    type: 'text',
    required: false,
    placeholder: 'Enter age when condition started',
    description: 'Age when the condition was first diagnosed or appeared'
  },
  {
    key: 'notes',
    label: 'Additional Notes',
    type: 'textarea',
    placeholder: 'Additional details about the condition...',
    description: 'Any additional information about the condition or treatment',
    rows: 4
  }
]

// Complete configuration object
export const familyHistoryDetailConfig: DetailFeatureConfig<FamilyHistoryRow, FamilyHistoryFormData> = {
  // Entity identification
  entityName: 'family history record',
  entityNamePlural: 'family history records',
  
  // Routing
  listPath: '/patient/medhist/family-history',
  
  // Form handling
  formSchema: familyHistoryFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateFamilyHistory,
    useDelete: useDeleteFamilyHistory
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}