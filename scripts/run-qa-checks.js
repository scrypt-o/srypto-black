const { chromium } = require('@playwright/test')
const { fetch } = require('undici')

const BASE_URL = process.env.BASE_URL || 'https://qa.scrypto.online'
const ORIGIN = BASE_URL.replace(/\/$/, '')
const email = process.env.TEST_EMAIL || 't@t.com'
const password = process.env.TEST_PASSWORD || 't12345'

async function loginAndGetCookieHeader() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  try {
    await page.goto(ORIGIN + '/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill(email)
    await page.getByRole('textbox', { name: '••••••••' }).fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('**/patient', { timeout: 15000 })
    const cookies = await ctx.cookies()
    const domain = new URL(ORIGIN).hostname
    const filtered = cookies.filter(c => (c.domain || '').includes(domain) || c.domain === domain)
    const header = filtered.map(c => `${c.name}=${c.value}`).join('; ')
    await browser.close()
    return header
  } catch (e) {
    await browser.close()
    throw e
  }
}

async function smokePages(cookie) {
  const routes = [
    '/patient/care-network/caregivers',
    '/patient/persinfo/dependents',
    '/patient/persinfo/emergency-contacts',
    '/patient/medhist/allergies',
    '/patient/medhist/conditions',
    '/patient/medhist/immunizations',
    '/patient/medhist/surgeries',
    '/patient/medhist/family-history',
    '/patient/vitality/vital-signs',
    '/patient/vitality',
  ]
  const results = []
  for (const r of routes) {
    try {
      const res = await fetch(ORIGIN + r, { headers: { Cookie: cookie } })
      results.push({ route: r, status: res.status, ok: res.status === 200 })
    } catch (e) {
      results.push({ route: r, status: 0, ok: false, error: e.message })
    }
  }
  return results
}

function json(res) { return res.json() }

async function runCrud(cookie, cfg) {
  const headers = { 'Content-Type': 'application/json', Origin: ORIGIN, Cookie: cookie }
  const out = { key: cfg.key }
  try {
    // CREATE
    let res = await fetch(ORIGIN + cfg.api, { method: 'POST', headers, body: JSON.stringify(cfg.create) })
    out.create = res.status
    if (!res.ok) return out
    const created = await json(res)
    const id = created[cfg.id]
    if (!id) { out.idMissing = true; return out }

    // LIST
    res = await fetch(ORIGIN + cfg.api + '?page=1&pageSize=5', { headers: { Cookie: cookie } })
    out.list = res.status

    // GET BY ID
    res = await fetch(`${ORIGIN}${cfg.api}/${id}`, { headers: { Cookie: cookie } })
    out.get = res.status

    // UPDATE
    res = await fetch(`${ORIGIN}${cfg.api}/${id}`, { method: 'PUT', headers, body: JSON.stringify(cfg.update) })
    out.update = res.status

    // DELETE
    res = await fetch(`${ORIGIN}${cfg.api}/${id}`, { method: 'DELETE', headers })
    out.delete = res.status

    return out
  } catch (e) {
    out.error = e.message
    return out
  }
}

async function main() {
  const cookie = await loginAndGetCookieHeader()
  const pageResults = await smokePages(cookie)

  const apis = [
    { key: 'caregivers', api: '/api/patient/care-network/caregivers', id: 'caregiver_id', create: { first_name: 'QA', last_name: 'Caregiver', relationship: 'friend', phone: '555-0101', emergency_contact: 'primary', access_level: 'limited', id_number: 'A1234567' }, update: { phone: '555-0102' } },
    { key: 'dependents', api: '/api/patient/personal-info/dependents', id: 'dependent_id', create: { full_name: 'QA Dependent' }, update: { full_name: 'QA Dependent Updated' } },
    { key: 'emergency-contacts', api: '/api/patient/personal-info/emergency-contacts', id: 'contact_id', create: { name: 'QA Contact', phone: '555-0101', relationship: 'friend' }, update: { phone: '555-0102' } },
    { key: 'allergies', api: '/api/patient/medical-history/allergies', id: 'allergy_id', create: { allergen: 'QA Allergen', allergen_type: 'food', severity: 'mild' }, update: { severity: 'moderate' } },
    { key: 'conditions', api: '/api/patient/medical-history/conditions', id: 'condition_id', create: { condition_name: 'QA Condition', severity: 'mild' }, update: { severity: 'severe' } },
    { key: 'immunizations', api: '/api/patient/medical-history/immunizations', id: 'immunization_id', create: { vaccine_name: 'MMR', date_given: '2024-01-01' }, update: { vaccine_name: 'MMR Updated' } },
    { key: 'surgeries', api: '/api/patient/medical-history/surgeries', id: 'surgery_id', create: { surgery_name: 'Appendectomy' }, update: { surgery_name: 'Appendectomy Updated' } },
    { key: 'vital-signs', api: '/api/patient/vitality/vital-signs', id: 'vital_sign_id', create: { systolic_bp: 120, diastolic_bp: 80, measurement_date: '2024-01-01' }, update: { heart_rate: 72 } },
    // Family history omitted unless endpoint contract confirmed
  ]

  const crudResults = []
  for (const cfg of apis) {
    crudResults.push(await runCrud(cookie, cfg))
  }

  console.log(JSON.stringify({ base: ORIGIN, pages: pageResults, apis: crudResults }, null, 2))
}

main().catch(err => {
  console.error('QA checks failed:', err)
  process.exit(1)
})
