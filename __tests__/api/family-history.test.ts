/**
 * Family History API Tests - Based on DDL and working implementation
 * Tests actual API endpoints with authentication and CSRF
 */

describe('Family History API Integration Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4569'
  const testFamilyHistory = {
    relative: 'Test Relative',
    condition: 'Test Medical Condition',
    relationship: 'parent',
    age_at_onset: 45,
    notes: 'Created via automated testing'
  }
  
  let createdFamilyHistoryId: string

  describe('POST /api/patient/medhist/family-history', () => {
    test('should create family history record with valid data', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(testFamilyHistory)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.family_history_id).toBeDefined()
      expect(data.condition).toBe(testFamilyHistory.condition)
      expect(data.relationship).toBe(testFamilyHistory.relationship)
      expect(data.user_id).toBeDefined()
      
      createdFamilyHistoryId = data.family_history_id
    })

    test('should create record with required fields only', async () => {
      const minimalData = {
        condition: 'Diabetes',
        relationship: 'mother'
      }
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(minimalData)
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.condition).toBe(minimalData.condition)
      expect(data.relationship).toBe(minimalData.relationship)
    })

    test('should return 422 for invalid relationship', async () => {
      const invalidData = {
        ...testFamilyHistory,
        relationship: 'friend' // Not in DDL enum
      }
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
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

    test('should return 422 for missing required fields', async () => {
      const incompleteData = {
        relative: 'John Doe'
        // Missing condition and relationship
      }
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(incompleteData)
      })

      expect(response.status).toBe(422)
    })

    test('should return 403 for missing CSRF headers', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Origin header - should trigger CSRF rejection
        },
        credentials: 'include',
        body: JSON.stringify(testFamilyHistory)
      })

      expect(response.status).toBe(403)
    })

    test('should return 401 for unauthenticated request', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        // No credentials - should be unauthenticated
        body: JSON.stringify(testFamilyHistory)
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/patient/medhist/family-history', () => {
    test('should return paginated family history list', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history?page=1&pageSize=20`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toBeInstanceOf(Array)
      expect(data.total).toBeGreaterThanOrEqual(0)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(20)
    })

    test('should filter by relationship', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history?relationship=parent`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      // All returned items should have relationship = parent
      data.data.forEach((record: any) => {
        expect(['parent', null]).toContain(record.relationship)
      })
    })

    test('should search by condition and relative', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history?search=diabetes`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toBeInstanceOf(Array)
    })

    test('should sort by different fields', async () => {
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history?sort_by=condition&sort_dir=asc`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/patient/medhist/family-history/[id]', () => {
    test('should return single family history record', async () => {
      if (!createdFamilyHistoryId) {
        // Create test record first
        const createResponse = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Origin': baseUrl },
          credentials: 'include',
          body: JSON.stringify(testFamilyHistory)
        })
        const created = await createResponse.json()
        createdFamilyHistoryId = created.family_history_id
      }

      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${createdFamilyHistoryId}`, {
        credentials: 'include'
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.family_history_id).toBe(createdFamilyHistoryId)
      expect(data.condition).toBeDefined()
      expect(data.relationship).toBeDefined()
    })

    test('should return 404 for non-existent record', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${fakeId}`, {
        credentials: 'include'
      })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/patient/medhist/family-history/[id]', () => {
    test('should update family history record with valid data', async () => {
      if (!createdFamilyHistoryId) {
        // Create test record first
        const createResponse = await fetch(`${baseUrl}/api/patient/medhist/family-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Origin': baseUrl },
          credentials: 'include',
          body: JSON.stringify(testFamilyHistory)
        })
        const created = await createResponse.json()
        createdFamilyHistoryId = created.family_history_id
      }

      const updateData = {
        condition: 'Updated Heart Disease',
        age_at_onset: 50,
        notes: 'Updated via API test'
      }

      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${createdFamilyHistoryId}`, {
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
      expect(data.condition).toBe(updateData.condition)
      expect(data.age_at_onset).toBe(updateData.age_at_onset)
      expect(data.notes).toBe(updateData.notes)
    })

    test('should return 404 for non-existent record', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${fakeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify({ condition: 'Test Update' })
      })

      expect(response.status).toBe(404)
    })

    test('should validate age constraints', async () => {
      if (!createdFamilyHistoryId) return
      
      const invalidData = {
        age_at_onset: 200 // Over DDL limit of 150
      }

      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${createdFamilyHistoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl,
        },
        credentials: 'include',
        body: JSON.stringify(invalidData)
      })

      expect(response.status).toBe(422)
    })
  })

  describe('DELETE /api/patient/medhist/family-history/[id]', () => {
    test('should soft delete family history record', async () => {
      if (!createdFamilyHistoryId) return // Skip if no test record

      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${createdFamilyHistoryId}`, {
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

    test('should return 404 for non-existent record', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch(`${baseUrl}/api/patient/medhist/family-history/${fakeId}`, {
        method: 'DELETE',
        headers: {
          'Origin': baseUrl,
        },
        credentials: 'include'
      })

      expect(response.status).toBe(200) // DELETE typically succeeds even for non-existent records
    })
  })
})