import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Surgeries API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/surgeries`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ surgery_name: 'Appendectomy' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.surgery_id).toBeDefined()
    id = json.surgery_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/surgeries?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/surgeries/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.surgery_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/surgeries/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ surgery_name: 'Appendectomy (Updated)' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/medical-history/surgeries/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

