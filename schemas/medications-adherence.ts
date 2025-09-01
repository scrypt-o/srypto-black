import { z } from 'zod'

// Adherence status enum
export const AdherenceStatusEnum = z.enum(['taken', 'taken_late', 'taken_early', 'missed', 'skipped'])

// Complete database row schema for adherence tracking
export const AdherenceTrackingRowSchema = z.object({
  adherence_id: z.string().uuid(),
  user_id: z.string().uuid(),
  medication_id: z.string().uuid().nullable(),
  medication_name: z.string().nullable(),
  scheduled_time: z.string().nullable(),
  actual_time: z.string().nullable(),
  status: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
})

// Create input schema
export const AdherenceTrackingCreateInputSchema = z.object({
  medication_id: z.string().uuid().optional(),
  medication_name: z.string().min(1).max(200),
  scheduled_time: z.string().optional(),
  actual_time: z.string().optional(),
  status: AdherenceStatusEnum,
  notes: z.string().optional(),
})

// Update input schema
export const AdherenceTrackingUpdateInputSchema = z.object({
  medication_id: z.string().uuid().optional(),
  medication_name: z.string().min(1).max(200).optional(),
  scheduled_time: z.string().optional(),
  actual_time: z.string().optional(),
  status: AdherenceStatusEnum.optional(),
  notes: z.string().optional(),
})

// List query schema
export const AdherenceTrackingListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: AdherenceStatusEnum.optional(),
})

// List response schema
export const AdherenceTrackingListResponseSchema = z.object({
  data: z.array(AdherenceTrackingRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// TypeScript type exports
export type AdherenceTrackingRow = z.infer<typeof AdherenceTrackingRowSchema>
export type AdherenceTrackingCreateInput = z.infer<typeof AdherenceTrackingCreateInputSchema>
export type AdherenceTrackingUpdateInput = z.infer<typeof AdherenceTrackingUpdateInputSchema>
export type AdherenceTrackingListQuery = z.infer<typeof AdherenceTrackingListQuerySchema>
export type AdherenceTrackingListResponse = z.infer<typeof AdherenceTrackingListResponseSchema>
export type AdherenceStatus = z.infer<typeof AdherenceStatusEnum>