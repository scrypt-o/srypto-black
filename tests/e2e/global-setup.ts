import { chromium, type FullConfig } from '@playwright/test'

// Programmatic auth: performs a UI login once and saves storageState for reuse.
// Requires TEST_EMAIL and TEST_PASSWORD in env (or uses basic defaults for dev).

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL as string | undefined
  const email = process.env.TEST_EMAIL || 't@t.com'
  const password = process.env.TEST_PASSWORD || 't12345'

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  try {
    await page.goto(`${baseURL || 'http://localhost:4560'}/login`)
    // Fill login form (uses accessible names as in existing tests)
    await page.getByRole('textbox', { name: 'email@example.com' }).fill(email)
    await page.getByRole('textbox', { name: '••••••••' }).fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    // Wait for redirect into app (patient area)
    await page.waitForURL('**/patient', { timeout: 15000 })

    // Persist session cookies for reuse across tests
    await context.storageState({ path: 'tests/e2e/storageState.json' })
  } catch (e) {
    // Save state anyway for diagnostics; tests may still override login per-spec
    await context.storageState({ path: 'tests/e2e/storageState.json' })
  } finally {
    await browser.close()
  }
}

