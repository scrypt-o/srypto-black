jest.mock('../../../lib/api-helpers', () => ({ verifyCsrf: jest.fn(() => undefined) }))

const notFoundError = { code: 'PGRST116', message: 'No rows' }

const supabaseNF = {
  auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })) },
  from: jest.fn((_table) => ({
    select() { return this },
    single: async () => ({ data: null, error: notFoundError }),
    eq() { return this },
    update() { return this },
  })),
}

jest.mock('../../../lib/supabase-server', () => ({ getServerClient: jest.fn(async () => supabaseNF) }))

const { GET } = require('../../../app/api/patient/medical-history/allergies/[id]/route')
const { PUT } = require('../../../app/api/patient/medical-history/allergies/[id]/route')

describe('Allergies API not found', () => {
  it('GET returns 404 when row missing', async () => {
    const res = await GET({}, { params: Promise.resolve({ id: 'missing' }) })
    expect(res.status).toBe(404)
  })

  it('PUT returns 404 when row missing', async () => {
    const req = { json: async () => ({ severity: 'mild' }) }
    const res = await PUT(req, { params: Promise.resolve({ id: 'missing' }) })
    expect(res.status).toBe(404)
  })
})
