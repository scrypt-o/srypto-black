import { z } from 'zod'

// Enum values matching database constraints from DDL spec
export const SiteEnum = z.enum(['left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'oral', 'nasal'])
export const RouteEnum = z.enum(['intramuscular', 'subcutaneous', 'oral', 'intranasal', 'intradermal'])

// Complete database row - all columns from patient__medhist__immunizations table
export const ImmunizationRowSchema = z.object({
  immunization_id: z.string().uuid(),
  user_id: z.string().uuid(),
  vaccine_name: z.string().nullable(),
  vaccine_code: z.string().nullable(),
  date_given: z.string().nullable(), // Date as ISO string
  provider_name: z.string().nullable(),
  batch_number: z.string().nullable(),
  site: z.string().nullable(),
  route: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
  is_active: z.boolean().nullable().default(true),
})

// Input for creating a new immunization (exclude auto-generated fields)
export const ImmunizationCreateInputSchema = z.object({
  vaccine_name: z.string().min(1).max(500),
  vaccine_code: z.string().optional(),
  date_given: z.string().optional(), // Date as YYYY-MM-DD
  provider_name: z.string().optional(),
  batch_number: z.string().optional(),
  site: SiteEnum.optional(),
  route: RouteEnum.optional(),
  notes: z.string().optional(),
})

// Input for updating an existing immunization
export const ImmunizationUpdateInputSchema = z.object({
  vaccine_name: z.string().min(1).max(500).optional(),
  vaccine_code: z.string().optional(),
  date_given: z.string().optional(), // Date as YYYY-MM-DD
  provider_name: z.string().optional(),
  batch_number: z.string().optional(),
  site: SiteEnum.optional(),
  route: RouteEnum.optional(),
  notes: z.string().optional(),
})

// Query parameters for list endpoint
export const ImmunizationListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  vaccine_code: z.string().optional(),
})

// Response shape for list endpoint
export const ImmunizationListResponseSchema = z.object({
  data: z.array(ImmunizationRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const immunizationFormSchema = z.object({
  vaccine_name: z.string().min(1, 'Vaccine name is required').max(500),
  vaccine_code: z.string().optional(),
  date_given: z.string().optional(), // Date as YYYY-MM-DD
  provider_name: z.string().optional(),
  batch_number: z.string().optional(),
  site: SiteEnum.optional(),
  route: RouteEnum.optional(),
  notes: z.string().optional(),
})

// Type exports for use in TypeScript
export type ImmunizationRow = z.infer<typeof ImmunizationRowSchema>
export type ImmunizationCreateInput = z.infer<typeof ImmunizationCreateInputSchema>
export type ImmunizationUpdateInput = z.infer<typeof ImmunizationUpdateInputSchema>
export type ImmunizationListQuery = z.infer<typeof ImmunizationListQuerySchema>
export type ImmunizationListResponse = z.infer<typeof ImmunizationListResponseSchema>
export type Site = z.infer<typeof SiteEnum>
export type Route = z.infer<typeof RouteEnum>
export type ImmunizationFormData = z.infer<typeof immunizationFormSchema>