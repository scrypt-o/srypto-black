import { z } from 'zod'

// Row shape as returned from v_patient__vitality__sleep
export const SleepRowSchema = z.object({
  sleep_id: z.string().uuid(),
  user_id: z.string().uuid(),
  sleep_date: z.string(), // ISO date (YYYY-MM-DD)
  bedtime: z.string().optional(),
  wake_time: z.string().optional(),
  sleep_duration_hours: z.number().nonnegative().max(48).optional(),
  sleep_efficiency_percentage: z.number().min(0).max(100).optional(),
  sleep_quality_rating: z.number().min(1).max(5).optional(),
  rem_minutes: z.number().nonnegative().optional(),
  deep_sleep_minutes: z.number().nonnegative().optional(),
  light_sleep_minutes: z.number().nonnegative().optional(),
  interruptions_count: z.number().int().nonnegative().optional(),
  sleep_environment_rating: z.number().min(1).max(5).optional(),
  sleep_aids_used: z.string().max(200).nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
})

export type SleepRow = z.infer<typeof SleepRowSchema>

export const SleepCreateInputSchema = z.object({
  sleep_date: z.string(),
  bedtime: z.string().optional(),
  wake_time: z.string().optional(),
  sleep_duration_hours: z.number().nonnegative().max(48).optional(),
  sleep_efficiency_percentage: z.number().min(0).max(100).optional(),
  sleep_quality_rating: z.number().min(1).max(5).optional(),
  rem_minutes: z.number().nonnegative().optional(),
  deep_sleep_minutes: z.number().nonnegative().optional(),
  light_sleep_minutes: z.number().nonnegative().optional(),
  interruptions_count: z.number().int().nonnegative().optional(),
  sleep_environment_rating: z.number().min(1).max(5).optional(),
  sleep_aids_used: z.string().max(200).optional(),
  notes: z.string().optional(),
})

export type SleepCreateInput = z.infer<typeof SleepCreateInputSchema>

export const SleepUpdateInputSchema = SleepCreateInputSchema.partial()
export type SleepUpdateInput = z.infer<typeof SleepUpdateInputSchema>

export const SleepListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(), // searches notes/sleep_aids_used
  min_quality: z.coerce.number().int().min(1).max(5).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
})

export const SleepListResponseSchema = z.object({
  data: z.array(SleepRowSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
})

export type SleepListResponse = z.infer<typeof SleepListResponseSchema>

// Simple client-side form schema
export const sleepFormSchema = z.object({
  sleep_date: z.string(),
  bedtime: z.string().optional(),
  wake_time: z.string().optional(),
  sleep_quality_rating: z.coerce.number().int().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
})

