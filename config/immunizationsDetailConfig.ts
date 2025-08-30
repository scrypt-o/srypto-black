import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { ImmunizationRow, ImmunizationFormData } from '@/schemas/immunizations'
import { immunizationFormSchema, InjectionSiteEnum, AdministrationRouteEnum } from '@/schemas/immunizations'
import { useUpdateImmunization, useDeleteImmunization } from '@/hooks/usePatientImmunizations'

// Transform database row to form data (immunization-specific)
const transformRowToFormData = (row: ImmunizationRow): ImmunizationFormData => ({
  vaccine_name: row.vaccine_name || '',
  vaccine_code: row.vaccine_code || '',
  date_given: row.date_given || '',
  provider_name: row.provider_name || '',
  batch_number: row.batch_number || '',
  site: (row.site || '') as ImmunizationFormData['site'],
  route: (row.route || '') as ImmunizationFormData['route'],
  notes: row.notes || '',
})

// Transform form data to API input format (immunization-specific normalization)
const transformFormDataToApiInput = (formData: ImmunizationFormData) => ({
  vaccine_name: formData.vaccine_name?.trim() || undefined,
  vaccine_code: formData.vaccine_code?.trim() || undefined,
  date_given: formData.date_given?.trim() || undefined,
  provider_name: formData.provider_name?.trim() || undefined,
  batch_number: formData.batch_number?.trim() || undefined,
  site: formData.site || undefined,
  route: formData.route || undefined,
  notes: formData.notes?.trim() || undefined,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'vaccine_name',
    label: 'Vaccine Name',
    type: 'text',
    required: true,
    placeholder: 'Enter vaccine name',
    description: 'Name of the vaccine administered'
  },
  {
    key: 'vaccine_code',
    label: 'Vaccine Code',
    type: 'text',
    placeholder: 'Enter vaccine code',
    description: 'Vaccine identification code'
  },
  {
    key: 'date_given',
    label: 'Date Given',
    type: 'date',
    description: 'When the vaccine was administered'
  },
  {
    key: 'provider_name',
    label: 'Healthcare Provider',
    type: 'text',
    placeholder: 'Enter provider name',
    description: 'Name of administering healthcare provider'
  },
  {
    key: 'batch_number',
    label: 'Batch Number',
    type: 'text',
    placeholder: 'Enter batch/lot number',
    description: 'Vaccine batch or lot number for tracking'
  },
  {
    key: 'site',
    label: 'Injection Site',
    type: 'select',
    description: 'Location where vaccine was administered',
    options: InjectionSiteEnum.options.map((opt: string) => ({ 
      value: opt, 
      label: opt.replace('_', ' ') 
    }))
  },
  {
    key: 'route',
    label: 'Route of Administration',
    type: 'select',
    description: 'Method of vaccine administration',
    options: AdministrationRouteEnum.options.map((opt: string) => ({ 
      value: opt, 
      label: opt.replace('_', ' ') 
    }))
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Additional notes',
    description: 'Any additional notes about the immunization',
    rows: 3
  }
]

// Complete configuration object
export const immunizationsDetailConfig: DetailFeatureConfig<ImmunizationRow, ImmunizationFormData> = {
  // Entity identification
  entityName: 'immunization',
  entityNamePlural: 'immunizations',
  
  // Routing
  listPath: '/patient/medhist/immunizations',
  
  // Form handling
  formSchema: immunizationFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateImmunization,
    useDelete: useDeleteImmunization
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}