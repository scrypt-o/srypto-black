# Job Card: Standard Layouts Implementation
**Date:** 26/08/2025
**Status:** IN PROGRESS - FIXING
**Priority:** HIGH
**Category:** UI/UX

## SUMMARY
Task: Implement standard mobile list and detail layouts
Date: 2025-08-26
Status: In Progress - Fixing Previous Implementation

## PROBLEM IDENTIFIED
Previous implementation created WRONG layouts:
- Created mobile row-based lists instead of TABLE-BASED components
- Did NOT follow specifications at all
- Missing critical features like columns, sorting, pagination
- Components existed but were completely wrong

## SPEC VIOLATIONS FOUND
### ListViewLayout - WRONG:
- Was: Simple mobile list with rows (ListViewItem interface)
- Should be: TABLE with columns (Column<Row> interface)
- Missing: Sorting, pagination, dark mode, framer-motion

### DetailViewLayout - WRONG:  
- Was: Simple form with fields array
- Should be: Sections-based layout with form submission by formId
- Missing: Breadcrumbs, sections, proper action bar, styles

## FIXES APPLIED (2025-08-26 14:00)
### 1. Replaced ListViewLayout completely
- Now uses proper table with columns
- Added sorting functionality
- Added pagination support
- Added dark mode and framer-motion
- Matches spec exactly from `Layout - The List View Layout - (ListViewLayout).md`

### 2. Replaced DetailViewLayout completely  
- Now uses sections pattern
- Added breadcrumbs support
- Proper form submission via formId
- Sticky action bar
- Matches spec exactly from `Layout - The Detail View Layout - (DetailViewLayout).md`

### 3. Updated all allergies pages
- `/app/patient/medhist/allergies/page.tsx` - Now uses columns and table
- `/app/patient/medhist/allergies/[id]/page.tsx` - Now uses sections
- `/app/patient/medhist/allergies/new/page.tsx` - Now uses sections

### 4. Fixed schema exports
- Added `allergyFormSchema` and `AllergyFormData` to allergies schema

## FILES MODIFIED
- `/components/layouts/ListViewLayout.tsx` - Complete rewrite (390 lines)
- `/components/layouts/DetailViewLayout.tsx` - Complete rewrite (210 lines)  
- `/app/patient/medhist/allergies/page.tsx` - Updated to use table columns
- `/app/patient/medhist/allergies/[id]/page.tsx` - Updated to use sections
- `/app/patient/medhist/allergies/new/page.tsx` - Updated to use sections
- `/schemas/allergies.ts` - Added form schema exports

## CURRENT STATUS
- TypeScript compiles (main layout errors fixed)
- Server running on localhost:4569
- Need to test with Playwright
- Need to capture screenshots

## TESTS TO COMPLETE
- [ ] Test list view renders as table
- [ ] Test sorting works
- [ ] Test detail view with sections
- [ ] Test form submission
- [ ] Capture screenshots

## NOTES
The previous implementation was completely wrong and did not follow the specifications at all. It appeared someone created mobile-first simple layouts instead of reading and following the detailed specifications provided. This has now been corrected to match the specs exactly.