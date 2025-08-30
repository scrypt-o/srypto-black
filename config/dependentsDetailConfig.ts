import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { DependentRow, DependentFormData } from '@/schemas/dependents'
import { dependentFormSchema, RelationshipEnum, TitleEnum } from '@/schemas/dependents'
import { useUpdateDependent, useDeleteDependent } from '@/hooks/usePatientDependents'

// Transform database row to form data (dependent-specific)
const transformRowToFormData = (row: DependentRow): DependentFormData => ({
  full_name: row.full_name || '',
  relationship: (row.relationship || '') as DependentFormData['relationship'],
  date_of_birth: row.date_of_birth || '',
  id_number: row.id_number || '',
  medical_aid_number: row.medical_aid_number || '',
  title: (row.title || '') as DependentFormData['title'],
  first_name: row.first_name || '',
  middle_name: row.middle_name || '',
  last_name: row.last_name || '',
  passport_number: row.passport_number || '',
  citizenship: row.citizenship || '',
  use_profile_info: row.use_profile_info || false,
})

// Transform form data to API input format (dependent-specific normalization)
const transformFormDataToApiInput = (formData: DependentFormData) => ({
  full_name: formData.full_name?.trim() || undefined,
  relationship: formData.relationship || undefined,
  date_of_birth: formData.date_of_birth?.trim() || undefined,
  id_number: formData.id_number?.trim() || undefined,
  medical_aid_number: formData.medical_aid_number?.trim() || undefined,
  title: formData.title || undefined,
  first_name: formData.first_name?.trim() || undefined,
  middle_name: formData.middle_name?.trim() || undefined,
  last_name: formData.last_name?.trim() || undefined,
  passport_number: formData.passport_number?.trim() || undefined,
  citizenship: formData.citizenship?.trim() || undefined,
  use_profile_info: formData.use_profile_info || false,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'full_name',
    label: 'Full Name',
    type: 'text',
    required: true,
    placeholder: 'Enter full name',
    description: 'Complete name as it appears on documents'
  },
  {
    key: 'relationship',
    label: 'Relationship',
    type: 'select',
    description: 'Relationship to patient',
    options: RelationshipEnum.options.map(opt => ({ 
      value: opt, 
      label: opt.charAt(0).toUpperCase() + opt.slice(1) 
    }))
  },
  {
    key: 'date_of_birth',
    label: 'Date of Birth',
    type: 'date',
    description: 'Date of birth'
  },
  {
    key: 'title',
    label: 'Title',
    type: 'select',
    description: 'Personal title',
    options: TitleEnum.options.map(opt => ({ value: opt, label: opt }))
  },
  {
    key: 'first_name',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter first name',
    description: 'Given name'
  },
  {
    key: 'middle_name',
    label: 'Middle Name',
    type: 'text',
    placeholder: 'Enter middle name',
    description: 'Middle name (optional)'
  },
  {
    key: 'last_name',
    label: 'Last Name', 
    type: 'text',
    placeholder: 'Enter last name',
    description: 'Family name'
  },
  {
    key: 'id_number',
    label: 'ID Number',
    type: 'text',
    placeholder: 'Enter ID number',
    description: 'National ID or identification number'
  },
  {
    key: 'passport_number',
    label: 'Passport Number',
    type: 'text',
    placeholder: 'Enter passport number',
    description: 'Passport identification number'
  },
  {
    key: 'citizenship',
    label: 'Citizenship',
    type: 'text',
    placeholder: 'Enter citizenship',
    description: 'Country of citizenship'
  },
  {
    key: 'medical_aid_number',
    label: 'Medical Aid Number',
    type: 'text',
    placeholder: 'Enter medical aid number',
    description: 'Health insurance member number'
  },
  {
    key: 'use_profile_info',
    label: 'Use Profile Information',
    type: 'checkbox',
    description: 'Use patient profile information where applicable'
  }
]

// Complete configuration object
export const dependentsDetailConfig: DetailFeatureConfig<DependentRow, DependentFormData> = {
  // Entity identification
  entityName: 'dependent',
  entityNamePlural: 'dependents',
  
  // Routing
  listPath: '/patient/persinfo/dependents',
  
  // Form handling
  formSchema: dependentFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateDependent,
    useDelete: useDeleteDependent
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}