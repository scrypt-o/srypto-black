import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Caregivers API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/care-network/caregivers`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ full_name: 'Test Caregiver' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.caregiver_id).toBeDefined()
    id = json.caregiver_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/care-network/caregivers?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/care-network/caregivers/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.caregiver_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/care-network/caregivers/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ full_name: 'Updated Caregiver' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/care-network/caregivers/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

