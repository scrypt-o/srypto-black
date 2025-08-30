import { 
  AllergyRowSchema, 
  AllergyCreateInputSchema, 
  AllergyUpdateInputSchema,
  AllergyListQuerySchema,
  AllergenTypeEnum,
  SeverityEnum 
} from '@/schemas/allergies'

describe('Allergy Schemas - DDL Based Tests', () => {
  describe('AllergyCreateInputSchema', () => {
    test('valid allergy with required fields should pass', () => {
      const validData = {
        allergen: 'Peanuts',
        allergen_type: 'food',
        severity: 'severe'
      }
      const result = AllergyCreateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('valid allergy with all optional fields should pass', () => {
      const validData = {
        allergen: 'Peanuts',
        allergen_type: 'food', 
        severity: 'severe',
        reaction: 'Swelling and rash',
        first_observed: '2025-01-15',
        notes: 'Avoid all peanut products',
        trigger_factors: 'Direct contact',
        emergency_action_plan: 'Use EpiPen immediately'
      }
      const result = AllergyCreateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('missing allergen should fail', () => {
      const invalidData = {
        allergen_type: 'food',
        severity: 'severe'
      }
      const result = AllergyCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('invalid allergen_type enum should fail', () => {
      const invalidData = {
        allergen: 'Peanuts',
        allergen_type: 'invalid_type', // DDL only allows food|medication|environmental|other
        severity: 'severe'
      }
      const result = AllergyCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('invalid severity enum should fail', () => {
      const invalidData = {
        allergen: 'Peanuts',
        allergen_type: 'food',
        severity: 'invalid_severity' // DDL only allows mild|moderate|severe|life_threatening
      }
      const result = AllergyCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('empty string allergen should fail', () => {
      const invalidData = {
        allergen: '',
        allergen_type: 'food',
        severity: 'severe'
      }
      const result = AllergyCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('AllergyUpdateInputSchema', () => {
    test('partial update with valid fields should pass', () => {
      const validData = {
        allergen: 'Updated Peanuts',
        notes: 'Updated notes'
      }
      const result = AllergyUpdateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('empty update object should pass', () => {
      const validData = {}
      const result = AllergyUpdateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('AllergyListQuerySchema', () => {
    test('valid query parameters should pass', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        search: 'peanuts',
        allergen_type: 'food',
        severity: 'severe'
      }
      const result = AllergyListQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)
    })

    test('page size over 100 should fail', () => {
      const queryData = {
        page: 1,
        pageSize: 150 // Should fail - DDL max is 100
      }
      const result = AllergyListQuerySchema.safeParse(queryData)
      expect(result.success).toBe(false) // Zod should reject this
    })
  })

  describe('Enum Definitions', () => {
    test('AllergenTypeEnum should match DDL constraints', () => {
      const validTypes = ['food', 'medication', 'environmental', 'other']
      validTypes.forEach(type => {
        const result = AllergenTypeEnum.safeParse(type)
        expect(result.success).toBe(true)
      })
    })

    test('SeverityEnum should match DDL constraints', () => {
      const validSeverities = ['mild', 'moderate', 'severe', 'life_threatening']
      validSeverities.forEach(severity => {
        const result = SeverityEnum.safeParse(severity)
        expect(result.success).toBe(true)
      })
    })
  })
})