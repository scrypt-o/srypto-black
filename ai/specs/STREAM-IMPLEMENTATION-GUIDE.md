# Stream Implementation Guide - Agent Instructions

**PURPOSE**: Step-by-step instructions for implementing any Scrypto stream (domain__group__item) following the verified allergies pattern.

**CONTEXT**: You are implementing a new stream based on user request. The allergies stream is your reference implementation - copy its exact patterns.

---

## STOP - READ THIS FIRST

### Required Reading
**BEFORE IMPLEMENTING**: Read `ai/specs/core/` folder (9 numbered specs in order)

### Reference Implementation  
**COPY THIS EXACTLY**: `app/patient/medhist/allergies/*` - verified working pattern with all best practices

### Context
**APP**: Medical portal, SSR-first Next.js 15, middleware auth, TanStack Query
**PATTERN**: Allergies stream has everything - auth, CRUD, validation, loading states, error handling

---

## AGENT IMPLEMENTATION STEPS

### STEP 1: UNDERSTAND THE TASK
**Input**: User request like "implement medical history/conditions" or "add patient/persinfo/addresses"

**Parse the request**:
- **Domain**: patient, pharmacy, admin
- **Group**: medhist, persinfo, medications, etc.
- **Item**: conditions, addresses, medications, etc.

**Map to naming convention**:
- **Database**: `{domain}__{group}__{item}` (e.g., `patient__medhist__conditions`)
- **View**: `v_{domain}__{group}__{item}` (e.g., `v_patient__medhist__conditions`)
- **API Path**: `/api/{domain-readable}/{group-readable}/{item}` (e.g., `/api/patient/medical-history/conditions`)

**Job Card**: Create `ai/jobcards/YYYYMMDD-{domain}-{group}-{item}-implementation.md`

### STEP 2: VERIFY DATABASE SCHEMA
**Find DDL**: Locate `ai/specs/ddl/{domain}__{group}__{item}_ddl.md`

**Verify with Supabase MCP**:
```
Use mcp__supabase-scrypto__list_tables to verify table exists
Use mcp__supabase-scrypto__execute_sql to check column names:
"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{domain}__{group}__{item}' ORDER BY ordinal_position"
```

**Checkpoint**: Write in job card:
```
## DATABASE VERIFICATION ✅
- Table `{domain}__{group}__{item}` exists
- View `v_{domain}__{group}__{item}` exists  
- Column names match DDL specification
- Checked via Supabase MCP on [date]
```

### STEP 3: CREATE ZOD SCHEMAS
**File**: `schemas/{item}.ts` (e.g., `schemas/conditions.ts`)

**Copy pattern from**: `schemas/allergies.ts`

**Required schemas**:
```ts
// Row schema - mirrors database exactly
export const {Item}RowSchema = z.object({
  {item}_id: z.string().uuid(),
  user_id: z.string().uuid(),
  // ... all columns from DDL
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_active: z.boolean(),
})

// Input schemas - business logic form
export const {Item}CreateInputSchema = {Item}RowSchema.omit({
  {item}_id: true,
  user_id: true, 
  created_at: true,
  updated_at: true,
  is_active: true,
})

export const {Item}UpdateInputSchema = {Item}CreateInputSchema.partial()

// List schemas
export const {Item}ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  // Add filter fields from DDL enums
})

export const {Item}ListResponseSchema = z.object({
  data: z.array({Item}RowSchema),
  total: z.number(),
  page: z.number(), 
  pageSize: z.number(),
})

// Export enums from DDL
export const {EnumName}Enum = z.enum([...]) // From DDL constraints
```

**Checkpoint**: Write in job card:
```
## SCHEMAS CREATED ✅
- File: schemas/{item}.ts
- Row/Create/Update/List schemas defined
- Enums exported from DDL constraints
- TypeScript types generated
```

### STEP 4: CREATE API ROUTES
**Files**:
- `app/api/{domain-readable}/{group-readable}/{item}/route.ts` (list GET, create POST)
- `app/api/{domain-readable}/{group-readable}/{item}/[id]/route.ts` (get GET, update PUT, delete DELETE)

**Copy pattern from**: `app/api/patient/medical-history/allergies/*`

**Required implementation**:
```ts
// route.ts - List and Create
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { {Item}CreateInputSchema } from '@/schemas/{item}'

export async function GET(request: NextRequest) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Parse query params with Zod
  // Query from view: v_{domain}__{group}__{item}
  // Return: { data, total, page, pageSize }
}

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Validate body with Zod
  // Insert to table: {domain}__{group}__{item}
  // Return 201 with created record
}
```

