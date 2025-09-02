# Testing Infrastructure Specification

**Version**: 1.0  
**Date**: 2025-01-02  
**Status**: CRITICAL - Production Blocker  
**Priority**: P0 - Immediate Implementation Required

---

## OVERVIEW

This specification defines the testing infrastructure requirements for Scrypto medical application. Due to critical failures identified in audit, this spec must be implemented immediately to enable production deployment.

## CRITICAL REQUIREMENTS

### 1. Jest Environment Configuration

**File**: `jest.setup.js` (ROOT LEVEL)

```javascript
import 'whatwg-fetch'
import '@testing-library/jest-dom'

// Node.js environment polyfills
Object.defineProperty(global, 'TextEncoder', {
  writable: true,
  value: TextEncoder,
})

Object.defineProperty(global, 'TextDecoder', {
  writable: true,
  value: TextDecoder,
})

// MessagePort polyfill for undici
global.MessagePort = class MessagePort extends EventTarget {
  postMessage() {}
  start() {}
  close() {}
}

// ResizeObserver for component tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(), 
  disconnect: jest.fn(),
}))

// Supabase client mocking
jest.mock('@/lib/supabase-server', () => ({
  getServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 't@t.com' } },
        error: null
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(), 
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    }))
  }))
}))

// CSRF verification mock
jest.mock('@/lib/api-helpers', () => ({
  verifyCsrf: jest.fn(() => null)
}))
```

### 2. Package Dependencies

**Required Installation**:
```bash
npm install --save-dev whatwg-fetch @testing-library/jest-dom node-fetch
```

### 3. Test Coverage Requirements

**MANDATORY MINIMUMS**:
- Unit Tests: 95% statement coverage
- Integration Tests: 100% API endpoint coverage  
- E2E Tests: 100% user workflow coverage
- Security Tests: 100% authentication flow coverage

### 4. Test Categories Implementation

**UNIT TESTS** (`__tests__/schemas/`, `__tests__/hooks/`):
- All Zod schema validation
- All TanStack Query hooks
- All utility functions

**API TESTS** (`__tests__/api/`):
- Authentication verification
- CSRF protection validation
- Input validation testing  
- Error handling verification
- User ownership enforcement

**E2E TESTS** (`tests/e2e/`):
- Complete CRUD workflows
- Authentication flows
- Mobile responsive testing
- Error state handling

**SECURITY TESTS** (`tests/security/`):
- Route protection verification
- Data isolation testing
- SQL injection prevention
- XSS protection validation

## QUALITY GATES

### Pre-Commit Gates
```bash
npm run test:unit && npm run test:api && npm run typecheck && npm run lint
```

### Pre-Production Gates
```bash
npm run test:ci && npm run test:e2e && npm run test:coverage
# Coverage must be ≥95%
# All tests must pass (0% failure tolerance)
```

## IMPLEMENTATION TIMELINE

**Phase 1 (48 Hours)**: Infrastructure repair - jest.setup.js fix
**Phase 2 (1 Week)**: Complete unit/API test implementation  
**Phase 3 (2 Weeks)**: E2E and security test coverage
**Phase 4 (3 Weeks)**: Medical compliance verification

## SUCCESS CRITERIA

- ✅ 0% test failures
- ✅ 95%+ code coverage achieved
- ✅ All API endpoints tested
- ✅ Security testing comprehensive
- ✅ Medical compliance verified

**COMPLIANCE**: This spec must be followed exactly for medical application safety.