# Job Card — Allergies CSRF 403 Error Root Cause Analysis & Fix

- Date: 2025-08-30
- Owner: AI Assistant
- Status: Analysis Complete → Solutions Identified
- Related: 20250829-ssr-allergies-small-fixes-and-csrf-job-card.md

## SUMMARY
Investigate and resolve the confirmed 403 Forbidden error when editing/saving allergies via PUT API endpoint. Complete root cause analysis against specs and provide comprehensive solution.

## ERROR CONFIRMED VIA PLAYWRIGHT TESTING
**Endpoint**: `PUT http://localhost:4569/api/patient/medical-history/allergies/[id]`
**Error**: 403 Forbidden
**UI Impact**: "Failed to update allergy" alert displayed to user
**Screenshot**: `allergy-edit-403-error.png` captured

## ROOT CAUSE ANALYSIS

### 1. CSRF Verification Logic (lib/api-helpers.ts:69-106)
The `verifyCsrf` function requires:
- **Origin header** OR **Referer header** to be present
- Declared origin must match one of the allowed origins

### 2. Allowed Origins Construction
Current allowlist includes:
```ts
const envOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,        // ❌ MISSING
  process.env.CSRF_ALLOWED_ORIGINS,        // ❌ MISSING
]
const currentOrigin = request.nextUrl.origin  // ✅ PRESENT (http://localhost:4569)
```

### 3. Environment Configuration Gap
**Current State**:
- `NEXT_PUBLIC_SITE_URL`: **UNDEFINED**
- `CSRF_ALLOWED_ORIGINS`: **UNDEFINED**
- Only `currentOrigin` (localhost:4569) is in allowlist

### 4. Spec Compliance Analysis
**Per Security & Configuration (Revised).md**:
- ✅ CSRF verification on POST/PUT/DELETE: IMPLEMENTED
- ❌ Environment configuration: MISSING

**Per API and Error Semantics (Revised).md**:
- ✅ 403 Forbidden response: CORRECT
- ✅ Error surfaced in UI: WORKING

## TECHNICAL INVESTIGATION

### Origin Header Analysis
- **Browser Behavior**: Modern browsers include `Origin` header on POST/PUT requests
- **Local Development**: Origin should be `http://localhost:4569`
- **Current Implementation**: Correctly extracts and validates origin

### CSRF Protection Standards (2025)
Based on industry research:
- Same-origin policy by default in Next.js API routes ✅
- Origin header validation is best practice ✅
- Referer header as fallback is acceptable ✅
- Environment-based allowlist is correct pattern ✅

## SOLUTIONS

### Solution 1: Environment Configuration (IMMEDIATE)
Add to `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:4569
CSRF_ALLOWED_ORIGINS=http://localhost:4569,https://qa.scrypto.online
```

### Solution 2: Development Override (ALTERNATIVE)
Modify `verifyCsrf` to allow localhost in development:
```ts
// Add after line 87
if (process.env.NODE_ENV === 'development' && currentOrigin.includes('localhost')) {
  return undefined // Allow all localhost requests in dev
}
```

### Solution 3: Debug Logging (DIAGNOSTIC)
Add logging to understand actual vs expected origins:
```ts
// Add after line 101
console.log('CSRF Debug:', {
  declaredOrigin,
  currentOrigin,
  allowed: Array.from(allowed),
  method,
  origin,
  referer
})
```

## RECOMMENDED ACTION PLAN

### Phase 1: Immediate Fix (Environment)
1. Create `.env.local` with required CSRF configuration
2. Restart dev server
3. Re-test allergy edit/save with Playwright
4. Confirm 403 resolved

### Phase 2: Hardening (Optional)
1. Add unit tests for `verifyCsrf` function covering:
   - Valid same-origin requests
   - Cross-origin rejection
   - Missing headers handling
   - Environment variable scenarios
2. Add development mode debugging
3. Document CSRF configuration in deployment guides

### Phase 3: Validation
1. Test on QA environment with proper `CSRF_ALLOWED_ORIGINS`
2. Verify production deployment has correct env vars
3. Add CSRF validation to CI/CD pipeline

## SPEC COMPLIANCE VERIFICATION

