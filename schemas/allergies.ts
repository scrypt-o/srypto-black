import { z } from 'zod'

// Enum values matching database constraints
export const AllergenTypeEnum = z.enum(['food', 'medication', 'environmental', 'other'])
export const SeverityEnum = z.enum(['mild', 'moderate', 'severe', 'life_threatening'])

// Complete database row - all columns from patient__medhist__allergies table
export const AllergyRowSchema = z.object({
  allergy_id: z.string().uuid(),
  user_id: z.string().uuid(),
  allergen: z.string().nullable(),
  allergen_type: AllergenTypeEnum.nullable(),
  severity: SeverityEnum.nullable(),
  reaction: z.string().nullable(),
  first_observed: z.string().nullable(), // Date as ISO string
  notes: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
  trigger_factors: z.string().nullable(),
  emergency_action_plan: z.string().nullable(),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
})

// Input for creating a new allergy (exclude auto-generated fields)
export const AllergyCreateInputSchema = z.object({
  allergen: z.string().min(1).max(200),
  allergen_type: AllergenTypeEnum,
  severity: SeverityEnum,
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(), // Date as YYYY-MM-DD
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})

// Input for updating an existing allergy
export const AllergyUpdateInputSchema = z.object({
  allergen: z.string().min(1).max(200).optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(), // Date as YYYY-MM-DD
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})

// Query parameters for list endpoint
export const AllergyListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
})

// Response shape for list endpoint
export const AllergyListResponseSchema = z.object({
  data: z.array(AllergyRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const allergyFormSchema = z.object({
  allergen: z.string().min(1, 'Allergen is required').max(200),
  allergen_type: AllergenTypeEnum,
  severity: SeverityEnum,
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(), // Date as YYYY-MM-DD
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})

// Type exports for use in TypeScript
export type AllergyRow = z.infer<typeof AllergyRowSchema>
export type AllergyCreateInput = z.infer<typeof AllergyCreateInputSchema>
export type AllergyUpdateInput = z.infer<typeof AllergyUpdateInputSchema>
export type AllergyListQuery = z.infer<typeof AllergyListQuerySchema>
export type AllergyListResponse = z.infer<typeof AllergyListResponseSchema>
export type AllergenType = z.infer<typeof AllergenTypeEnum>
export type Severity = z.infer<typeof SeverityEnum>
export type AllergyFormData = z.infer<typeof allergyFormSchema>