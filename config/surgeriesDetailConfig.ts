import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { SurgeryRow, SurgeryFormData } from '@/schemas/surgeries'
import { surgeryFormSchema, SurgeryTypeEnum, OutcomeEnum } from '@/schemas/surgeries'
import { useUpdateSurgery, useDeleteSurgery } from '@/hooks/usePatientSurgeries'

// Transform database row to form data (surgery-specific)
const transformRowToFormData = (row: SurgeryRow): SurgeryFormData => ({
  surgery_name: row.surgery_name || '',
  surgery_type: (row.surgery_type || '') as SurgeryFormData['surgery_type'],
  surgery_date: row.surgery_date || '',
  hospital_name: row.hospital_name || '',
  surgeon_name: row.surgeon_name || '',
  surgeon_practice_number: row.surgeon_practice_number || '',
  anesthetist_name: row.anesthetist_name || '',
  procedure_code: row.procedure_code || '',
  complications: row.complications || '',
  recovery_notes: row.recovery_notes || '',
  outcome: (row.outcome || '') as SurgeryFormData['outcome'],
  related_condition_id: row.related_condition_id || '',
})

// Transform form data to API input format (surgery-specific normalization)
const transformFormDataToApiInput = (formData: SurgeryFormData) => ({
  surgery_name: formData.surgery_name?.trim() || undefined,
  surgery_type: formData.surgery_type || undefined,
  surgery_date: formData.surgery_date?.trim() || undefined,
  hospital_name: formData.hospital_name?.trim() || undefined,
  surgeon_name: formData.surgeon_name?.trim() || undefined,
  surgeon_practice_number: formData.surgeon_practice_number?.trim() || undefined,
  anesthetist_name: formData.anesthetist_name?.trim() || undefined,
  procedure_code: formData.procedure_code?.trim() || undefined,
  complications: formData.complications?.trim() || undefined,
  recovery_notes: formData.recovery_notes?.trim() || undefined,
  outcome: formData.outcome || undefined,
  related_condition_id: formData.related_condition_id?.trim() || undefined,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'surgery_name',
    label: 'Procedure Name',
    type: 'text',
    required: true,
    placeholder: 'Enter procedure name',
    description: 'Name of the surgical procedure'
  },
  {
    key: 'surgery_type',
    label: 'Surgery Type',
    type: 'select',
    description: 'Category of surgical procedure',
    options: SurgeryTypeEnum.options.map(opt => ({ value: opt, label: opt }))
  },
  {
    key: 'surgery_date',
    label: 'Surgery Date',
    type: 'date',
    description: 'Date the surgery was performed'
  },
  {
    key: 'hospital_name',
    label: 'Hospital/Facility',
    type: 'text',
    placeholder: 'Enter hospital name',
    description: 'Where the surgery was performed'
  },
  {
    key: 'surgeon_name',
    label: 'Surgeon',
    type: 'text',
    placeholder: 'Enter surgeon name',
    description: 'Primary surgeon who performed the procedure'
  },
  {
    key: 'surgeon_practice_number',
    label: 'Surgeon Practice Number',
    type: 'text',
    placeholder: 'Practice number',
    description: 'Medical practice registration number'
  },
  {
    key: 'anesthetist_name',
    label: 'Anesthetist',
    type: 'text',
    placeholder: 'Enter anesthetist name',
    description: 'Anesthetist who provided anesthesia'
  },
  {
    key: 'procedure_code',
    label: 'Procedure Code',
    type: 'text',
    placeholder: 'Medical coding',
    description: 'Medical procedure code (CPT/ICD)'
  },
  {
    key: 'outcome',
    label: 'Outcome',
    type: 'select',
    description: 'Result of the surgical procedure',
    options: OutcomeEnum.options.map(opt => ({ 
      value: opt, 
      label: opt.replace('_', ' ') 
    }))
  },
  {
    key: 'complications',
    label: 'Complications',
    type: 'textarea',
    placeholder: 'Describe any complications',
    description: 'Any complications that occurred during or after surgery',
    rows: 3
  },
  {
    key: 'recovery_notes',
    label: 'Recovery Notes',
    type: 'textarea',
    placeholder: 'Recovery progress notes',
    description: 'Notes about post-operative recovery',
    rows: 3
  }
]

// Complete configuration object
export const surgeriesDetailConfig: DetailFeatureConfig<SurgeryRow, SurgeryFormData> = {
  // Entity identification
  entityName: 'surgery',
  entityNamePlural: 'surgeries',
  
  // Routing
  listPath: '/patient/medhist/surgeries',
  
  // Form handling
  formSchema: surgeryFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateSurgery,
    useDelete: useDeleteSurgery
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}