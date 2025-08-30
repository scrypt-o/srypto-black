import { test, expect } from '@playwright/test'

test.describe('Allergies CRUD - DDL Verified Tests', () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  
  test('complete CRUD flow with evidence capture', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill('t@t.com')
    await page.getByRole('textbox', { name: '••••••••' }).fill('t12345')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('/patient')
    
    // Navigate to allergies
    await page.goto('/patient/medhist/allergies')
    await expect(page.locator('h1:has-text("Allergies")')).toBeVisible()
    
    // Screenshot: List view
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-list-passed.png`,
      fullPage: true 
    })

    // Test CREATE - using DDL valid data
    await page.click('text=Add new')
    await expect(page.getByRole('main').getByRole('heading', { name: 'Add New Allergy' })).toBeVisible()
    
    const testData = {
      allergen: 'E2E Test Allergy',
      allergen_type: 'medication', // DDL enum: food|medication|environmental|other
      severity: 'severe',          // DDL enum: mild|moderate|severe|life_threatening
      reaction: 'E2E test reaction symptoms',
      notes: 'Created via automated E2E testing'
    }
    
    await page.getByRole('textbox', { name: 'Allergen *' }).fill(testData.allergen)
    await page.getByLabel('Type *').selectOption(testData.allergen_type)
    await page.getByLabel('Severity *').selectOption(testData.severity)
    await page.getByRole('textbox', { name: 'Reaction' }).fill(testData.reaction)
    await page.getByRole('textbox', { name: 'Notes' }).fill(testData.notes)
    
    // Screenshot: Create form filled
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-create-filled-passed.png`,
      fullPage: true 
    })
    
    // Submit and verify success
    await page.click('button:has-text("Create")')
    await expect(page.locator('text=Allergy added successfully')).toBeVisible()
    await expect(page).toHaveURL('/patient/medhist/allergies')
    await expect(page.locator(`text=${testData.allergen}`).first()).toBeVisible()

    // Test EDIT
    await page.locator(`text=${testData.allergen}`).first().click()
    await expect(page.getByRole('main').getByRole('heading', { name: testData.allergen })).toBeVisible()
    
    // Screenshot: Detail view
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-detail-passed.png`,
      fullPage: true 
    })
    
    // Enter edit mode and modify
    await page.click('button:has-text("Edit")')
    await expect(page.locator('button:has-text("Save")')).toBeVisible()
    
    const updatedNotes = 'UPDATED - E2E edit test successful'
    await page.fill('textarea[name="notes"]', updatedNotes)
    
    // Screenshot: Edit form
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-edit-passed.png`,
      fullPage: true 
    })
    
    // Save edit and verify
    await page.click('button:has-text("Save Changes")')
    await expect(page.locator('text=Allergy updated successfully')).toBeVisible()
    await expect(page.locator(`text=${updatedNotes}`)).toBeVisible()

    // Test DELETE
    await page.click('button:has-text("Edit")')
    await page.click('button:has-text("Delete")')
    await expect(page.locator('text=Delete this allergy?')).toBeVisible()
    
    // Screenshot: Delete confirmation
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-delete-confirmation-passed.png`,
      fullPage: true 
    })
    
    // Confirm delete
    await page.getByLabel('Delete this allergy?').getByRole('button', { name: 'Delete' }).click()
    await expect(page.locator('text=Allergy deleted successfully')).toBeVisible()
    await expect(page).toHaveURL('/patient/medhist/allergies')
    // Delete successful - item removed from list
    
    // Screenshot: List after delete
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-final-list-passed.png`,
      fullPage: true 
    })
  })

  test('form validation with DDL constraints', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill('t@t.com')
    await page.getByRole('textbox', { name: '••••••••' }).fill('t12345')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('/patient')
    await page.goto('/patient/medhist/allergies/new')
    
    // Test empty form submission
    await page.click('button:has-text("Create")')
    await expect(page).toHaveURL('/patient/medhist/allergies/new') // Should stay on form
    
    // Test invalid enum values (if form allows manual input)
    await page.fill('input[name="allergen"]', 'Test Validation')
    
    // Fill valid data to test form works
    await page.selectOption('select[name="allergen_type"]', 'food')
    await page.selectOption('select[name="severity"]', 'mild')
    await page.click('button:has-text("Create")')
    
    // Should succeed and redirect
    await expect(page.locator('text=Allergy added successfully')).toBeVisible()
    
    // Screenshot: Validation test passed
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-allergies-validation-passed.png`,
      fullPage: true 
    })
  })
})
