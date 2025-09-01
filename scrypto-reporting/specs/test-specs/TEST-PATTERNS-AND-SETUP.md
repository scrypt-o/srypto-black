# Test Patterns and Setup - Complete Guide

**PURPOSE**: Clear instructions for setting up and running tests for any Scrypto stream. Follow these patterns exactly.

---

## TEST FOLDER STRUCTURE

```
__tests__/
  schemas/          # Zod schema validation tests
  api/             # API endpoint integration tests
  unit/            # Legacy unit tests (keep existing)

tests/
  e2e/             # Playwright end-to-end tests

ai/testing/        # Screenshot evidence storage
```

---

## 1. SCHEMA TESTS (DDL-Based)

### File Pattern
`__tests__/schemas/{item}.test.ts`

### Template (Copy for Each Stream)
```ts
import { 
  {Item}RowSchema, 
  {Item}CreateInputSchema, 
  {Item}UpdateInputSchema,
  {Item}ListQuerySchema,
  {EnumName}Enum 
} from '@/schemas/{item}'

describe('{Item} Schemas - DDL Based Tests', () => {
  describe('{Item}CreateInputSchema', () => {
    test('valid {item} with required fields should pass', () => {
      const validData = {
        // Use EXACT field names from DDL
        // Use valid enum values from DDL constraints
      }
      const result = {Item}CreateInputSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    test('missing required field should fail', () => {
      const invalidData = {
        // Missing required field from DDL
      }
      const result = {Item}CreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    test('invalid enum value should fail', () => {
      const invalidData = {
        field_name: 'invalid_value' // Not in DDL enum constraints
      }
      const result = {Item}CreateInputSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Enum Definitions', () => {
    test('{EnumName}Enum should match DDL constraints', () => {
      const validValues = ['value1', 'value2'] // From DDL CHECK constraints
      validValues.forEach(value => {
        const result = {EnumName}Enum.safeParse(value)
        expect(result.success).toBe(true)
      })
    })
  })
})
```

### How to Create
1. **Read DDL file**: `ai/specs/ddl/{domain}__{group}__{item}_ddl.md`
2. **Extract constraints**: Required fields, enum values, data types
3. **Create test data**: Valid examples using DDL enum values
4. **Test invalid data**: Missing required fields, invalid enums

### Run Command
```bash
npm run test:unit -- __tests__/schemas/{item}.test.ts
```

---

## 2. API TESTS (Integration)

### File Pattern  
`__tests__/api/{item}.test.ts`

### Template (Copy for Each Stream)
```ts
describe('{Item} API Integration Tests', () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4569'
  const test{Item} = {
    // Valid data based on DDL
  }

  describe('POST /api/{path}', () => {
    test('should create {item} with valid data', async () => {
      const response = await fetch(`${baseUrl}/api/{path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': baseUrl, // CSRF requirement
        },
        credentials: 'include', // Auth requirement
        body: JSON.stringify(test{Item})
      })
      expect(response.status).toBe(201)
    })

    test('should return 422 for invalid enum', async () => {
      const invalidData = { ...test{Item}, enum_field: 'invalid' }
      const response = await fetch(`${baseUrl}/api/{path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': baseUrl },
        credentials: 'include',
        body: JSON.stringify(invalidData)
      })
      expect(response.status).toBe(422)
    })

    test('should return 403 for missing CSRF headers', async () => {
      const response = await fetch(`${baseUrl}/api/{path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // No Origin
        credentials: 'include',
        body: JSON.stringify(test{Item})
      })
      expect(response.status).toBe(403)
    })

    test('should return 401 for unauthenticated request', async () => {
      const response = await fetch(`${baseUrl}/api/{path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': baseUrl },
        // No credentials
        body: JSON.stringify(test{Item})
      })
      expect(response.status).toBe(401)
    })
  })

  // Similar patterns for GET, PUT, DELETE
})
```

### Run Command
```bash
npm run test:unit -- __tests__/api/{item}.test.ts
```

---

## 3. PLAYWRIGHT E2E TESTS (UI Flow)

### File Pattern
`tests/e2e/{item}.spec.ts`

### Template (Copy for Each Stream)
```ts
import { test, expect } from '@playwright/test'

test.describe('{Item} CRUD - DDL Verified Tests', () => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  
  test('complete CRUD flow with evidence capture', async ({ page }) => {
    // Login (EXACT pattern - don't change)
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'email@example.com' }).fill('t@t.com')
    await page.getByRole('textbox', { name: '••••••••' }).fill('t12345')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL('/patient')
    
    // Navigate to list
    await page.goto('/patient/{path}')
    await expect(page.locator('h1:has-text("{Items}")')).toBeVisible()
    
    // Screenshot: List view
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-{item}-list-passed.png`,
      fullPage: true 
    })

    // Test CREATE
    await page.click('text=Add new')
    
    const testData = {
      // Use DDL-valid data with proper enum values
    }
    
    // Fill form using getByRole/getByLabel selectors
    await page.getByRole('textbox', { name: 'Field *' }).fill(testData.field)
    
    // Screenshot: Create form
    await page.screenshot({ 
      path: `ai/testing/${timestamp}-{item}-create-passed.png`,
      fullPage: true 
    })
    
    // Submit and verify
    await page.click('button:has-text("Create")')
    await expect(page.locator('text={Item} added successfully')).toBeVisible()
    
    // Continue with EDIT and DELETE patterns...
  })
})
```

### Screenshot Requirements
- **Naming**: `DDMMYYYY-{item}-{action}-passed.png`
- **Location**: `ai/testing/` folder
- **Coverage**: List, create, detail, edit, delete confirmation, final list

### Run Command
```bash
BASE_URL=http://localhost:4569 npx playwright test tests/e2e/{item}.spec.ts
```

---

## SETUP REQUIREMENTS

### 1. Playwright Configuration
```ts
// playwright.config.ts
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4569',
    // NO storageState - tests handle login themselves
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
```

### 2. Test Credentials
- **Email**: `t@t.com`
- **Password**: `t12345`
- **These are hardcoded test credentials - don't change**

### 3. Dev Server Required
```bash
# Must be running before E2E tests
npm run dev
# Server ready at http://localhost:4569
```

---

## TEST EXECUTION WORKFLOW

### For Any New Stream
1. **Create DDL-based schema tests** using template
2. **Create API integration tests** using template  
3. **Create E2E tests** using template with screenshot capture
4. **Run all tests**: `npm run test:unit && BASE_URL=http://localhost:4569 npx playwright test`
5. **Verify screenshots** saved to `ai/testing/` with proper naming
6. **Update job card** with test results and evidence

### Quality Gates
- ✅ All unit tests must pass
- ✅ All API tests must pass  
- ✅ All E2E tests must pass
- ✅ Screenshots must be captured
- ✅ TypeScript must compile (`npm run typecheck`)
- ✅ Linting must pass (`npm run lint`)

### Evidence Requirements
- **Job card updated** with test results
- **Screenshots saved** with DDMMYYYY naming
- **Test files created** following exact patterns
- **DDL compliance verified** in test comments

**NO SHORTCUTS. NO EXCEPTIONS. FOLLOW THIS PATTERN EXACTLY.**