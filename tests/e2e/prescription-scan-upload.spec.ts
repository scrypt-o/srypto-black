import { test, expect } from '@playwright/test'

test.describe('Prescription Scan - Upload Fallback E2E', () => {
  test('upload image → analyze (stubbed) → results visible', async ({ page }) => {
    // Log in
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill('t@t.com')
    await page.getByRole('textbox', { name: '••••••••' }).fill('t12345')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('**/patient')

    // Intercept analyze API and return stubbed success to avoid real AI calls
    await page.route('**/api/patient/presc/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          isPrescription: true,
          data: {
            overallConfidence: 88,
            scanQuality: 90,
            patientName: 'Test',
            patientSurname: 'User',
            medications: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'TID' }]
          },
          sessionId: 'stub-session',
          uploadedPath: 'stub/path.jpg',
          cost: 0
        })
      })
    })

    // Go to scan page
    await page.goto('/patient/presc/scan')

    // Upload a test image via fallback input (hidden input triggered by button)
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: 'Upload Image' }).click(),
    ])
    await fileChooser.setFiles({ name: 'prescription.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]) })

    // Expect results view
    await expect(page.getByText('Prescription Analyzed Successfully')).toBeVisible()
    await expect(page.getByText('Medications (1)')).toBeVisible()
  })
})

