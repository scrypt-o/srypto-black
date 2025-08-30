const { chromium } = require('@playwright/test')

async function main() {
  const baseURL = process.env.BASE_URL || 'https://qa.scrypto.online'
  const email = process.env.TEST_EMAIL || 't@t.com'
  const password = process.env.TEST_PASSWORD || 't12345'

  const browser = await chromium.launch()
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  try {
    await page.goto(baseURL + '/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill(email)
    await page.getByRole('textbox', { name: '••••••••' }).fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('**/patient', { timeout: 15000 })
    const cookies = await ctx.cookies()
    const domain = new URL(baseURL).hostname
    const filtered = cookies.filter(c => (c.domain || '').includes(domain) || c.domain === domain)
    const header = filtered.map(c => `${c.name}=${c.value}`).join('; ')
    console.log(header)
  } catch (e) {
    console.error('Failed to fetch cookie header:', e.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()

