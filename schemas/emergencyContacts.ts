import { z } from 'zod'

// Enum values matching database constraints from DDL
export const RelationshipEnum = z.enum([
  'spouse', 
  'parent', 
  'child', 
  'sibling', 
  'partner', 
  'friend', 
  'relative', 
  'guardian', 
  'caregiver', 
  'other'
])

// Complete database row - all columns from patient__persinfo__emrg_contacts table
export const EmergencyContactRowSchema = z.object({
  contact_id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string(),
  relationship: RelationshipEnum.nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  is_primary: z.boolean().nullable().default(false),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
  address: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
  alternative_phone: z.string().nullable(),
})

// Input for creating a new emergency contact (exclude auto-generated fields)
export const EmergencyContactCreateInputSchema = z.object({
  name: z.string().min(1).max(200),
  relationship: RelationshipEnum.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  is_primary: z.boolean().default(false),
  address: z.string().optional(),
  alternative_phone: z.string().optional(),
}).refine(
  (data) => data.phone || data.email,
  {
    message: "At least one contact method (phone or email) is required",
    path: ["phone"],
  }
)

// Input for updating an existing emergency contact
export const EmergencyContactUpdateInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  relationship: RelationshipEnum.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  is_primary: z.boolean().optional(),
  address: z.string().optional(),
  alternative_phone: z.string().optional(),
})

// Query parameters for list endpoint
export const EmergencyContactListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  relationship: RelationshipEnum.optional(),
  is_primary: z.boolean().optional(),
})

// Response shape for list endpoint
export const EmergencyContactListResponseSchema = z.object({
  data: z.array(EmergencyContactRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const emergencyContactFormSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(200),
  relationship: RelationshipEnum.optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  is_primary: z.coerce.boolean().default(false),
  address: z.string().optional(),
  alternative_phone: z.string().optional(),
}).refine(
  (data) => data.phone || data.email,
  {
    message: "At least one contact method (phone or email) is required",
    path: ["phone"],
  }
)

// Type exports for use in TypeScript
export type EmergencyContactRow = z.infer<typeof EmergencyContactRowSchema>
export type EmergencyContactCreateInput = z.infer<typeof EmergencyContactCreateInputSchema>
export type EmergencyContactUpdateInput = z.infer<typeof EmergencyContactUpdateInputSchema>
export type EmergencyContactListQuery = z.infer<typeof EmergencyContactListQuerySchema>
export type EmergencyContactListResponse = z.infer<typeof EmergencyContactListResponseSchema>
export type Relationship = z.infer<typeof RelationshipEnum>
export type EmergencyContactFormData = z.infer<typeof emergencyContactFormSchema>