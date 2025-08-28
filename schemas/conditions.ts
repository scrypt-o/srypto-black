import { z } from 'zod'

// Enum values matching database constraints from DDL spec
export const SeverityEnum = z.enum(['mild', 'moderate', 'severe', 'critical'])
export const CurrentStatusEnum = z.enum(['active', 'resolved', 'chronic', 'remission'])

// Complete database row - all columns from patient__medhist__conditions table
export const ConditionRowSchema = z.object({
  condition_id: z.string().uuid(),
  user_id: z.string().uuid(),
  condition_name: z.string().nullable(),
  icd10_code: z.string().nullable(),
  other_standard_codes: z.string().nullable(),
  diagnosis_date: z.string().nullable(), // Date as ISO string
  diagnosis_doctor_name: z.string().nullable(),
  diagnosis_doctor_surname: z.string().nullable(),
  practice_number: z.string().nullable(),
  severity: z.string().nullable(),
  treatment: z.string().nullable(),
  current_status: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
  related_allergies_id: z.string().uuid().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
})

// Input for creating a new condition (exclude auto-generated fields)
export const ConditionCreateInputSchema = z.object({
  condition_name: z.string().min(1).max(500),
  icd10_code: z.string().optional(),
  other_standard_codes: z.string().optional(),
  diagnosis_date: z.string().optional(), // Date as YYYY-MM-DD
  diagnosis_doctor_name: z.string().optional(),
  diagnosis_doctor_surname: z.string().optional(),
  practice_number: z.string().optional(),
  severity: SeverityEnum.optional(),
  treatment: z.string().optional(),
  current_status: CurrentStatusEnum.optional(),
  related_allergies_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

// Input for updating an existing condition
export const ConditionUpdateInputSchema = z.object({
  condition_name: z.string().min(1).max(500).optional(),
  icd10_code: z.string().optional(),
  other_standard_codes: z.string().optional(),
  diagnosis_date: z.string().optional(), // Date as YYYY-MM-DD
  diagnosis_doctor_name: z.string().optional(),
  diagnosis_doctor_surname: z.string().optional(),
  practice_number: z.string().optional(),
  severity: SeverityEnum.optional(),
  treatment: z.string().optional(),
  current_status: CurrentStatusEnum.optional(),
  related_allergies_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

// Query parameters for list endpoint
export const ConditionListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  severity: SeverityEnum.optional(),
  current_status: CurrentStatusEnum.optional(),
})

// Response shape for list endpoint
export const ConditionListResponseSchema = z.object({
  data: z.array(ConditionRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const conditionFormSchema = z.object({
  condition_name: z.string().min(1, 'Condition name is required').max(500),
  icd10_code: z.string().optional(),
  other_standard_codes: z.string().optional(),
  diagnosis_date: z.string().optional(), // Date as YYYY-MM-DD
  diagnosis_doctor_name: z.string().optional(),
  diagnosis_doctor_surname: z.string().optional(),
  practice_number: z.string().optional(),
  severity: SeverityEnum.optional(),
  treatment: z.string().optional(),
  current_status: CurrentStatusEnum.optional(),
  related_allergies_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

// Type exports for use in TypeScript
export type ConditionRow = z.infer<typeof ConditionRowSchema>
export type ConditionCreateInput = z.infer<typeof ConditionCreateInputSchema>
export type ConditionUpdateInput = z.infer<typeof ConditionUpdateInputSchema>
export type ConditionListQuery = z.infer<typeof ConditionListQuerySchema>
export type ConditionListResponse = z.infer<typeof ConditionListResponseSchema>
export type Severity = z.infer<typeof SeverityEnum>
export type CurrentStatus = z.infer<typeof CurrentStatusEnum>
export type ConditionFormData = z.infer<typeof conditionFormSchema>