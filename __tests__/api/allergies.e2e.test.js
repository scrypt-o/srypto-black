// E2E API tests using a real running app server and auth cookies.
// Pre-req: Start the app (e.g., `npm run start:4569`) and ensure cookies.txt contains a valid session for the BASE_URL.

const fs = require('fs')
const path = require('path')
const { fetch } = require('undici')

const BASE_URL = process.env.BASE_URL || 'http://localhost:4569'

function readCookieFile() {
  const p = path.join(process.cwd(), 'cookies.txt')
  if (!fs.existsSync(p)) throw new Error('cookies.txt not found at project root')
  // Parse Netscape cookie file lines into a Cookie header
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/)
  const cookies = []
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue
    const parts = line.split('\t')
    const name = parts[5]
    const value = parts[6]
    if (name && value) cookies.push(`${name}=${value}`)
  }
  return cookies.join('; ')
}

describe('E2E: Allergies API with auth cookie', () => {
  const cookie = readCookieFile()
  const headers = {
    'Content-Type': 'application/json',
    Origin: BASE_URL,
    Referer: BASE_URL + '/',
    Cookie: cookie,
  }

  let createdId = null

  it('creates allergy (201)', async () => {
    const res = await fetch(`${BASE_URL}/api/patient/medical-history/allergies`, {
      method: 'POST', headers, body: JSON.stringify({
        allergen: 'Walnuts', allergen_type: 'food', severity: 'moderate', reaction: 'Rash'
      })
    })
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.allergen).toBe('Walnuts')
    createdId = body.allergy_id
    expect(createdId).toBeTruthy()
  })

  it('updates allergy (200)', async () => {
    if (!createdId) return
    const res = await fetch(`${BASE_URL}/api/patient/medical-history/allergies/${createdId}`, {
      method: 'PUT', headers, body: JSON.stringify({ severity: 'severe' })
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.severity).toBe('severe')
  })

  it('soft deletes allergy (200)', async () => {
    if (!createdId) return
    const res = await fetch(`${BASE_URL}/api/patient/medical-history/allergies/${createdId}`, {
      method: 'DELETE', headers
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})