**Checkpoint**: Write in job card:
```
## API ROUTES CREATED ✅
- List/Create: app/api/{path}/route.ts
- Get/Update/Delete: app/api/{path}/[id]/route.ts
- CSRF verification on writes
- Auth checks implemented
- Reads from view, writes to table
- Error codes: 200/201/400/401/403/404/422/500
```

### STEP 5: CREATE HOOKS
**File**: `hooks/use{ItemPlural}.ts` (e.g., `hooks/usePatientConditions.ts`)

**Copy pattern from**: `hooks/usePatientAllergies.ts`

**Required hooks**:
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const {Item}Keys = {
  all: ['{item}s'] as const,
  list: (params?) => ['{item}s', 'list', params] as const,
  detail: (id: string) => ['{item}s', 'detail', id] as const,
}

export function use{ItemPlural}List(params?) { /* useQuery pattern */ }
export function use{Item}ById(id: string) { /* useQuery pattern */ }
export function useCreate{Item}() { /* useMutation with cache invalidation */ }
export function useUpdate{Item}() { /* useMutation with cache invalidation */ }
export function useDelete{Item}() { /* useMutation with cache invalidation */ }
```

**Checkpoint**: Write in job card:
```
## HOOKS CREATED ✅
- File: hooks/use{ItemPlural}.ts
- TanStack Query keys defined
- All CRUD hooks implemented
- Cache invalidation on mutations
- Error handling with ApiError
```

### STEP 6: CREATE PAGES (SERVER COMPONENTS)
**Files**:
- `app/{domain-readable}/{group-readable}/{item}/page.tsx` (list)
- `app/{domain-readable}/{group-readable}/{item}/new/page.tsx` (create)
- `app/{domain-readable}/{group-readable}/{item}/[id]/page.tsx` (detail/edit)

**Copy pattern from**: `app/patient/medhist/allergies/*`

**List page pattern**:
```ts
export const dynamic = 'force-dynamic'

export default async function {Item}ListPage({ searchParams }) {
  const supabase = await getServerClient()
  const spRaw = await searchParams
  
  // Parse searchParams with Zod
  // Query from view with filters/pagination
  // Pass initialData to client feature
  
  return (
    <ListPageLayout sidebarItems={patientNavItems} headerTitle="{Items}">
      <{Item}ListFeature 
        initialData={data || []}
        total={count || 0}
        initialState={parsedParams}
      />
    </ListPageLayout>
  )
}
```

**Checkpoint**: Write in job card:
```
## SERVER PAGES CREATED ✅
- List: app/{path}/page.tsx
- Create: app/{path}/new/page.tsx  
- Detail: app/{path}/[id]/page.tsx
- SSR data fetching from views
- Proper layouts used
- No requireUser() calls (middleware handles auth)
```

### STEP 7: CREATE FEATURE COMPONENTS (CLIENT)
**Files**:
- `components/features/{domain}/{group}/{Item}ListFeature.tsx`
- `components/features/{domain}/{group}/{Item}DetailFeature.tsx`
- `components/features/{domain}/{group}/{Item}CreateFeature.tsx`

**Copy pattern from**: `components/features/patient/allergies/*`

**Required features**:
- List: Uses `ListViewLayout` with search/filter/pagination
- Detail: Uses `DetailViewLayout` with React Hook Form + loading states
- Create: Uses `DetailViewLayout` with React Hook Form + validation

**Checkpoint**: Write in job card:
```
## FEATURE COMPONENTS CREATED ✅
- List feature with search/filter/pagination
- Detail feature with view/edit modes
- Create feature with form validation
- React Hook Form + Zod validation
- Loading states implemented
- Error handling with toasts
```

### STEP 8: ADD NAVIGATION
**File**: `config/{domain}Nav.ts` (e.g., `config/patientNav.ts`)

**Add nav entry**:
```ts
{
  id: '{item}',
  title: '{Items}',
  description: 'Manage {items}',
  icon: 'IconName',
  href: '/{domain-readable}/{group-readable}/{item}',
}
```

**Checkpoint**: Write in job card:
```
## NAVIGATION ADDED ✅
- Nav entry added to config/{domain}Nav.ts
- Accessible from sidebar navigation
- Proper routing configured
```

### STEP 9: TESTING AND VERIFICATION
**Test with Playwright MCP**:
1. Navigate to list page
2. Create new item
3. Edit existing item  
4. Delete item
5. Verify success toasts and list updates

**Required tests**:
```
✅ List loads without errors
✅ Create form works (success toast, returns to list)
✅ Edit form works (data populated, save successful)
✅ Delete works (confirmation dialog, success feedback)
✅ Loading states visible during operations
✅ Form validation prevents invalid submissions
```

**Checkpoint**: Write in job card:
```
## END-TO-END TESTING COMPLETE ✅
- All CRUD operations verified working
- Loading states confirmed visible
- Error handling tested
- Navigation flow tested
- Screenshots captured: {list-of-screenshots}
```

### STEP 10: FINAL VERIFICATION
**Code quality checks**:
```bash
npm run typecheck  # Must pass
npm run lint       # Must pass  
npm run build      # Must pass
```

**Spec alignment**:
- Authentication follows core/01-Authentication.md
- API follows core/02-API-Patterns.md
- Database follows core/03-Database-Access.md
- Forms follow verified allergies pattern

**Checkpoint**: Write in job card:
```
## IMPLEMENTATION COMPLETE ✅
- TypeScript compilation successful
- Linting clean
- Build successful
- Follows all core specs
- Matches allergies reference pattern
- Ready for production use
```

---

## JOB CARD TEMPLATE

```markdown
# Job Card - {Domain} {Group} {Item} Implementation

- Date: YYYY-MM-DD
- Owner: AI Agent
- Status: In Progress
- Reference: allergies implementation pattern

## TASK
Implement {domain}/{group}/{item} stream following verified allergies pattern.

## DATABASE VERIFICATION
- [ ] Table exists: {domain}__{group}__{item}
- [ ] View exists: v_{domain}__{group}__{item} 
- [ ] Columns match DDL specification
- [ ] Verified via Supabase MCP

## IMPLEMENTATION PROGRESS
- [ ] Zod schemas created (Row/Create/Update/List + enums)
- [ ] API routes created (list/create + get/update/delete)
- [ ] Hooks created (TanStack Query patterns)
- [ ] Server pages created (SSR with proper layouts)
- [ ] Feature components created (React Hook Form + validation)
- [ ] Navigation added to config

## TESTING CHECKLIST
- [ ] List page loads without errors
- [ ] Create functionality works end-to-end
- [ ] Edit functionality works end-to-end  
- [ ] Delete functionality works end-to-end
- [ ] Loading states visible during operations
- [ ] Form validation prevents invalid data
- [ ] TypeScript compiles clean
- [ ] Linting passes
- [ ] Build successful

## EVIDENCE
### Screenshots
- {item}-list-view.png
- {item}-create-form.png
- {item}-edit-form.png
- {item}-delete-confirmation.png

### Files Created
- schemas/{item}.ts
- app/api/{path}/route.ts
- app/api/{path}/[id]/route.ts
- hooks/use{ItemPlural}.ts
- app/{path}/page.tsx
- app/{path}/new/page.tsx
- app/{path}/[id]/page.tsx
- components/features/{domain}/{group}/{Item}ListFeature.tsx
- components/features/{domain}/{group}/{Item}DetailFeature.tsx
- components/features/{domain}/{group}/{Item}CreateFeature.tsx

## NOTES
- Follows allergies reference pattern exactly
- All core specs compliance verified
- Production-ready implementation
```

---

## QUALITY CONTROL CHECKLIST

Use this to verify any stream implementation:

### Code Patterns ✅
- [ ] No requireUser() calls in pages (middleware handles auth)
- [ ] Server pages use getServerClient() for data fetching
- [ ] API routes have CSRF verification on writes
- [ ] Hooks use TanStack Query with proper invalidation
- [ ] Forms use React Hook Form + Zod validation
- [ ] Loading states implemented with isPending flags
- [ ] Error boundaries protect against crashes

### File Structure ✅  
- [ ] Follows naming convention exactly
- [ ] API paths match pattern
- [ ] Component hierarchy matches allergies
- [ ] No duplicate or conflicting implementations

### Best Practices ✅
- [ ] Client-side validation before submit
- [ ] Server-side validation in API routes  
- [ ] Proper error feedback (toasts, form errors)
- [ ] Loading indicators during mutations
- [ ] Graceful error handling
- [ ] Accessibility attributes on forms

**If any checkbox is unchecked, the implementation is incomplete and must be fixed before marking as done.**