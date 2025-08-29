import { test, expect } from '@playwright/test'

test.describe('Allergies UI E2E', () => {
  test('list → new → save → detail → edit → save', async ({ page, baseURL }) => {
    await page.goto('/patient/medhist/allergies')
    // Add new
    await page.getByRole('button', { name: /add new/i }).click()
    // Fill form
    await page.getByLabel(/Allergen/i).fill('Cashew Nuts')
    await page.getByLabel(/^Type/i).selectOption('food')
    await page.getByLabel(/^Severity/i).selectOption('moderate')
    await page.getByLabel(/^Reaction/i).fill('Swelling')
    // Save
    await page.getByRole('button', { name: /save/i }).click()
    // Expect back on list
    await expect(page).toHaveURL(/allergies$/)
    await expect(page.getByText('Cashew Nuts')).toBeVisible()

    // Open detail
    await page.getByText('Cashew Nuts').first().click()
    await expect(page.getByRole('heading', { name: /cashew nuts/i })).toBeVisible()
    // Edit
    await page.getByRole('button', { name: /^edit$/i }).click()
    await page.getByLabel(/^Reaction/i).fill('Swelling + Itch')
    await page.getByRole('button', { name: /^save$/i }).click()
    await expect(page.getByText('Swelling + Itch')).toBeVisible()
  })
})
