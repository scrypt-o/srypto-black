# Auth Error Handling Specification
**Date:** 2025-08-26
**Status:** Implemented
**Version:** 1.0

## Overview
This specification defines how authentication errors are handled throughout the Scrypto application to provide clear user feedback when authentication fails.

## Problem Statement
Previously, when authentication failed (401 errors), users would see:
- Blank screens with no data
- Generic "Failed to fetch" messages
- No indication they needed to log in
- Silent failures with no feedback

## Solution Architecture

### 1. Custom ApiError Class
Location: `/lib/api-error.ts`

```typescript
class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string)
  isAuthError(): boolean        // Returns true for 401
  isPermissionError(): boolean   // Returns true for 403
  getUserMessage(): string       // Returns user-friendly message
  static fromResponse(response: Response): Promise<ApiError>
}
```

### 2. Error Status Preservation
All API hooks preserve HTTP status codes:
- Hooks use `ApiError.fromResponse()` instead of generic Error
- Status codes flow through: API → Hook → Component → User

### 3. User-Friendly Messages
Status codes map to clear messages:
- 401: "Your session has expired. Please log in again."
- 403: "You do not have permission to perform this action."
- 404: "The requested resource was not found."
- 500: "A server error occurred. Please try again later."

### 4. Automatic Redirect Flow
For 401 errors:
1. Show error message to user
2. Wait 2 seconds (for user to read)
3. Redirect to `/login`
4. Preserve original URL for post-login redirect

## Implementation Details

### Hooks Layer
```typescript
// Before (status lost)
if (!response.ok) {
  throw new Error('Failed to fetch')
}

// After (status preserved)
if (!response.ok) {
  throw await ApiError.fromResponse(response)
}
```

### Component Layer
```typescript
// List pages
useEffect(() => {
  if (error instanceof ApiError && error.isAuthError()) {
    handleApiError(error, router)  // Auto-redirect
  }
}, [error, router])

// Form pages
catch (error) {
  if (error instanceof ApiError) {
    const result = handleApiError(error, router)
    toast.push({ type: 'error', message: result.message })
  }
}
```

### Middleware Layer
- Initial page load: Middleware checks auth and redirects
- API calls: Return 401, handled by ApiError system
- Both paths lead to login page with proper messaging

## Auth Flow Sequences

### Expired Session on List Page
```
User views list → Session expires → Refresh/Navigate
→ API returns 401 → ApiError created → useEffect triggers
→ Show "Session expired" → Wait 2s → Redirect to /login
```

### Expired Session on Form Submit
```
User fills form → Clicks Save → API returns 401
→ ApiError created → Catch block → Show toast message
→ Wait 2s → Redirect to /login
```

### No Initial Auth
```
User enters URL → Middleware checks → No auth cookie
→ 307 redirect → Show /login immediately
```

## Files Modified
1. `/lib/api-error.ts` - New error class
2. `/hooks/usePatientAllergies.ts` - Updated error handling
3. `/app/patient/medhist/allergies/page.tsx` - Auth detection
4. `/app/patient/medhist/allergies/new/page.tsx` - Form errors
5. `/components/auth/AuthErrorBoundary.tsx` - Reusable boundary

## Testing
All auth scenarios verified:
- ✅ API returns proper 401 status
- ✅ Invalid tokens rejected
- ✅ Pages redirect when not authenticated
- ✅ Clear error messages shown
- ✅ Auto-redirect after timeout

## Benefits
1. **Clear Feedback**: Users always know when to log in
2. **Consistent Behavior**: Same handling everywhere
3. **Better UX**: No more silent failures or confusion
4. **Maintainable**: Single source of truth for error messages
5. **Future-Ready**: Easy to add new error types