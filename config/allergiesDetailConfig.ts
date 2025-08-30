import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { AllergyRow, AllergyFormData } from '@/schemas/allergies'
import { allergyFormSchema, AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useUpdateAllergy, useDeleteAllergy } from '@/hooks/usePatientAllergies'

// Transform database row to form data (allergy-specific)
const transformRowToFormData = (row: AllergyRow): AllergyFormData => ({
  allergen: row.allergen || '',
  allergen_type: (row.allergen_type || '') as AllergyFormData['allergen_type'],
  severity: (row.severity || '') as AllergyFormData['severity'],
  reaction: row.reaction || '',
  first_observed: row.first_observed || '',
  trigger_factors: row.trigger_factors || '',
  emergency_action_plan: row.emergency_action_plan || '',
  notes: row.notes || '',
})

// Transform form data to API input format (allergy-specific normalization)
const transformFormDataToApiInput = (formData: AllergyFormData) => ({
  allergen: formData.allergen?.trim() || undefined,
  allergen_type: formData.allergen_type || undefined,
  severity: formData.severity || undefined,
  reaction: formData.reaction?.trim() || undefined,
  first_observed: formData.first_observed?.trim() || undefined,
  trigger_factors: formData.trigger_factors?.trim() || undefined,
  emergency_action_plan: formData.emergency_action_plan?.trim() || undefined,
  notes: formData.notes?.trim() || undefined,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'allergen',
    label: 'Allergen',
    type: 'text',
    required: true,
    placeholder: 'Enter allergen name',
    description: 'The substance causing the reaction'
  },
  {
    key: 'allergen_type',
    label: 'Type',
    type: 'select',
    required: true,
    description: 'Category of allergen',
    options: AllergenTypeEnum.options.map(opt => ({ value: opt, label: opt }))
  },
  {
    key: 'severity',
    label: 'Severity',
    type: 'select',
    required: true,
    description: 'Reaction severity level',
    options: SeverityEnum.options.map(opt => ({ 
      value: opt, 
      label: opt.replace('_', ' ') 
    }))
  },
  {
    key: 'reaction',
    label: 'Reaction',
    type: 'textarea',
    placeholder: 'Describe symptoms',
    description: 'Physical symptoms experienced',
    rows: 3
  },
  {
    key: 'first_observed',
    label: 'First Observed',
    type: 'date',
    description: 'When first noticed'
  },
  {
    key: 'trigger_factors',
    label: 'Trigger Factors',
    type: 'textarea',
    placeholder: 'What triggers this',
    description: 'Conditions that trigger reactions',
    rows: 2
  },
  {
    key: 'emergency_action_plan',
    label: 'Emergency Plan',
    type: 'textarea',
    placeholder: 'Action plan',
    description: 'Steps for severe reactions',
    rows: 3
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes',
    description: 'Any additional notes',
    rows: 3
  }
]

// Complete configuration object
export const allergiesDetailConfig: DetailFeatureConfig<AllergyRow, AllergyFormData> = {
  // Entity identification
  entityName: 'allergy',
  entityNamePlural: 'allergies',
  
  // Routing
  listPath: '/patient/medhist/allergies',
  
  // Form handling
  formSchema: allergyFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateAllergy,
    useDelete: useDeleteAllergy
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}