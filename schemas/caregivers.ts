import { z } from 'zod'

// Database row type (matches actual schema)
export const CaregiverRowSchema = z.object({
  caregiver_id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().nullable(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  id_number: z.string().nullable(),
  passport_number: z.string().nullable(),
  citizenship: z.string().nullable(),
  relationship: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  emergency_contact: z.string().nullable(),
  access_level: z.string().nullable(),
  permissions: z.any().nullable(), // JSONB type
  is_active: z.boolean().nullable(),
  use_profile_info: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type CaregiverRow = z.infer<typeof CaregiverRowSchema>

// Query parameters for list endpoint
export const CaregiverListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  relationship: z.string().optional(),
  access_level: z.string().optional(),
  emergency_contact: z.string().optional(),
})

// Response shape for list endpoint
export const CaregiverListResponseSchema = z.object({
  data: z.array(CaregiverRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export type CaregiverListQuery = z.infer<typeof CaregiverListQuerySchema>
export type CaregiverListResponse = z.infer<typeof CaregiverListResponseSchema>

// Enum definitions based on expected values
export const RelationshipEnum = z.enum([
  'spouse',
  'parent',
  'child',
  'sibling', 
  'partner',
  'friend',
  'relative',
  'guardian',
  'professional',
  'other'
])

export const AccessLevelEnum = z.enum([
  'full',
  'medical_info_only',
  'emergency_only',
  'limited',
  'none'
])

export const EmergencyContactEnum = z.enum([
  'primary',
  'secondary',
  'tertiary',
  'none'
])

// Form input schema for creating/updating caregivers
export const caregiverFormSchema = z.object({
  title: z.string().optional(),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  id_number: z.string().optional(),
  passport_number: z.string().optional(),
  citizenship: z.string().optional(),
  relationship: RelationshipEnum,
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[0-9\-\s\(\)]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  emergency_contact: EmergencyContactEnum,
  access_level: AccessLevelEnum,
  permissions: z.record(z.boolean()).optional(),
  use_profile_info: z.boolean().optional(),
}).refine(
  (data) => {
    // Require either ID number or passport number
    return data.id_number || data.passport_number
  },
  {
    message: 'Either ID number or passport number is required',
    path: ['id_number']
  }
)

export type CaregiverFormData = z.infer<typeof caregiverFormSchema>

// API input schema for creating caregivers
export const CaregiverCreateInputSchema = z.object({
  title: z.string().optional(),
  first_name: z.string().min(1),
  middle_name: z.string().optional(),
  last_name: z.string().min(1),
  id_number: z.string().optional(),
  passport_number: z.string().optional(),
  citizenship: z.string().optional(),
  relationship: RelationshipEnum,
  phone: z.string().min(1),
  email: z.string().optional(),
  emergency_contact: EmergencyContactEnum,
  access_level: AccessLevelEnum,
  permissions: z.record(z.boolean()).optional(),
  use_profile_info: z.boolean().optional(),
})

export type CaregiverCreateInput = z.infer<typeof CaregiverCreateInputSchema>

// API input schema for updating caregivers
export const CaregiverUpdateInputSchema = CaregiverCreateInputSchema.partial()
export type CaregiverUpdateInput = z.infer<typeof CaregiverUpdateInputSchema>

// List item type for UI display
export interface CaregiverItem {
  id: string
  title: string
  letter: string
  severity: 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'
  thirdColumn: string
  data: CaregiverRow
}

// Helper function to map access level to severity for UI
export function mapAccessLevelToSeverity(accessLevel: string | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' {
  switch (accessLevel) {
    case 'full':
      return 'critical'
    case 'medical_info_only':
      return 'severe'
    case 'emergency_only':
      return 'moderate'
    case 'limited':
      return 'mild'
    case 'none':
    default:
      return 'normal'
  }
}

// Helper function to map emergency contact to priority
export function mapEmergencyContactToPriority(emergencyContact: string | null): number {
  switch (emergencyContact) {
    case 'primary':
      return 1
    case 'secondary':
      return 2
    case 'tertiary':
      return 3
    case 'none':
    default:
      return 4
  }
}