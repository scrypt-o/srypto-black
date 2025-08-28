# ALLERGIES IMPLEMENTATION PLAN - THE ONLY PLAN THAT MATTERS

**NO DAYS. NO TIMELINES. JUST STEPS.**

This plan builds ONE thing: Patient Allergies. When it works 100%, we copy it for everything else.

---

## STEP 1: CREATE ZOD SCHEMAS (The Contract)

### Read First:
- `ai/specs/database-ddl/patient__medhist__allergies_ddl.md` - for exact column names
- `ai/plan/A Simpler Approach - Defer Tanstack.md` - for the facade pattern

### Create File: `/schemas/allergies.ts`

### Prompt for AI:
```
Read the DDL file at ai/specs/database-ddl/patient__medhist__allergies_ddl.md

Create Zod schemas in /schemas/allergies.ts with:
1. AllergyRow - matching ALL database columns exactly (snake_case)
2. AllergyCreateInput - fields for creating (exclude: allergy_id, user_id, created_at, updated_at)  
3. AllergyUpdateInput - fields for updating (exclude: allergy_id, user_id, created_at, updated_at)
4. AllergyListQuery - page: number, pageSize: number, search: string optional
5. AllergyListResponse - data: AllergyRow[], total: number, page: number, pageSize: number

Use z.string(), z.enum(), z.date(), z.boolean() as appropriate.
All fields must be snake_case matching the database exactly.
```

### Checklist:
- [ ] File created at `/schemas/allergies.ts`
- [ ] AllergyRow has ALL columns from DDL
- [ ] Fields are snake_case (allergen, severity, reaction, etc.)
- [ ] Severity enum matches DDL: ['mild', 'moderate', 'severe', 'life_threatening']
- [ ] TypeScript compiles without errors

---

## STEP 2: CREATE QUERY FACADE (Simple Fetch Wrapper)

### Create File: `/lib/query/runtime.ts`

### Prompt for AI:
```
Create a query facade at /lib/query/runtime.ts that mimics TanStack Query API but uses simple fetch.

Requirements:
1. useQuery function that takes key array and fetch function
2. useMutation function with mutationFn, onSuccess, onError
3. Return same shape as TanStack: { data, isLoading, error, refetch } for query
4. Return same shape as TanStack: { mutate, isPending } for mutation
5. Use React.useState and React.useEffect internally
6. NO TanStack imports - this is a simple shim

Copy the implementation from ai/plan/A Simpler Approach - Defer Tanstack.md lines 76-102.
```

### Checklist:
- [ ] File created at `/lib/query/runtime.ts`
- [ ] useQuery function exported
- [ ] useMutation function exported
- [ ] NO @tanstack imports
- [ ] Uses only React hooks internally

---

## STEP 3: CREATE API ROUTES (Database to JSON)

### Create Files:
- `/app/api/patient/medical-history/allergies/route.ts` (LIST, CREATE)
- `/app/api/patient/medical-history/allergies/[id]/route.ts` (GET, UPDATE, DELETE)

### Prompt for AI:
```
Create API routes for allergies following this exact pattern:

1. List endpoint (GET /api/patient/medical-history/allergies):
   - Get authenticated user from createServerClient
   - Query v_patient__medhist__allergies view
   - Filter by user_id
   - Support ?page&pageSize&search params
   - Return AllergyListResponse shape

2. Create endpoint (POST /api/patient/medical-history/allergies):
   - Validate body with AllergyCreateInput.parse()
   - Insert into patient__medhist__allergies table
   - Add user_id from auth
   - Return created AllergyRow

3. Get by ID (GET /api/patient/medical-history/allergies/[id]):
   - Query by allergy_id AND user_id
   - Return AllergyRow or 404

4. Update (PUT /api/patient/medical-history/allergies/[id]):
   - Validate with AllergyUpdateInput.parse()
   - Update where allergy_id AND user_id match
   - Return updated AllergyRow

5. Delete (DELETE /api/patient/medical-history/allergies/[id]):
   - Set is_active = false (soft delete)
   - Where allergy_id AND user_id match
   - Return { success: true }

Import from:
- @/lib/supabase-server for createServerClient
- @/schemas/allergies for Zod schemas

All errors return { error: string, code?: string }
```

