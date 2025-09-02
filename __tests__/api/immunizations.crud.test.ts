import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Immunizations API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/medhist/immunizations`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ vaccine_name: 'MMR', date_given: '2024-01-01' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.immunization_id).toBeDefined()
    id = json.immunization_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/medhist/immunizations?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/medhist/immunizations/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.immunization_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/medhist/immunizations/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ vaccine_name: 'MMR Updated' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/medhist/immunizations/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

