jest.mock('../../../lib/api-helpers', () => ({ verifyCsrf: jest.fn(() => undefined) }))

const noUserSupabase = {
  auth: { getUser: jest.fn(async () => ({ data: { user: null }, error: null })) },
  from: jest.fn(() => ({ select() { return this }, single: async () => ({ data: null, error: null }) })),
}

jest.mock('../../../lib/supabase-server', () => ({ getServerClient: jest.fn(async () => noUserSupabase) }))

// Require routes AFTER mocks so Supabase SSR ESM is not loaded
const { POST: createAllergy } = require('../../../app/api/patient/medical-history/allergies/route')
const { PUT: updateAllergy } = require('../../../app/api/patient/medical-history/allergies/[id]/route')

describe('Allergies API auth/CSRF', () => {
  it('returns 401 when no user on POST', async () => {
    const req = { json: async () => ({ allergen: 'A', allergen_type: 'food', severity: 'mild' }) }
    const res = await createAllergy(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when CSRF fails', async () => {
    jest.resetModules()
    jest.doMock('../../../lib/api-helpers', () => ({
      verifyCsrf: jest.fn(() => ({ status: 403, json: async () => ({ error: 'Forbidden' }) })),
    }))
    const { POST } = require('../../../app/api/patient/medical-history/allergies/route')
    const res = await POST({ json: async () => ({ allergen: 'A', allergen_type: 'food', severity: 'mild' }) })
    expect(res.status).toBe(403)
  })
})
