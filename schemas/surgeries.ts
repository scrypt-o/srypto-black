import { z } from 'zod'

// Enum values matching database constraints from DDL spec
export const SurgeryTypeEnum = z.enum(['elective', 'emergency', 'diagnostic', 'cosmetic', 'reconstructive'])
export const OutcomeEnum = z.enum(['successful', 'complications', 'partial_success', 'failed'])

// Complete database row - all columns from patient__medhist__surgeries table
export const SurgeryRowSchema = z.object({
  surgery_id: z.string().uuid(),
  user_id: z.string().uuid(),
  surgery_name: z.string().nullable(),
  surgery_type: z.string().nullable(),
  surgery_date: z.string().nullable(), // Date as ISO string
  hospital_name: z.string().nullable(),
  surgeon_name: z.string().nullable(),
  surgeon_practice_number: z.string().nullable(),
  anesthetist_name: z.string().nullable(),
  procedure_code: z.string().nullable(),
  complications: z.string().nullable(),
  recovery_notes: z.string().nullable(),
  outcome: z.string().nullable(),
  related_condition_id: z.string().uuid().nullable(),
  is_active: z.boolean().nullable().default(true),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
})

// Input for creating a new surgery (exclude auto-generated fields)
export const SurgeryCreateInputSchema = z.object({
  surgery_name: z.string().min(1).max(500),
  surgery_type: SurgeryTypeEnum.optional(),
  surgery_date: z.string().optional(), // Date as YYYY-MM-DD
  hospital_name: z.string().optional(),
  surgeon_name: z.string().optional(),
  surgeon_practice_number: z.string().optional(),
  anesthetist_name: z.string().optional(),
  procedure_code: z.string().optional(),
  complications: z.string().optional(),
  recovery_notes: z.string().optional(),
  outcome: OutcomeEnum.optional(),
  related_condition_id: z.string().uuid().optional(),
})

// Input for updating an existing surgery
export const SurgeryUpdateInputSchema = z.object({
  surgery_name: z.string().min(1).max(500).optional(),
  surgery_type: SurgeryTypeEnum.optional(),
  surgery_date: z.string().optional(), // Date as YYYY-MM-DD
  hospital_name: z.string().optional(),
  surgeon_name: z.string().optional(),
  surgeon_practice_number: z.string().optional(),
  anesthetist_name: z.string().optional(),
  procedure_code: z.string().optional(),
  complications: z.string().optional(),
  recovery_notes: z.string().optional(),
  outcome: OutcomeEnum.optional(),
  related_condition_id: z.string().uuid().optional(),
})

// Query parameters for list endpoint
export const SurgeryListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  surgery_type: SurgeryTypeEnum.optional(),
  outcome: OutcomeEnum.optional(),
})

// Response shape for list endpoint
export const SurgeryListResponseSchema = z.object({
  data: z.array(SurgeryRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with looser validation for user input)
export const surgeryFormSchema = z.object({
  surgery_name: z.string().min(1, 'Surgery name is required').max(500),
  surgery_type: SurgeryTypeEnum.optional(),
  surgery_date: z.string().optional(), // Date as YYYY-MM-DD
  hospital_name: z.string().optional(),
  surgeon_name: z.string().optional(),
  surgeon_practice_number: z.string().optional(),
  anesthetist_name: z.string().optional(),
  procedure_code: z.string().optional(),
  complications: z.string().optional(),
  recovery_notes: z.string().optional(),
  outcome: OutcomeEnum.optional(),
  related_condition_id: z.string().uuid().optional(),
})

// Type exports for use in TypeScript
export type SurgeryRow = z.infer<typeof SurgeryRowSchema>
export type SurgeryCreateInput = z.infer<typeof SurgeryCreateInputSchema>
export type SurgeryUpdateInput = z.infer<typeof SurgeryUpdateInputSchema>
export type SurgeryListQuery = z.infer<typeof SurgeryListQuerySchema>
export type SurgeryListResponse = z.infer<typeof SurgeryListResponseSchema>
export type SurgeryType = z.infer<typeof SurgeryTypeEnum>
export type Outcome = z.infer<typeof OutcomeEnum>
export type SurgeryFormData = z.infer<typeof surgeryFormSchema>