import { z } from 'zod'

// Effectiveness enum for medication history
export const EffectivenessEnum = z.enum(['very_effective', 'effective', 'somewhat_effective', 'not_effective', 'adverse_reaction'])

// Complete database row schema for medication history
export const MedicationHistoryRowSchema = z.object({
  history_id: z.string().uuid(),
  user_id: z.string().uuid(),
  medication_name: z.string().nullable(),
  taken_period: z.string().nullable(),
  reason: z.string().nullable(),
  effectiveness: z.string().nullable(),
  side_effects: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
})

// Create input schema
export const MedicationHistoryCreateInputSchema = z.object({
  medication_name: z.string().min(1).max(200),
  taken_period: z.string().max(100).optional(),
  reason: z.string().max(500).optional(),
  effectiveness: EffectivenessEnum.optional(),
  side_effects: z.string().optional(),
  notes: z.string().optional(),
})

// Update input schema
export const MedicationHistoryUpdateInputSchema = z.object({
  medication_name: z.string().min(1).max(200).optional(),
  taken_period: z.string().max(100).optional(),
  reason: z.string().max(500).optional(),
  effectiveness: EffectivenessEnum.optional(),
  side_effects: z.string().optional(),
  notes: z.string().optional(),
})

// List query schema
export const MedicationHistoryListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  effectiveness: EffectivenessEnum.optional(),
})

// List response schema
export const MedicationHistoryListResponseSchema = z.object({
  data: z.array(MedicationHistoryRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// TypeScript type exports
export type MedicationHistoryRow = z.infer<typeof MedicationHistoryRowSchema>
export type MedicationHistoryCreateInput = z.infer<typeof MedicationHistoryCreateInputSchema>
export type MedicationHistoryUpdateInput = z.infer<typeof MedicationHistoryUpdateInputSchema>
export type MedicationHistoryListQuery = z.infer<typeof MedicationHistoryListQuerySchema>
export type MedicationHistoryListResponse = z.infer<typeof MedicationHistoryListResponseSchema>
export type Effectiveness = z.infer<typeof EffectivenessEnum>