import { test, expect } from '@playwright/test'

test.describe('Patient - Prescription Scan (Authenticated)', () => {
  test('upload stub → analyze → success panel visible', async ({ page }) => {
    // API intercept to avoid real AI call
    await page.route('**/api/patient/presc/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          isPrescription: true,
          data: {
            overallConfidence: 87,
            scanQuality: 88,
            medications: [{ name: 'Amoxicillin', dosage: '500mg', frequency: 'BID' }]
          },
          sessionId: 'stub-session',
          uploadedPath: 'stub/path.jpg',
          cost: 0
        })
      })
    })

    await page.goto('/patient/presc/scan')
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Upload Image' }).click(),
    ])
    await chooser.setFiles({ name: 'rx.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]) })

    await expect(page.getByText('Prescription Analyzed Successfully')).toBeVisible()
    await expect(page.getByText(/Medications \(1\)/)).toBeVisible()
  })
})

