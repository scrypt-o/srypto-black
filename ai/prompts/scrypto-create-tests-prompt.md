# Prompt: Generate Complete Test Suite for Scrypto Medical Portal Feature

## Initial Context
**FIRST**: Read these files in order:
1. `/_eve_/projects/scrypto/code-base/_docs/ai-context-strict.md` - Project understanding
2. `/_eve_/projects/scrypto/code-base/ai/testing/documentation/simple-testing-checklist.md` - What to test
3. `/_eve_/projects/scrypto/code-base/jest.config.js` - Test configuration

## Your Task
Create a complete test suite for a Scrypto feature. Every feature MUST have tests that verify:
1. API CRUD operations work
2. Page loads and saves data
3. Validation rejects bad input
4. Users can't see each other's data
5. TypeScript and standards compliance

## Test File Locations (MUST USE THESE)
```
code-base/
├── __tests__/              # Jest tests go here
│   ├── unit/              # Component and utility tests
│   ├── integration/       # API and database tests
│   └── api/               # API endpoint tests
└── tests/                  # Playwright tests go here
    └── e2e/               # End-to-end user journey tests
```

## Process to Follow

### Step 1: Create Job Card
Create in `ai/jobcards/[date]-test-[feature].md`:
```markdown
# Job Card: Test Implementation - [Domain]__[Group]__[Item]

**Date**: [Today's date]
**Status**: Active
**Type**: Test Implementation
**Feature**: [domain]__[group]__[item]

## Tasks
- [ ] Review feature specification
- [ ] Create API test file
- [ ] Create component test file  
- [ ] Create E2E test file
- [ ] Run tests and verify passing
- [ ] Save test evidence/screenshots
```

### Step 2: Identify What to Test
Based on the feature spec, determine:
- **API Endpoints**: Which routes need testing?
- **UI Components**: Which pages/forms need testing?
- **Validation Rules**: What invalid inputs to test?
- **Security**: How to verify user isolation?

### Step 3: Create API Test File

**Location**: `__tests__/api/[domain]-[group]-[item].test.ts`

```typescript
import { createMocks } from 'node-mocks-http'
import { GET, POST, PUT, DELETE } from '@/app/api/[domain]/[group]/[item]/route'

// Mock authentication
jest.mock('@/lib/supabase-api', () => ({
  getAuthenticatedApiClient: jest.fn(() => ({
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({ data: [], error: null })),
        insert: jest.fn(() => ({ data: { id: 'test-id' }, error: null })),
        update: jest.fn(() => ({ data: { id: 'test-id' }, error: null })),
        delete: jest.fn(() => ({ data: null, error: null }))
      })),
      rpc: jest.fn(() => ({ data: 'test-id', error: null }))
    },
    user: { id: 'test-user', email: 'test@example.com' }
  }))
}))

describe('[Domain] [Group] [Item] API', () => {
  describe('POST - Create', () => {
    it('should create with valid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: {
          // Valid data matching schema
          field1: 'value1',
          field2: 'value2'
        }
      })
      
      await POST(req)
      
      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toHaveProperty('data')
    })
    
    it('should reject invalid data', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: {
          // Missing required field
          field2: 'value2'
        }
      })
      
      await POST(req)
      
      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toHaveProperty('error', 'Validation failed')
    })
    
    it('should require authentication', async () => {
      jest.mocked(getAuthenticatedApiClient).mockRejectedValueOnce(new Error('Unauthorized'))
      
      const { req, res } = createMocks({
        method: 'POST',
        body: { field1: 'value1' }
      })
      
      await POST(req)
      
      expect(res._getStatusCode()).toBe(401)
    })
  })
  
  describe('GET - Read', () => {
    it('should return user data', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: { authorization: 'Bearer token' }
      })
      
      await GET(req)
      
      expect(res._getStatusCode()).toBe(200)
      expect(Array.isArray(JSON.parse(res._getData()))).toBe(true)
    })
  })
  
  describe('PUT - Update', () => {
    it('should update with valid data', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        headers: { authorization: 'Bearer token' },
        body: {
          id: 'test-id',
          field1: 'updated'
        }
      })
      
      await PUT(req)
      
      expect(res._getStatusCode()).toBe(200)
    })
  })
  
  describe('DELETE - Delete', () => {
    it('should delete record', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        headers: { authorization: 'Bearer token' },
        query: { id: 'test-id' }
      })
      
      await DELETE(req)
      
      expect(res._getStatusCode()).toBe(200)
    })
  })
})
```

