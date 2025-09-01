import { z } from 'zod'

// Status enum for active medications
export const MedicationStatusEnum = z.enum(['active', 'paused', 'completed', 'discontinued'])

// Route enum for medication administration  
export const MedicationRouteEnum = z.enum(['oral', 'topical', 'injection', 'inhaled', 'sublingual', 'rectal', 'transdermal'])

// Complete database row schema
export const ActiveMedicationRowSchema = z.object({
  medication_id: z.string().uuid(),
  user_id: z.string().uuid(),
  medication_name: z.string().nullable(),
  dosage: z.string().nullable(),
  frequency: z.string().nullable(),
  route: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  prescriber: z.string().nullable(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
})

// Create input schema
export const ActiveMedicationCreateInputSchema = z.object({
  medication_name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  route: MedicationRouteEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  prescriber: z.string().max(200).optional(),
  status: MedicationStatusEnum.default('active'),
  notes: z.string().optional(),
})

// Update input schema
export const ActiveMedicationUpdateInputSchema = z.object({
  medication_name: z.string().min(1).max(200).optional(),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  route: MedicationRouteEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  prescriber: z.string().max(200).optional(),
  status: MedicationStatusEnum.optional(),
  notes: z.string().optional(),
})

// List query schema
export const ActiveMedicationListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: MedicationStatusEnum.optional(),
  route: MedicationRouteEnum.optional(),
})

// List response schema
export const ActiveMedicationListResponseSchema = z.object({
  data: z.array(ActiveMedicationRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// TypeScript type exports
export type ActiveMedicationRow = z.infer<typeof ActiveMedicationRowSchema>
export type ActiveMedicationCreateInput = z.infer<typeof ActiveMedicationCreateInputSchema>
export type ActiveMedicationUpdateInput = z.infer<typeof ActiveMedicationUpdateInputSchema>
export type ActiveMedicationListQuery = z.infer<typeof ActiveMedicationListQuerySchema>
export type ActiveMedicationListResponse = z.infer<typeof ActiveMedicationListResponseSchema>
export type MedicationStatus = z.infer<typeof MedicationStatusEnum>
export type MedicationRoute = z.infer<typeof MedicationRouteEnum>