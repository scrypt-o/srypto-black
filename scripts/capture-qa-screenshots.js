const { chromium, devices } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const BASE_URL = process.env.BASE_URL || 'https://qa.scrypto.online'
const ORIGIN = BASE_URL.replace(/\/$/, '')
const email = process.env.TEST_EMAIL || 't@t.com'
const password = process.env.TEST_PASSWORD || 't12345'
const outDir = path.join(process.cwd(), 'ai/testing/screenshots')

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

function nameFor(route) {
  const parts = route.split('/').filter(Boolean)
  // Use last two segments for specificity when available
  const tail = parts.slice(-2).join('-')
  return tail || 'root'
}

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true })
}

async function main() {
  await ensureDir(outDir)
  const stamp = process.env.DATE_STAMP || new Date().toISOString().slice(0,10).replace(/-/g,'')

  const browser = await chromium.launch()
  try {
    // Desktop first
    const ctxDesktop = await browser.newContext({ ...devices['Desktop Chrome'] })
    const pageDesktop = await ctxDesktop.newPage()
    await pageDesktop.goto(ORIGIN + '/login')
    await pageDesktop.getByRole('textbox', { name: 'email@example.com' }).fill(email)
    await pageDesktop.getByRole('textbox', { name: '••••••••' }).fill(password)
    await pageDesktop.getByRole('button', { name: 'Continue', exact: true }).click()
    await pageDesktop.waitForURL('**/patient', { timeout: 15000 })

    for (const r of routes) {
      const baseName = `${stamp}-${nameFor(r)}`
      await pageDesktop.goto(ORIGIN + r)
      await pageDesktop.waitForLoadState('load')
      await pageDesktop.screenshot({ path: path.join(outDir, `${baseName}-desktop.png`), fullPage: true })
    }
    await ctxDesktop.close()

    // Mobile (iPhone 14-ish)
    const ctxMobile = await browser.newContext({ ...devices['iPhone 14'] })
    const pageMobile = await ctxMobile.newPage()
    await pageMobile.goto(ORIGIN + '/login')
    await pageMobile.getByRole('textbox', { name: 'email@example.com' }).fill(email)
    await pageMobile.getByRole('textbox', { name: '••••••••' }).fill(password)
    await pageMobile.getByRole('button', { name: 'Continue', exact: true }).click()
    await pageMobile.waitForURL('**/patient', { timeout: 15000 })

    for (const r of routes) {
      const baseName = `${stamp}-${nameFor(r)}`
      await pageMobile.goto(ORIGIN + r)
      await pageMobile.waitForLoadState('load')
      await pageMobile.screenshot({ path: path.join(outDir, `${baseName}-mobile.png`), fullPage: true })
    }
    await ctxMobile.close()
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('Screenshot capture failed:', err)
  process.exit(1)
})