### Checklist:
- [ ] Both route files created
- [ ] GET /api/patient/medical-history/allergies returns list
- [ ] POST /api/patient/medical-history/allergies creates record
- [ ] GET /api/patient/medical-history/allergies/[id] returns single record
- [ ] PUT /api/patient/medical-history/allergies/[id] updates record
- [ ] DELETE /api/patient/medical-history/allergies/[id] soft deletes
- [ ] All routes check user_id for security
- [ ] Zod validation on inputs

---

## STEP 4: CREATE HOOKS (Using Facade)

### Create File: `/hooks/usePatientAllergies.ts`

### Prompt for AI:
```
Create hooks file at /hooks/usePatientAllergies.ts using the query facade.

Import from '@/lib/query/runtime' NOT from TanStack.

Export these functions:

1. AllergyKeys object with:
   - all: ['allergies']
   - list: (params) => ['allergies', 'list', params]
   - detail: (id) => ['allergies', 'detail', id]

2. useAllergiesList(params: { page, pageSize, search }):
   - Use useQuery with AllergyKeys.list(params)
   - Fetch from /api/patient/medical-history/allergies
   - Return { data, isLoading, error, refetch }

3. useAllergyById(id: string):
   - Use useQuery with AllergyKeys.detail(id)
   - Fetch from /api/patient/medical-history/allergies/{id}
   - Return { data, isLoading, error }

4. useCreateAllergy():
   - Use useMutation
   - POST to /api/patient/medical-history/allergies
   - onSuccess: console.log for now (no cache to invalidate)
   - Return { mutate, isPending }

5. useUpdateAllergy():
   - Use useMutation
   - PUT to /api/patient/medical-history/allergies/{id}
   - Return { mutate, isPending }

6. useDeleteAllergy():
   - Use useMutation  
   - DELETE to /api/patient/medical-history/allergies/{id}
   - Return { mutate, isPending }

All fetches need credentials: 'same-origin' and headers: { 'Content-Type': 'application/json' }
```

### Checklist:
- [ ] File created at `/hooks/usePatientAllergies.ts`
- [ ] Imports from `/lib/query/runtime` NOT TanStack
- [ ] All 5 hooks exported
- [ ] AllergyKeys object exported
- [ ] Hooks return correct shape

---

## STEP 5: CREATE LIST PAGE

### Create File: `/app/patient/medhist/allergies/page.tsx`

### Prompt for AI:
```
Create list page at /app/patient/medhist/allergies/page.tsx

Requirements:
1. Use 'use client' directive
2. Import useAllergiesList from @/hooks/usePatientAllergies
3. Import ListViewLayout from @/components/layouts/ListViewLayout
4. Show loading state while isLoading
5. Show error if error exists
6. Pass data to ListViewLayout with columns for:
   - allergen (main column)
   - severity (with color badges)
   - reaction
   - notes (truncated)
7. Add button that navigates to /patient/medhist/allergies/new
8. Mobile responsive with cards on small screens

Keep it simple - no fancy features yet.
```

### Checklist:
- [ ] Page loads without errors
- [ ] Shows loading state
- [ ] Shows error state if API fails
- [ ] Displays allergies in table/cards
- [ ] Add button navigates to /new

---

## STEP 6: CREATE ADD PAGE

### Create File: `/app/patient/medhist/allergies/new/page.tsx`

### Prompt for AI:
```
Create new allergy page at /app/patient/medhist/allergies/new/page.tsx

Requirements:
1. Use 'use client' directive
2. Import useCreateAllergy from @/hooks/usePatientAllergies
3. Import DetailViewLayout from @/components/layouts/DetailViewLayout
4. Create form with fields:
   - allergen (text input, required)
   - severity (select: mild, moderate, severe, life_threatening)
   - reaction (text input)
   - notes (textarea)
5. Form ID must be "allergy-form"
6. On submit: call mutation, then navigate to /patient/medhist/allergies on success
7. Pass formId="allergy-form" to DetailViewLayout
8. Show loading state with loading prop on DetailViewLayout

Use React Hook Form for form management.
```

