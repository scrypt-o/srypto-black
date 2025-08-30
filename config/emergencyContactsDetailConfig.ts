import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { EmergencyContactRow, EmergencyContactFormData } from '@/schemas/emergencyContacts'
import { emergencyContactFormSchema, RelationshipEnum } from '@/schemas/emergencyContacts'
import { useUpdateEmergencyContact, useDeleteEmergencyContact } from '@/hooks/usePatientEmergencyContacts'

// Transform database row to form data (emergency contact-specific)
const transformRowToFormData = (row: EmergencyContactRow): EmergencyContactFormData => ({
  name: row.name || '',
  relationship: (row.relationship || undefined) as EmergencyContactFormData['relationship'],
  phone: row.phone || '',
  email: row.email || '',
  is_primary: row.is_primary || false,
  address: row.address || '',
  alternative_phone: row.alternative_phone || '',
})

// Transform form data to API input format (emergency contact-specific normalization)
const transformFormDataToApiInput = (formData: EmergencyContactFormData) => ({
  name: formData.name?.trim() || undefined,
  relationship: formData.relationship || undefined,
  phone: formData.phone?.trim() || undefined,
  email: formData.email?.trim() || undefined,
  is_primary: formData.is_primary || false,
  address: formData.address?.trim() || undefined,
  alternative_phone: formData.alternative_phone?.trim() || undefined,
})

// Field definitions derived from DDL
const fields: DetailField[] = [
  {
    key: 'name',
    label: 'Contact Name',
    type: 'text',
    required: true,
    placeholder: 'Enter contact name',
    description: 'Full name of emergency contact'
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
    key: 'phone',
    label: 'Primary Phone',
    type: 'text',
    placeholder: 'Enter phone number',
    description: 'Primary phone number'
  },
  {
    key: 'alternative_phone',
    label: 'Alternative Phone',
    type: 'text',
    placeholder: 'Enter alternative phone number',
    description: 'Secondary phone number'
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'text',
    placeholder: 'Enter email address',
    description: 'Contact email address'
  },
  {
    key: 'address',
    label: 'Physical Address',
    type: 'textarea',
    placeholder: 'Enter physical address',
    description: 'Complete physical address',
    rows: 3
  },
  {
    key: 'is_primary',
    label: 'Primary Contact',
    type: 'checkbox',
    description: 'This is the primary emergency contact'
  }
]

// Complete configuration object
export const emergencyContactsDetailConfig: DetailFeatureConfig<EmergencyContactRow, EmergencyContactFormData> = {
  // Entity identification
  entityName: 'emergency contact',
  entityNamePlural: 'emergency contacts',
  
  // Routing
  listPath: '/patient/persinfo/emergency-contacts',
  
  // Form handling
  formSchema: emergencyContactFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  
  // Field definitions from DDL
  fields,
  
  // Hooks
  hooks: {
    useUpdate: useUpdateEmergencyContact,
    useDelete: useDeleteEmergencyContact
  },
  
  // UI customization
  enableLayoutToggle: true,
  defaultLayout: 'stacked'
}