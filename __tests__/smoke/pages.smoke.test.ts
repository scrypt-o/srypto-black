import { getBaseUrl, authHeaders } from '../helpers/auth'

const routes = [
  // Lists
  '/patient/care-network/caregivers',
  '/patient/persinfo/dependents',
  '/patient/persinfo/emergency-contacts',
  '/patient/medhist/allergies',
  '/patient/medhist/conditions',
  '/patient/medhist/immunizations',
  '/patient/medhist/surgeries',
  '/patient/medhist/family-history',
  '/patient/vitality/vital-signs',
  // Hubs
  '/patient/vitality',
]

describe('Pages smoke (SSR 200)', () => {
  const base = getBaseUrl()
  const headers = authHeaders()
  test.each(routes)('%s responds 200', async (route) => {
    const res = await fetch(base + route, { headers })
    expect(res.status).toBe(200)
    // Basic sanity: HTML response
    const ct = res.headers.get('content-type') || ''
    expect(ct.includes('text/html') || ct.includes('text')).toBe(true)
  })
})