### Checklist:
- [ ] Form renders all fields
- [ ] Form validates required fields
- [ ] Save button submits form
- [ ] Loading state shows during save
- [ ] Redirects to list after save
- [ ] Errors display if save fails

---

## STEP 7: CREATE EDIT PAGE

### Create File: `/app/patient/medhist/allergies/[id]/page.tsx`

### Prompt for AI:
```
Create edit page at /app/patient/medhist/allergies/[id]/page.tsx

Requirements:
1. Use 'use client' directive
2. Import useAllergyById and useUpdateAllergy from @/hooks/usePatientAllergies
3. Import DetailViewLayout from @/components/layouts/DetailViewLayout
4. Load existing allergy data with useAllergyById
5. Populate form with existing values
6. Same fields as create page
7. On submit: call update mutation, show success message
8. Include delete button that calls useDeleteAllergy
9. Navigate back to list after delete

Similar structure to new page but with data pre-filled.
```

### Checklist:
- [ ] Loads existing allergy data
- [ ] Form pre-fills with current values
- [ ] Save updates the record
- [ ] Delete removes the record (soft delete)
- [ ] Both actions redirect to list

---

## STEP 8: TEST WITH PLAYWRIGHT

### Prompt for AI:
```
Test the allergies implementation using Playwright MCP:

1. Navigate to http://localhost:3569/patient/medhist/allergies
2. Take screenshot: allergies-01-list-empty.png
3. Click Add/New button
4. Take screenshot: allergies-02-create-form.png
5. Fill form with:
   - allergen: "Peanuts"
   - severity: "severe"
   - reaction: "Anaphylaxis"
   - notes: "Carries EpiPen"
6. Click Save
7. Take screenshot: allergies-03-list-with-data.png
8. Click on the Peanuts row
9. Take screenshot: allergies-04-edit-form.png
10. Change severity to "life_threatening" (with underscore)
11. Save
12. Take screenshot: allergies-05-updated-list.png

Save all screenshots to ai/testing/screenshots/allergies/

If ANY step fails, document the exact error.
```

### Checklist:
- [ ] List page loads
- [ ] Create form accessible
- [ ] Can save new allergy
- [ ] List shows new allergy
- [ ] Edit form loads with data
- [ ] Can update allergy
- [ ] Can delete allergy
- [ ] All screenshots captured

---

## STEP 9: FIX ANY ISSUES

### If Tests Failed:
1. Document exact error message
2. Fix the specific issue
3. Re-run failed test step
4. Continue until all tests pass

### Common Issues:
- API returns 401: Check authentication in route
- Form won't submit: Check formId matches
- No data shows: Check database view name
- Save fails: Check Zod schema matches database

---

## STEP 10: VERIFY COMPLETE

### Final Checklist:
- [ ] Can view list of allergies
- [ ] Can add new allergy
- [ ] Can edit existing allergy
- [ ] Can delete allergy
- [ ] Mobile responsive (test at 390px)
- [ ] Desktop works (test at 1920px)
- [ ] No TypeScript errors
- [ ] No console errors

---

## WHEN THIS WORKS 100%:

Copy the EXACT pattern for:
1. Conditions (same steps, different fields)
2. Immunizations (same steps, different fields)
3. Family History (same steps, different fields)
4. Surgeries (same steps, different fields)

NO CREATIVITY. NO OPTIMIZATION. JUST COPY AND REPLACE NAMES.

---

## THE CRITICAL RULE:

**DO NOT PROCEED TO NEXT STEP UNTIL CURRENT STEP IS 100% COMPLETE AND TESTED**

If Step 3 fails, fix Step 3. Don't move to Step 4 with broken Step 3.
This is medical software. Half-working kills people.