### Step 4: Create Component Test File

**Location**: `__tests__/unit/[domain]/[group]/[item].test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { [Item]Form } from '@/components/[domain]/[group]/[Item]Form'

describe('[Item] Component', () => {
  const user = userEvent.setup()
  const mockSave = jest.fn()
  const mockCancel = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  it('should render all required fields', () => {
    render(<[Item]Form onSave={mockSave} onCancel={mockCancel} />)
    
    expect(screen.getByLabelText('Field 1*')).toBeInTheDocument()
    expect(screen.getByLabelText('Field 2*')).toBeInTheDocument()
  })
  
  it('should show validation errors', async () => {
    render(<[Item]Form onSave={mockSave} onCancel={mockCancel} />)
    
    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    expect(await screen.findByText('Field 1 is required')).toBeInTheDocument()
  })
  
  it('should save with valid data', async () => {
    render(<[Item]Form onSave={mockSave} onCancel={mockCancel} />)
    
    // Fill form
    await user.type(screen.getByLabelText('Field 1*'), 'Test Value')
    await user.type(screen.getByLabelText('Field 2*'), 'Test Value 2')
    
    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith({
        field1: 'Test Value',
        field2: 'Test Value 2'
      })
    })
  })
  
  it('should handle save errors', async () => {
    mockSave.mockRejectedValueOnce(new Error('Network error'))
    
    render(<[Item]Form onSave={mockSave} onCancel={mockCancel} />)
    
    // Fill minimum required fields
    await user.type(screen.getByLabelText('Field 1*'), 'Test')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    expect(await screen.findByText(/failed to save/i)).toBeInTheDocument()
  })
})
```

### Step 5: Create E2E Test File

**Location**: `tests/e2e/[domain]-[group]-[item].spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('[Domain] [Group] [Item] E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:4569/login')
    await page.fill('[name="email"]', 't@t.com')
    await page.fill('[name="password"]', 't12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/patient')
  })
  
  test('should complete full CRUD workflow', async ({ page }) => {
    // Navigate to feature
    await page.goto('http://localhost:4569/[domain]/[group]/[item]')
    
    // CREATE: Add new item
    await page.click('button:has-text("Add [Item]")')
    await page.fill('[name="field1"]', 'Test Value')
    await page.fill('[name="field2"]', 'Test Value 2')
    await page.click('button:has-text("Save")')
    
    // Verify success
    await expect(page.locator('.toast-success')).toContainText('saved')
    await expect(page.locator('text=Test Value')).toBeVisible()
    
    // UPDATE: Edit item
    await page.click('button[aria-label="Edit"]')
    await page.fill('[name="field1"]', 'Updated Value')
    await page.click('button:has-text("Update")')
    
    // Verify update
    await expect(page.locator('text=Updated Value')).toBeVisible()
    
    // DELETE: Remove item
    await page.click('button[aria-label="Delete"]')
    await page.click('button:has-text("Confirm")')
    
    // Verify deletion
    await expect(page.locator('text=Updated Value')).not.toBeVisible()
  })
  
  test('should show validation errors', async ({ page }) => {
    await page.goto('http://localhost:4569/[domain]/[group]/[item]')
    await page.click('button:has-text("Add [Item]")')
    
    // Try to save without required fields
    await page.click('button:has-text("Save")')
    
    // Check for validation messages
    await expect(page.locator('text=Field 1 is required')).toBeVisible()
  })
  
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    
    await page.goto('http://localhost:4569/[domain]/[group]/[item]')
    
    // Verify mobile layout
    await expect(page.locator('[data-mobile-menu]')).toBeVisible()
    
    // Test functionality works on mobile
    await page.click('button:has-text("Add [Item]")')
    await page.fill('[name="field1"]', 'Mobile Test')
    await page.click('button:has-text("Save")')
    
    await expect(page.locator('.toast-success')).toBeVisible()
  })
})
```

### Step 6: Create Database Test File (if needed)

