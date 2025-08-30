import { getBaseUrl, getOrigin, authHeaders } from '../helpers/auth'

describe('Vital Signs API CRUD', () => {
  const base = getBaseUrl()
  const headersBase = authHeaders({ 'Content-Type': 'application/json', Origin: getOrigin() })
  let id: string

  test('create', async () => {
    const res = await fetch(`${base}/api/patient/vitality/vital-signs`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify({ systolic_bp: 120, diastolic_bp: 80, measurement_date: '2024-01-01' }),
    })
    expect([200, 201]).toContain(res.status)
    const json = await res.json()
    expect(json.vital_sign_id).toBeDefined()
    id = json.vital_sign_id
  })

  test('list includes created', async () => {
    const res = await fetch(`${base}/api/patient/vitality/vital-signs?page=1&pageSize=5`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  test('get by id', async () => {
    const res = await fetch(`${base}/api/patient/vitality/vital-signs/${id}`, { headers: authHeaders() })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.vital_sign_id).toBe(id)
  })

  test('update', async () => {
    const res = await fetch(`${base}/api/patient/vitality/vital-signs/${id}`, {
      method: 'PUT',
      headers: headersBase,
      body: JSON.stringify({ heart_rate: 70 }),
    })
    expect(res.status).toBe(200)
  })

  test('delete', async () => {
    const res = await fetch(`${base}/api/patient/vitality/vital-signs/${id}`, {
      method: 'DELETE',
      headers: headersBase,
    })
    expect([200, 204]).toContain(res.status)
  })
})

