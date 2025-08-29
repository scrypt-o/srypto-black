import { describe, it, expect } from '@jest/globals'
import {
  AllergyCreateInputSchema,
  AllergyUpdateInputSchema,
  AllergyListQuerySchema,
  AllergenTypeEnum,
  SeverityEnum,
} from '@/schemas/allergies'

describe('Allergies Zod Schemas', () => {
  it('parses valid create input', () => {
    const parsed = AllergyCreateInputSchema.parse({
      allergen: 'Peanuts',
      allergen_type: AllergenTypeEnum.enum.food,
      severity: SeverityEnum.enum.moderate,
      reaction: 'Hives',
    })
    expect(parsed.allergen).toBe('Peanuts')
  })

  it('rejects invalid create input (missing allergen)', () => {
    expect(() => AllergyCreateInputSchema.parse({
      allergen_type: AllergenTypeEnum.enum.food,
      severity: SeverityEnum.enum.moderate,
    })).toThrow()
  })

  it('parses update input with partial fields', () => {
    const parsed = AllergyUpdateInputSchema.parse({ severity: SeverityEnum.enum.severe })
    expect(parsed.severity).toBe('severe')
  })

  it('list query validates pageSize and enums', () => {
    expect(() => AllergyListQuerySchema.parse({ page: 1, pageSize: 200 })).toThrow()
    expect(() => AllergyListQuerySchema.parse({ page: 1, pageSize: 10, allergen_type: 'bad' } as any)).toThrow()
    const ok = AllergyListQuerySchema.parse({ page: 1, pageSize: 10 })
    expect(ok.pageSize).toBe(10)
  })
})
