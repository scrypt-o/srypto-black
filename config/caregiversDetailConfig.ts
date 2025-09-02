import type { DetailFeatureConfig } from '@/components/layouts/GenericDetailFeature'
import type { CaregiverRow, CaregiverFormData, CaregiverUpdateInput } from '@/schemas/caregivers'
import { caregiverFormSchema, RelationshipEnum, AccessLevelEnum, EmergencyContactEnum } from '@/schemas/caregivers'
import { useUpdateCaregiver, useDeleteCaregiver } from '@/hooks/usePatientCaregivers'

export const caregiversDetailConfig: DetailFeatureConfig<CaregiverRow, CaregiverFormData> = {
  entityName: 'caregiver',
  entityNamePlural: 'caregivers', 
  listPath: '/patient/carenet/caregivers',
  
  formSchema: caregiverFormSchema,
  
  transformRowToFormData: (row: CaregiverRow): CaregiverFormData => ({
    title: row.title || '',
    first_name: row.first_name || '',
    middle_name: row.middle_name || '',
    last_name: row.last_name || '',
    id_number: row.id_number || '',
    passport_number: row.passport_number || '',
    citizenship: row.citizenship || '',
    relationship: (row.relationship as any) || 'other',
    phone: row.phone || '',
    email: row.email || '',
    emergency_contact: (row.emergency_contact as any) || 'none',
    access_level: (row.access_level as any) || 'limited',
    permissions: row.permissions as Record<string, boolean> || {},
    use_profile_info: row.use_profile_info || false,
  }),
  
  transformFormDataToApiInput: (formData: CaregiverFormData): CaregiverUpdateInput => ({
    title: formData.title?.trim() || undefined,
    first_name: formData.first_name?.trim(),
    middle_name: formData.middle_name?.trim() || undefined,
    last_name: formData.last_name?.trim(),
    id_number: formData.id_number?.trim() || undefined,
    passport_number: formData.passport_number?.trim() || undefined,
    citizenship: formData.citizenship?.trim() || undefined,
    relationship: formData.relationship,
    phone: formData.phone?.trim(),
    email: formData.email?.trim() || undefined,
    emergency_contact: formData.emergency_contact,
    access_level: formData.access_level,
    permissions: formData.permissions,
    use_profile_info: formData.use_profile_info,
  }),
  
  fields: [
    { 
      key: 'title', 
      label: 'Title', 
      type: 'text', 
      description: 'Mr, Mrs, Dr, etc.'
    },
    { 
      key: 'first_name', 
      label: 'First Name', 
      type: 'text', 
      required: true 
    },
    { 
      key: 'middle_name', 
      label: 'Middle Name', 
      type: 'text' 
    },
    { 
      key: 'last_name', 
      label: 'Last Name', 
      type: 'text', 
      required: true 
    },
    { 
      key: 'id_number', 
      label: 'ID Number', 
      type: 'text',
      description: 'National ID number (required if no passport)'
    },
    { 
      key: 'passport_number', 
      label: 'Passport Number', 
      type: 'text',
      description: 'International passport number (required if no ID number)'
    },
    { 
      key: 'citizenship', 
      label: 'Citizenship', 
      type: 'text',
      description: 'Country of citizenship'
    },
    {
      key: 'relationship',
      label: 'Relationship',
      type: 'select',
      required: true,
      options: RelationshipEnum.options.map(opt => ({ 
        value: opt, 
        label: opt.charAt(0).toUpperCase() + opt.slice(1) 
      })),
      description: 'Relationship to the patient'
    },
    { 
      key: 'phone', 
      label: 'Phone Number', 
      type: 'text', 
      required: true,
      description: 'Primary contact phone number'
    },
    { 
      key: 'email', 
      label: 'Email Address', 
      type: 'text',
      description: 'Email address for communication'
    },
    {
      key: 'emergency_contact',
      label: 'Emergency Contact Priority',
      type: 'select',
      required: true,
      options: EmergencyContactEnum.options.map(opt => ({
        value: opt,
        label: opt.charAt(0).toUpperCase() + opt.slice(1)
      })),
      description: 'Priority level for emergency contact'
    },
    {
      key: 'access_level', 
      label: 'Access Level',
      type: 'select',
      required: true,
      options: AccessLevelEnum.options.map(opt => ({ 
        value: opt, 
        label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
      })),
      description: 'Level of access to patient information'
    },
    {
      key: 'use_profile_info',
      label: 'Use Patient Profile Info',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ],
      description: 'Whether to use patient profile information for this caregiver'
    }
  ],
  
  hooks: { 
    useUpdate: useUpdateCaregiver, 
    useDelete: useDeleteCaregiver 
  }
}