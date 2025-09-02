/**
 * Allergies API Tests - Based on DDL and working implementation
 * Tests actual API endpoints with authentication and CSRF
 */

describe('Allergies API Integration Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4569'
  const testAllergy = {
    allergen: 'Test API Allergy',
    allergen_type: 'medication',
    severity: 'moderate',
    reaction: 'API test reaction',
    notes: 'Created via automated testing'
  }
  
  let createdAllergyId: string

  describe('POST /api/patient/medhist/allergies', () => {
    test('should create allergy with valid data', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(testAllergy)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.allergy_id).toBeDefined()
      expect(data.allergen).toBe(testAllergy.allergen)
      expect(data.user_id).toBeDefined()
      
      createdAllergyId = data.allergy_id
    })

    test('should return 422 for invalid allergen_type', async () => {
      const invalidData = {
        ...testAllergy,
        allergen_type: 'invalid_type' // Not in DDL enum
      }
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(invalidData)
      })

      expect(response.status).toBe(422)
      const error = await response.json()
      expect(error.error).toBe('Invalid input data')
    })

    test('should return 403 for missing CSRF headers', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Origin header - should trigger CSRF rejection
        },
        credentials: 'include',
        body: JSON.stringify(testAllergy)
      })

      expect(response.status).toBe(403)
    })

    test('should return 401 for unauthenticated request', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        // No credentials - should be unauthenticated
        body: JSON.stringify(testAllergy)
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/patient/medhist/allergies', () => {
    test('should return paginated allergy list', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies?page=1&pageSize=20`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toBeInstanceOf(Array)
      expect(data.total).toBeGreaterThanOrEqual(0)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(20)
    })

    test('should filter by allergen_type', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies?allergen_type=medication`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      // All returned items should have allergen_type = medication
      data.data.forEach((allergy: any) => {
        expect(['medication', null]).toContain(allergy.allergen_type)
      })
    })
  })

  describe('PUT /api/patient/medhist/allergies/[id]', () => {
    test('should update allergy with valid data', async () => {
      if (!createdAllergyId) {
        // Create test allergy first
        const createResponse = await fetch(`${baseUrl}/api/patient/medhist/allergies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Origin': baseUrl },
          credentials: 'include',
          body: JSON.stringify(testAllergy)
        })
        const created = await createResponse.json()
        createdAllergyId = created.allergy_id
      }

      const updateData = {
        allergen: 'Updated Test Allergy',
        notes: 'Updated via API test'
      }

      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies/${createdAllergyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.allergen).toBe(updateData.allergen)
      expect(data.notes).toBe(updateData.notes)
    })

    test('should return 404 for non-existent allergy', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies/${fakeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify({ allergen: 'Test' })
      })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/patient/medhist/allergies/[id]', () => {
    test('should soft delete allergy', async () => {
      if (!createdAllergyId) return // Skip if no test allergy

      const response = await fetch(`${baseUrl}/api/patient/medhist/allergies/${createdAllergyId}`, {
        method: 'DELETE',
        headers: {
          'Origin': baseUrl,
        },
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })
})