import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Emergency Contacts API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/persinfo/emergency-contacts`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ name: 'Test Contact', phone: '555-0101', relationship: 'friend' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.contact_id).toBeDefined()
    id = json.contact_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/persinfo/emergency-contacts?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/persinfo/emergency-contacts/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.contact_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/persinfo/emergency-contacts/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ phone: '555-0102' }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/persinfo/emergency-contacts/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

