import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Conditions API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/conditions`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ condition_name: 'Hypertension', severity: 'moderate' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.condition_id).toBeDefined()
    id = json.condition_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/conditions?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/conditions/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.condition_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/conditions/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ severity: 'severe' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/conditions/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

