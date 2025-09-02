import { z } from 'zod'

export const GenderEnum = z.enum(['male','female','non-binary','prefer-not-to-say'])
export const MaritalStatusEnum = z.enum(['single','married','divorced','widowed','separated'])

export const ProfileRowSchema = z.object({
  profile_id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  id_number: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  title: z.string().nullable().optional(),
  middle_name: z.string().nullable().optional(),
  passport_number: z.string().nullable().optional(),
  citizenship: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  nick_name: z.string().nullable().optional(),
  marital_status: z.string().nullable().optional(),
  languages_spoken: z.any().nullable().optional(),
  primary_language: z.string().nullable().optional(),
  deceased: z.boolean().nullable().optional(),
  deceased_date: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
  email_in_use: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  max_pharmacy_distance_km: z.number().nullable().optional(),
  location_updated_at: z.string().nullable().optional(),
})

export const ProfileUpdateSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  title: z.string().optional().nullable(),
  middle_name: z.string().optional().nullable(),
  nick_name: z.string().optional().nullable(),
  id_number: z.string().optional().nullable(),
  passport_number: z.string().optional().nullable(),
  citizenship: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.union([GenderEnum, z.literal('')]).optional().nullable().transform(val => val === '' ? undefined : val),
  marital_status: z.union([MaritalStatusEnum, z.literal('')]).optional().nullable().transform(val => val === '' ? undefined : val),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable().refine(
    (val) => !val || val === '' || z.string().email().safeParse(val).success,
    { message: 'Invalid email format' }
  ),
  primary_language: z.string().optional().nullable(),
  languages_spoken: z.array(z.string()).optional().nullable(),
})

export type ProfileRow = z.infer<typeof ProfileRowSchema>
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>

