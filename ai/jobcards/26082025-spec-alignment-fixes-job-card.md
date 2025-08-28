## JOB CARD: Spec Alignment Fixes for Layouts and Allergies Implementation

**Date:** 2025-08-26  
**Status:** Pending  
**Priority:** HIGH  
**Type:** Bug Fix / Alignment  
**Components:** ListViewLayout, DetailViewLayout, Allergies Pages  

---

## SUMMARY

Critical alignment issues found between implementation and specifications. While layout components are 100% aligned, the allergies pages have several discrepancies that violate spec patterns, particularly around async handling and pagination. Overall alignment is 95% - needs targeted fixes to reach 100%.

---

## TEST RESULTS (Added 2025-08-26)

### ✅ Working Features Confirmed
- Application running on PM2 (port 4569)
- Authentication functional (t@t.com / t12345)
- List page displays data correctly
- Create new allergy works perfectly
- Toast notifications display
- Data persistence confirmed

### 🔴 NEW CRITICAL ISSUES FOUND IN TESTING

#### 0. Next.js 15 Breaking Change - Params are Promises (NEW - HIGHEST PRIORITY)
**Location:** `app/patient/medhist/allergies/[id]/page.tsx`
- Console shows 30+ errors: "params is now a Promise and should be unwrapped with React.use()"
- This completely breaks the detail/edit page functionality

**Impact:**
- Detail/Edit page cannot load
- Causes cascading errors in console
- Blocks ALL view/edit functionality

**How to Fix:**
```typescript
// WRONG (current):
export default function ViewAllergyPage({ params }: ViewAllergyPageProps) {
  const { data: allergy } = useAllergyById(params.id)

// CORRECT (Next.js 15):
export default async function ViewAllergyPage({ params }: ViewAllergyPageProps) {
  const { id } = await params
  const { data: allergy } = useAllergyById(id)
```

#### 0.1 Navigation Completely Broken (NEW - CRITICAL)
**Location:** All pages using router.push()
- Add button doesn't navigate
- Row clicks don't navigate
- Edit buttons don't navigate
- All router.push() calls fail silently

**Impact:**
- Users cannot navigate between pages
- App is effectively single-page only
- CRUD operations partially work but no editing

**Potential Causes:**
- Next.js navigation not properly initialized
- Router context issues
- Middleware interference

---

## ISSUES IDENTIFIED (Original)

### 🔴 CRITICAL (Blocks Production)

#### 1. Incorrect Async Pattern - MUTATE_ASYNC Usage
**Location:** `app/patient/medhist/allergies/[id]/page.tsx`
- Line 65: `await updateMutation.mutateAsync({ id: params.id, data })`
- Line 92: `await deleteMutation.mutateAsync(params.id)`

**Impact if Not Fixed:**
- Violates architectural pattern specified
- Harder error handling and state management
- Potential race conditions and memory leaks
- Makes code harder to maintain and test
- Sets bad precedent for other developers

**How to Fix:**
```typescript
// WRONG (current):
await updateMutation.mutateAsync({ id: params.id, data })

// CORRECT (per spec):
updateMutation.mutate({ id: params.id, data }, {
  onSuccess: () => {
    toastCtx.push({ type: 'success', message: 'Updated successfully' })
    setMode('view')
    router.refresh()
  },
  onError: (error) => {
    setApiError(error instanceof ApiError ? error.getUserMessage() : 'Failed')
  }
})
```

#### 2. Missing Pagination Implementation
**Location:** `app/patient/medhist/allergies/page.tsx`

**Impact if Not Fixed:**
- Poor performance with large datasets
- No way to navigate through records
- Incomplete feature implementation
- User experience degradation

**How to Fix:**
```typescript
// Add pagination prop to ListViewLayout:
<ListViewLayout
  // ... other props
  pagination={data?.total ? {
    page: page,
    pageSize: 20,
    total: data.total,
    onPageChange: (newPage) => setPage(newPage)
  } : undefined}
/>
```

