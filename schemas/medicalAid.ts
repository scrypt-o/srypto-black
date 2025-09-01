import { z } from 'zod'

export const MedicalAidRowSchema = z.object({
  medical_aid_id: z.string().uuid(),
  user_id: z.string().uuid(),
  medical_aid_name: z.string(),
  plan_type: z.string().nullable().optional(),
  member_number: z.string(),
  policy_holder_id: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  dependent_code: z.string().nullable().optional(),
  is_primary_member: z.boolean().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  policy_holder_first_name: z.string().nullable().optional(),
  policy_holder_last_name: z.string().nullable().optional(),
  policy_holder_email: z.string().nullable().optional(),
  policy_holder_phone: z.string().nullable().optional(),
  number_of_dependents: z.number().nullable().optional(),
})

export const MedicalAidUpdateSchema = z.object({
  medical_aid_name: z.string().min(1),
  member_number: z.string().min(1),
  plan_type: z.string().optional(),
  policy_holder_id: z.string().optional(),
  dependent_code: z.string().optional(),
  is_primary_member: z.boolean().optional(),
  policy_holder_first_name: z.string().optional(),
  policy_holder_last_name: z.string().optional(),
  policy_holder_email: z.string().email().optional(),
  policy_holder_phone: z.string().optional(),
  number_of_dependents: z.coerce.number().int().min(0).optional(),
})

export type MedicalAidRow = z.infer<typeof MedicalAidRowSchema>
export type MedicalAidUpdateInput = z.infer<typeof MedicalAidUpdateSchema>

