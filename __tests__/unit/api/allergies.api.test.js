// Mock NextResponse to avoid Next runtime dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init = {}) => ({ status: init.status ?? 200, json: async () => data }),
  },
}))

jest.mock('../../../lib/api-helpers', () => ({ verifyCsrf: jest.fn(() => undefined) }))

const makeSupabaseMock = () => {
  const mock = {
    auth: {
      getUser: jest.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null })),
    },
    __data: undefined,
  }
  mock.from = jest.fn(function (_table) {
    const self = this
    return {
      select() { return this },
      single: async function () { return { data: self.__data ?? {}, error: null } },
      order() { return this },
      range() { return this },
      ilike() { return this },
      eq() { return this },
      or() { return this },
      insert(obj) { self.__data = { allergy_id: 'a-1', ...obj }; return this },
      update(obj) { self.__data = { allergy_id: 'a-1', ...obj }; return this },
    }
  })
  return mock
}

jest.mock('../../../lib/supabase-server', () => ({
  getServerClient: jest.fn(async () => makeSupabaseMock())
}))

const { POST: createAllergy } = require('../../../app/api/patient/medical-history/allergies/route')
const { PUT: updateAllergy } = require('../../../app/api/patient/medical-history/allergies/[id]/route')

describe('Allergies API', () => {
  it('POST creates an allergy (201)', async () => {
    const body = { allergen: 'Peanuts ', allergen_type: 'food', severity: 'moderate', reaction: 'Hives' }
    const req = { json: async () => body }
    const res = await createAllergy(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.allergen).toBe('Peanuts')
    expect(json.user_id).toBe('user-1')
  })

  it('POST returns 422 on invalid body', async () => {
    const req = { json: async () => ({}) }
    const res = await createAllergy(req)
    expect(res.status).toBe(422)
  })

  it('PUT updates an allergy (200)', async () => {
    const req = { json: async () => ({ severity: 'severe', notes: 'Carry EpiPen ' }) }
    const res = await updateAllergy(req, { params: Promise.resolve({ id: 'a-1' }) })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.severity).toBe('severe')
    expect(json.updated_at).toBeDefined()
  })
})
