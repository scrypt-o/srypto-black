import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Allergies API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/allergies`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ allergen: 'Peanuts', allergen_type: 'food', severity: 'mild' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.allergy_id).toBeDefined()
    id = json.allergy_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/allergies?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/allergies/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.allergy_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/allergies/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ severity: 'moderate' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/allergies/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

