import { z } from 'zod'

// Enum values for relationship types - common relationships for dependents
export const RelationshipEnum = z.enum([
  'spouse', 
  'child', 
  'parent', 
  'sibling', 
  'partner', 
  'guardian', 
  'other'
])

// Title enum for personal titles
export const TitleEnum = z.enum(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Master', 'Miss'])

// Complete database row - all columns from patient__persinfo__dependents table
export const DependentRowSchema = z.object({
  dependent_id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string(),
  relationship: z.string().nullable(),
  date_of_birth: z.string().nullable(), // Date as ISO string
  id_number: z.string().nullable(),
  medical_aid_number: z.string().nullable(),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string().nullable(), // Timestamp as ISO string
  title: z.string().nullable(),
  first_name: z.string().nullable(),
  middle_name: z.string().nullable(),
  last_name: z.string().nullable(),
  passport_number: z.string().nullable(),
  citizenship: z.string().nullable(),
  use_profile_info: z.boolean().nullable().default(false),
  is_active: z.boolean().nullable().default(true),
})

// Input for creating a new dependent (exclude auto-generated fields)
export const DependentCreateInputSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  relationship: RelationshipEnum.optional(),
  date_of_birth: z.string().optional(), // Date as YYYY-MM-DD
  id_number: z.string().max(20).optional(),
  medical_aid_number: z.string().max(50).optional(),
  title: TitleEnum.optional(),
  first_name: z.string().max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  passport_number: z.string().max(20).optional(),
  citizenship: z.string().max(100).optional(),
  use_profile_info: z.boolean().optional().default(false),
})

// Input for updating an existing dependent
export const DependentUpdateInputSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200).optional(),
  relationship: RelationshipEnum.optional(),
  date_of_birth: z.string().optional(), // Date as YYYY-MM-DD
  id_number: z.string().max(20).optional(),
  medical_aid_number: z.string().max(50).optional(),
  title: TitleEnum.optional(),
  first_name: z.string().max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  passport_number: z.string().max(20).optional(),
  citizenship: z.string().max(100).optional(),
  use_profile_info: z.boolean().optional(),
})

// Query parameters for list endpoint
export const DependentListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  relationship: RelationshipEnum.optional(),
  citizenship: z.string().optional(),
})

// Response shape for list endpoint
export const DependentListResponseSchema = z.object({
  data: z.array(DependentRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const dependentFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200),
  relationship: RelationshipEnum.optional(),
  date_of_birth: z.string().optional(), // Date as YYYY-MM-DD
  id_number: z.string().max(20).optional(),
  medical_aid_number: z.string().max(50).optional(),
  title: TitleEnum.optional(),
  first_name: z.string().max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name: z.string().max(100).optional(),
  passport_number: z.string().max(20).optional(),
  citizenship: z.string().max(100).optional(),
  use_profile_info: z.coerce.boolean().default(false),
})

// Type exports for use in TypeScript
export type DependentRow = z.infer<typeof DependentRowSchema>
export type DependentCreateInput = z.infer<typeof DependentCreateInputSchema>
export type DependentUpdateInput = z.infer<typeof DependentUpdateInputSchema>
export type DependentListQuery = z.infer<typeof DependentListQuerySchema>
export type DependentListResponse = z.infer<typeof DependentListResponseSchema>
export type Relationship = z.infer<typeof RelationshipEnum>
export type Title = z.infer<typeof TitleEnum>
export type DependentFormData = z.infer<typeof dependentFormSchema>