**Location**: `__tests__/integration/database/[domain]-[group]-[item].test.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

describe('[Domain] [Group] [Item] Database', () => {
  describe('Stored Procedures', () => {
    it('should create via stored procedure', async () => {
      const { data, error } = await supabase.rpc('sp_[domain]__[group]__[item]_create', {
        p_field1: 'Test',
        p_field2: 'Value'
      })
      
      expect(error).toBeNull()
      expect(data).toMatch(/^[0-9a-f-]{36}$/) // UUID
    })
    
    it('should enforce required fields', async () => {
      const { data, error } = await supabase.rpc('sp_[domain]__[group]__[item]_create', {
        p_field1: null // Missing required field
      })
      
      expect(error).toBeDefined()
      expect(error.message).toContain('required')
    })
  })
  
  describe('User Isolation', () => {
    it('should only return current user data', async () => {
      const { data } = await supabase
        .from('v_[domain]__[group]__[item]')
        .select('*')
      
      // All returned records should belong to current user
      data?.forEach(record => {
        expect(record.user_id).toBe(supabase.auth.user()?.id)
      })
    })
  })
})
```

### Step 7: Run Tests and Save Evidence

```bash
# Run the tests
npm test __tests__/api/[domain]-[group]-[item].test.ts
npm test __tests__/unit/[domain]/[group]/[item].test.tsx
npx playwright test tests/e2e/[domain]-[group]-[item].spec.ts

# Save screenshots for evidence
npx playwright test --screenshot=only --screenshot=on
```

Save screenshots to: `ai/testing/screenshots/[domain]-[group]-[item]/`

### Step 8: Create Test Evidence File

**Location**: `ai/testing/evidence/[domain]-[group]-[item]-results.md`

```markdown
# Test Results: [Domain]__[Group]__[Item]

**Date**: [Today's date]
**Feature**: [domain]__[group]__[item]

## Test Summary
- ✅ API Tests: X/X passing
- ✅ Component Tests: X/X passing
- ✅ E2E Tests: X/X passing
- ✅ Coverage: XX%

## Screenshots
- `create-success.png` - Item created successfully
- `validation-errors.png` - Validation working
- `mobile-view.png` - Mobile responsive

## Compliance Checklist
- [x] CRUD operations tested
- [x] Validation tested
- [x] Authentication tested
- [x] User isolation tested
- [x] Mobile tested
- [x] No TypeScript errors
- [x] No console.logs
```

### Step 9: Close Job Card
Update job card with completion status and move to `ai/jobcards/submitted/`

## Required Documentation to Read

Before creating tests, the AI should read:
1. **Feature Spec**: `ai/specs/[domain]/[group]/[domain]__[group]__[item]-complete-spec.md`
2. **Testing Guides**:
   - `ai/testing/documentation/simple-testing-checklist.md` - What to test
   - `ai/testing/documentation/how-to-jest-testing.md` - Jest setup
3. **Examples**: `ai/testing/examples/tdd-example-medications.md`

## Test Coverage Requirements

Each feature MUST have:
- **API Tests**: All CRUD operations (POST, GET, PUT, DELETE)
- **Validation Tests**: Required fields and format validation
- **Security Tests**: Authentication and user isolation
- **Component Tests**: Form rendering and submission
- **E2E Tests**: Complete user workflow

## File Naming Convention

```
__tests__/
  api/[domain]-[group]-[item].test.ts
  unit/[domain]/[group]/[item].test.tsx
  integration/database/[domain]-[group]-[item].test.ts
tests/
  e2e/[domain]-[group]-[item].spec.ts
```

## Commands Reference

```bash
# Install dependencies (if not done)
npm install --save-dev jest @testing-library/react @testing-library/user-event
npm install --save-dev @playwright/test
npm install --save-dev node-mocks-http supertest

# Run tests
npm test                      # All Jest tests
npm test [specific-file]      # Single test file
npx playwright test           # All E2E tests
npx playwright test --ui      # Interactive mode

# Coverage
npm run test:coverage         # Generate coverage report
```

## Validation Before Completion

Before marking tests complete, verify:
- [ ] All API endpoints tested (CRUD)
- [ ] Validation errors tested
- [ ] Authentication required tested
- [ ] User data isolation tested
- [ ] Component renders correctly
- [ ] Form submission works
- [ ] E2E workflow completes
- [ ] Mobile viewport tested
- [ ] Tests actually pass
- [ ] Screenshots saved as evidence

## Your Output

1. Create job card
2. Create test files in correct locations
3. Ensure tests pass
4. Save evidence/screenshots
5. Close job card
6. Confirm: "Tests created for [domain]__[group]__[item]"

**Start by asking**: "Which feature needs tests? Please provide domain, group, and item name, or point me to the spec file."