# Zod Validation — Revised

## Rules
- Use snake_case keys mirroring DB columns (`allergen_type`, `created_at`).
- Prefer enums for constrained fields.
- Inputs: trim strings; map empty strings to `undefined` for optional fields.

## Schemas (`schemas/allergies.ts`)
```ts
export const AllergenTypeEnum = z.enum(['food','medication','environmental','other'])
export const SeverityEnum = z.enum(['mild','moderate','severe','life_threatening'])

export const AllergyRowSchema = z.object({
  allergy_id: z.string().uuid(),
  user_id: z.string().uuid(),
  allergen: z.string().nullable(),
  allergen_type: z.string().nullable(),       // Optional: tighten to AllergenTypeEnum.nullable()
  severity: z.string().nullable(),            // Optional: tighten to SeverityEnum.nullable()
  reaction: z.string().nullable(),
  first_observed: z.string().nullable(),
  notes: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
  trigger_factors: z.string().nullable(),
  emergency_action_plan: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const AllergyCreateInputSchema = z.object({
  allergen: z.string().min(1).max(200),
  allergen_type: AllergenTypeEnum,
  severity: SeverityEnum,
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(),
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})

export const AllergyUpdateInputSchema = z.object({
  allergen: z.string().min(1).max(200).optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(),
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})

export const AllergyListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
})

export const AllergyListResponseSchema = z.object({
  data: z.array(AllergyRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})
```

## API Validation
- Parse query via `AllergyListQuerySchema.extend({ sort_by, sort_dir })`.
- Parse body via `AllergyCreateInputSchema`/`AllergyUpdateInputSchema`.
- On Zod errors, return `422` with `details`.

