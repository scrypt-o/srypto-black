import { 
  FamilyHistoryRowSchema, 
  FamilyHistoryCreateInputSchema, 
  FamilyHistoryUpdateInputSchema,
  FamilyHistoryListQuerySchema,
  RelationshipEnum 
} from '@/schemas/family-history'

describe('Family History Schemas - DDL Based Tests', () => {
  describe('FamilyHistoryCreateInputSchema', () => {
    test('valid family history with required fields should pass', () => {
      const validData = {
        condition: 'Diabetes Type 2',
        relationship: 'parent'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('valid family history with all optional fields should pass', () => {
      const validData = {
        relative: 'John Doe',
        condition: 'Heart Disease',
        relationship: 'father',
        age_at_onset: 55,
        notes: 'Had bypass surgery at age 60'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('missing condition should fail', () => {
      const invalidData = {
        relative: 'John Doe',
        relationship: 'parent'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('missing relationship should fail', () => {
      const invalidData = {
        condition: 'Diabetes',
        relative: 'John Doe'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('invalid relationship enum should fail', () => {
      const invalidData = {
        condition: 'Diabetes',
        relationship: 'friend' // DDL only allows parent|sibling|grandparent|child|aunt|uncle|cousin
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('empty string condition should fail', () => {
      const invalidData = {
        condition: '',
        relationship: 'parent'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('age_at_onset over 150 should fail', () => {
      const invalidData = {
        condition: 'Diabetes',
        relationship: 'parent',
        age_at_onset: 200 // DDL constraint: age between 0-150
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('negative age_at_onset should fail', () => {
      const invalidData = {
        condition: 'Diabetes',
        relationship: 'parent',
        age_at_onset: -5
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('condition longer than 500 chars should fail', () => {
      const longCondition = 'a'.repeat(501) // DDL max length is 500
      const invalidData = {
        condition: longCondition,
        relationship: 'parent'
      }
      const result = FamilyHistoryCreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('FamilyHistoryUpdateInputSchema', () => {
    test('partial update with valid fields should pass', () => {
      const validData = {
        condition: 'Updated Heart Disease',
        notes: 'Updated notes with more details'
      }
      const result = FamilyHistoryUpdateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('empty update object should pass', () => {
      const validData = {}
      const result = FamilyHistoryUpdateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('update with all fields should pass', () => {
      const validData = {
        relative: 'Jane Doe',
        condition: 'Cancer',
        relationship: 'mother',
        age_at_onset: 45,
        notes: 'Breast cancer diagnosed at 45'
      }
      const result = FamilyHistoryUpdateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('FamilyHistoryListQuerySchema', () => {
    test('valid query parameters should pass', () => {
      const validQuery = {
        page: 1,
        pageSize: 20,
        search: 'diabetes',
        relationship: 'parent'
      }
      const result = FamilyHistoryListQuerySchema.safeParse(validQuery)
      expect(result.success).toBe(true)
    })

    test('page size over 100 should fail', () => {
      const queryData = {
        page: 1,
        pageSize: 150 // Should fail - DDL max is 100
      }
      const result = FamilyHistoryListQuerySchema.safeParse(queryData)
      expect(result.success).toBe(false)
    })

    test('zero or negative page should fail', () => {
      const invalidQueries = [
        { page: 0, pageSize: 20 },
        { page: -1, pageSize: 20 }
      ]
      invalidQueries.forEach(query => {
        const result = FamilyHistoryListQuerySchema.safeParse(query)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Enum Definitions', () => {
    test('RelationshipEnum should match DDL constraints', () => {
      const validRelationships = ['parent', 'sibling', 'grandparent', 'child', 'aunt', 'uncle', 'cousin']
      validRelationships.forEach(relationship => {
        const result = RelationshipEnum.safeParse(relationship)
        expect(result.success).toBe(true)
      })
    })

    test('invalid relationships should fail', () => {
      const invalidRelationships = ['friend', 'neighbor', 'spouse', 'colleague']
      invalidRelationships.forEach(relationship => {
        const result = RelationshipEnum.safeParse(relationship)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Row Schema (Database Read)', () => {
    test('valid database row should pass', () => {
      const dbRow = {
        family_history_id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        relative: 'John Doe',
        condition: 'Diabetes Type 2',
        relationship: 'father',
        age_at_onset: 55,
        notes: 'Managed with medication',
        created_at: '2025-08-30T10:00:00Z',
        updated_at: '2025-08-30T10:00:00Z',
        is_active: true
      }
      const result = FamilyHistoryRowSchema.safeParse(dbRow)
      expect(result.success).toBe(true)
    })

    test('missing required UUID fields should fail', () => {
      const invalidRow = {
        relative: 'John Doe',
        condition: 'Diabetes',
        relationship: 'father'
        // Missing family_history_id, user_id, timestamps
      }
      const result = FamilyHistoryRowSchema.safeParse(invalidRow)
      expect(result.success).toBe(false)
    })
  })
})