**Security & Configuration (Revised).md**:
- ✅ CSRF verification implemented
- ❌ Environment configuration missing ← **ROOT CAUSE**

**API and Error Semantics (Revised).md**:
- ✅ 403 status code correct
- ✅ Error properly surfaced in UI

**Authentication and Authorization (Revised).md**:
- ✅ User authentication working
- ✅ Ownership enforcement in place (user_id filter)

## FILES INVOLVED
- `lib/api-helpers.ts` - CSRF verification logic
- `app/api/patient/medical-history/allergies/[id]/route.ts` - PUT endpoint
- `.env.local` - Missing environment configuration
- `components/features/patient/allergies/AllergiesDetailFeature.tsx` - Error handling UI

## EVIDENCE
- Screenshot: `.playwright-mcp/allergy-edit-403-error.png`
- Network trace: `PUT /api/patient/medical-history/allergies/[id] => 403`
- Console error: "Failed to load resource: 403 Forbidden"
- Environment check: Both CSRF env vars undefined

## IMMEDIATE NEXT STEPS
1. Create `.env.local` with CSRF configuration
2. Restart dev server (`npm run dev`)
3. Re-test with Playwright
4. Update this job card with results

## SOLUTION IMPLEMENTED & RESULTS

### Environment Fix Applied ✅
Created `.env.local` with:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:4569
CSRF_ALLOWED_ORIGINS=http://localhost:4569,https://qa.scrypto.online
```

### Testing Results
**Before Fix**: `PUT /api/patient/medical-history/allergies/[id] => 403 Forbidden`
**After Fix**: `PUT /api/patient/medical-history/allergies/[id] => 401 Unauthorized`

### Analysis
✅ **CSRF Issue RESOLVED**: 403 → 401 confirms CSRF protection now working
❌ **New Issue Discovered**: 401 Unauthorized indicates authentication session problem
📸 **Evidence**: Screenshots captured for both error states

### Root Cause Status
- **Original CSRF Issue**: ✅ FIXED - Environment configuration resolved
- **Secondary Auth Issue**: ❌ NEW - Session management problem uncovered

## AUTHENTICATION ISSUE RESOLVED ✅

### Root Cause Discovered
The 401 error was caused by overly aggressive error handling in `getServerClient()` that prevented token refresh in API routes. Our implementation had double try-catch blocks that silently blocked legitimate cookie mutations during auth token refresh.

### Official Supabase Documentation Fix Applied
**File**: `lib/supabase-server.ts` (lines 20-30)
**Changed**: Removed double try-catch, implemented official Supabase SSR pattern
**Result**: Authentication token refresh now works in API routes

### Final Testing Results ✅
**API Call**: `PUT /api/patient/medical-history/allergies/[id] => 200 OK`
**Console**: "Allergy updated successfully: {allergy_id: f231e7d3-0d59-400e-91a6-4f2b9015de9a, user_id: db4f...}"
**UI**: Success toast "Allergy updated successfully" displayed
**Cache**: Query invalidation working properly

### Evidence Captured
- Before fix: `allergy-edit-403-error.png` (CSRF), `allergy-edit-401-after-csrf-fix.png` (auth)
- After fix: `allergy-edit-success-after-auth-fix.png` (success)

## FINAL STATUS: COMPLETE SUCCESS ✅

### Issues Resolved
1. ✅ **CSRF 403 Error**: Fixed with environment configuration  
2. ✅ **Authentication 401 Error**: Fixed with Supabase SSR pattern compliance
3. ✅ **Allergy Save Functionality**: Working correctly end-to-end

### Spec Compliance Achieved
- ✅ **Authentication & Authorization**: API routes now properly authenticate users
- ✅ **Security & Configuration**: CSRF protection working with proper environment setup  
- ✅ **API Error Semantics**: Correct response codes and error handling

## NOTES
- The authentication issue required consulting official Supabase SSR documentation
- Our implementation was 95% correct but the setAll function had blocking error handling
- Single line change (removing double try-catch) resolved the entire authentication flow
- Both CSRF and authentication layers now working as specified
- **MEDICAL DATA SAVE FUNCTIONALITY RESTORED** - users can now save allergy information