---

### 🟡 MEDIUM PRIORITY

#### 3. Combined View/Edit Mode Pattern
**Location:** `app/patient/medhist/allergies/[id]/page.tsx`

**Impact if Not Fixed:**
- Complex state management
- Confusing user experience
- Harder to maintain
- Violates single responsibility principle
- More prone to bugs

**How to Fix:**
Split into two separate files:
- `/allergies/[id]/page.tsx` - View only
- `/allergies/[id]/edit/page.tsx` - Edit only

#### 4. Missing Breadcrumbs
**Location:** All detail pages

**Impact if Not Fixed:**
- Poor navigation context
- Reduced usability
- Accessibility concerns
- Professional polish missing

**How to Fix:**
```typescript
<DetailViewLayout
  breadcrumbs={[
    { label: 'Medical History', href: '/patient/medhist' },
    { label: 'Allergies', href: '/patient/medhist/allergies' },
    { label: allergy?.allergen || 'Loading...', href: '#' }
  ]}
  // ... rest
/>
```

---

## IMMEDIATE ACTIONS REQUIRED

### Step 1: Fix Critical Async Issues (30 min)
1. Open `app/patient/medhist/allergies/[id]/page.tsx`
2. Replace all `mutateAsync` with `mutate` + callbacks
3. Test error handling works correctly
4. Verify loading states work

### Step 2: Implement Pagination (20 min)
1. Open `app/patient/medhist/allergies/page.tsx`
2. Add pagination prop to ListViewLayout
3. Ensure API hook passes pagination params
4. Test pagination navigation

### Step 3: Add Breadcrumbs (15 min)
1. Add breadcrumbs to all DetailViewLayout usage
2. Ensure proper hierarchy
3. Test navigation flow

### Step 4: Consider Page Separation (45 min) - OPTIONAL
1. Create `/allergies/[id]/edit/page.tsx`
2. Move edit logic to new file
3. Simplify view page to read-only
4. Update navigation accordingly

---

## VERIFICATION CHECKLIST

- [ ] All `mutateAsync` replaced with `mutate` + callbacks
- [ ] Pagination works on allergies list page
- [ ] Breadcrumbs display on all detail pages
- [ ] Error handling follows spec pattern
- [ ] Loading states work correctly
- [ ] TypeScript compiles without errors
- [ ] Tested with Playwright MCP
- [ ] Screenshots captured as evidence

---

## FILES TO MODIFY

1. `app/patient/medhist/allergies/[id]/page.tsx` - Fix async, add breadcrumbs
2. `app/patient/medhist/allergies/page.tsx` - Add pagination
3. `app/patient/medhist/allergies/new/page.tsx` - Add breadcrumbs

---

## TESTING REQUIREMENTS

### Test Scenarios:
1. Create new allergy - should use mutate pattern
2. Edit existing allergy - should use mutate pattern  
3. Delete allergy - should use mutate pattern
4. Navigate pages in list - pagination should work
5. Check breadcrumbs - should show proper hierarchy

### Evidence Required:
- Screenshot of working pagination
- Screenshot of breadcrumbs
- Console log showing no errors
- Network tab showing proper API calls

---

## NOTES

- Layout components (ListViewLayout, DetailViewLayout) are PERFECT - DO NOT MODIFY
- Focus only on page implementations
- Follow existing patterns exactly
- Test thoroughly with Playwright MCP
- Document any additional issues found

---

## ESTIMATED TIME: 2 hours

## SPEC REFERENCES
- `/ai/specs/Layout - The List View Layout - (ListViewLayout).md`
- `/ai/specs/Layout - The Detail View Layout - (DetailViewLayout).md`
- `/ai/specs/Pattern - Tanstack Query (Hooks).md`

---

**Created by:** AI Assistant  
**Review Required:** Yes  
**Approval:** Pending