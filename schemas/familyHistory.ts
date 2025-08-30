import { z } from 'zod'

// Enum values matching database constraints from DDL
export const RelationshipEnum = z.enum([
  'parent',
  'sibling', 
  'grandparent',
  'child',
  'aunt',
  'uncle',
  'cousin'
])

// Complete database row - all columns from patient__medhist__family_hist table
export const FamilyHistoryRowSchema = z.object({
  family_history_id: z.string().uuid(),
  user_id: z.string().uuid(),
  relative: z.string().nullable(), // Relative's name or identifier
  condition: z.string().nullable(), // Medical condition/disease
  relationship: z.string().nullable(), // Family relationship type
  age_at_onset: z.number().int().nullable(), // Age when condition started
  notes: z.string().nullable(), // Additional notes
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
  is_active: z.boolean().nullable().default(true),
})

// Input for creating a new family history record (exclude auto-generated fields)
export const FamilyHistoryCreateInputSchema = z.object({
  relative: z.string().min(1).max(200),
  condition: z.string().min(1).max(200),
  relationship: RelationshipEnum,
  age_at_onset: z.number().int().min(0).max(150).optional(),
  notes: z.string().optional(),
})

// Input for updating an existing family history record
export const FamilyHistoryUpdateInputSchema = z.object({
  relative: z.string().min(1).max(200).optional(),
  condition: z.string().min(1).max(200).optional(),
  relationship: RelationshipEnum.optional(),
  age_at_onset: z.number().int().min(0).max(150).optional(),
  notes: z.string().optional(),
})

// Query parameters for list endpoint
export const FamilyHistoryListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  relationship: RelationshipEnum.optional(),
})

// Response shape for list endpoint
export const FamilyHistoryListResponseSchema = z.object({
  data: z.array(FamilyHistoryRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const familyHistoryFormSchema = z.object({
  relative: z.string().min(1, 'Relative name is required').max(200),
  condition: z.string().min(1, 'Medical condition is required').max(200),
  relationship: RelationshipEnum,
  age_at_onset: z.number().int().min(0, 'Age must be 0 or greater').max(150, 'Age must be 150 or less').optional(),
  notes: z.string().optional(),
})

// Type exports for use in TypeScript
export type FamilyHistoryRow = z.infer<typeof FamilyHistoryRowSchema>
export type FamilyHistoryCreateInput = z.infer<typeof FamilyHistoryCreateInputSchema>
export type FamilyHistoryUpdateInput = z.infer<typeof FamilyHistoryUpdateInputSchema>
export type FamilyHistoryListQuery = z.infer<typeof FamilyHistoryListQuerySchema>
export type FamilyHistoryListResponse = z.infer<typeof FamilyHistoryListResponseSchema>
export type Relationship = z.infer<typeof RelationshipEnum>
export type FamilyHistoryFormData = z.infer<typeof familyHistoryFormSchema>