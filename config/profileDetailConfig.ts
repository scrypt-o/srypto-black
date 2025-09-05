import type { DetailFeatureConfig, DetailField } from '@/components/layouts/GenericDetailFeature'
import type { ProfileRow, ProfileFormData, ProfileUpdateInput } from '@/schemas/profile'
import { profileFormSchema } from '@/schemas/profile'
import { useUpdateProfile, useDeleteProfile } from '@/hooks/usePatientProfile'

// Transform DB row to UI form defaults
const transformRowToFormData = (row: ProfileRow): ProfileFormData => ({
  first_name: row.first_name || '',
  last_name: row.last_name || '',
  title: row.title || '',
  middle_name: row.middle_name || '',
  nick_name: row.nick_name || '',
  // Heuristic: African if citizenship is an AU country, default false if unknown
  // For now, expose explicit toggle in the form; initial toggle defaults based on citizenship string
  is_african_citizen: !!(row.citizenship && AFRICAN_COUNTRIES.has(row.citizenship.toLowerCase())),
  id_number: row.id_number || '',
  passport_number: row.passport_number || '',
  citizenship: row.citizenship || '',
  date_of_birth: row.date_of_birth || '',
  gender: (row.gender as any) || undefined,
  marital_status: (row.marital_status as any) || undefined,
  phone: row.phone || '',
  email: row.email || '',
  primary_language: row.primary_language || '',
})

// Transform UI form values to API input
const transformFormDataToApiInput = (form: ProfileFormData): ProfileUpdateInput => ({
  first_name: form.first_name.trim(),
  last_name: form.last_name.trim(),
  title: form.title?.trim() || undefined,
  middle_name: form.middle_name?.trim() || undefined,
  nick_name: form.nick_name?.trim() || undefined,
  id_number: form.is_african_citizen ? (form.id_number?.trim() || undefined) : undefined,
  passport_number: !form.is_african_citizen ? (form.passport_number?.trim() || undefined) : undefined,
  citizenship: form.citizenship?.trim() || undefined,
  date_of_birth: form.date_of_birth || undefined,
  gender: form.gender,
  marital_status: form.marital_status,
  phone: form.phone?.trim() || undefined,
  email: form.email?.trim() || undefined,
  primary_language: form.primary_language?.trim() || undefined,
})

// Minimal AU country lookup (lowercase)
const AFRICAN_COUNTRIES = new Set([
  'south africa','nigeria','kenya','ghana','egypt','ethiopia','uganda','tanzania','algeria','morocco','tunisia','cameroon','angola','ivory coast','cote d\'ivoire','senegal','zimbabwe','zambia','mozambique','namibia','botswana','rwanda'
])

export const profileDetailFields: DetailField[] = [
  { key: 'first_name', label: 'First Name', type: 'text', required: true },
  { key: 'last_name', label: 'Last Name', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'select', options: [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' },
    { value: 'Rev', label: 'Rev' },
  ]},
  { key: 'nick_name', label: 'Nickname', type: 'text' },
  { key: 'middle_name', label: 'Middle Name', type: 'text' },
  { key: 'is_african_citizen', label: 'African Citizen', type: 'checkbox', description: 'Toggle to specify if you are an African citizen' },
  { key: 'id_number', label: 'ID Number', type: 'text', description: 'Required if African citizen', visibleIf: (v) => !!v.is_african_citizen },
  { key: 'passport_number', label: 'Passport Number', type: 'text', description: 'Required if NOT African citizen', visibleIf: (v) => !v.is_african_citizen },
  { key: 'citizenship', label: 'Citizenship', type: 'text' },
  { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  { key: 'gender', label: 'Gender', type: 'select', options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ]},
  { key: 'marital_status', label: 'Marital Status', type: 'select', options: [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
  ]},
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'primary_language', label: 'Primary Language', type: 'text' },
]

export const profileDetailConfig: DetailFeatureConfig<ProfileRow, ProfileFormData> = {
  entityName: 'profile',
  entityNamePlural: 'profile',
  listPath: '/patient/persinfo',
  formSchema: profileFormSchema,
  transformRowToFormData,
  transformFormDataToApiInput,
  fields: profileDetailFields,
  hooks: {
    useUpdate: useUpdateProfile,
    useDelete: useDeleteProfile,
  },
  defaultLayout: 'stacked',
}
