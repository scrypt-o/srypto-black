import { test, expect } from '@playwright/test'

test.describe('Patient - Location Nearest Services (Authenticated)', () => {
  test('page renders and shows location module', async ({ page }) => {
    await page.goto('/patient/location/nearest-services')
    // Header/title area
    await expect(page.getByText('Location')).toBeVisible()
    // If API keys are missing, feature shows a disabled message (acceptable for smoke)
    const disabled = page.getByText('Location services are currently disabled.')
    if (await disabled.count()) {
      await expect(disabled).toBeVisible()
    } else {
      // Otherwise, basic UI controls should exist
      await expect(page.getByRole('button', { name: /Find|Search/ })).toBeVisible()
    }
  })
})

