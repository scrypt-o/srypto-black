# Scrypto Stream Implementation Guide

## WHAT IS SCRYPTO

Scrypto is a medical portal built with **Next.js 15**, **TypeScript**, **Supabase**, and **TanStack Query**. 

### DESIGN PHILOSOPHY
- **SSR-First**: Server components fetch data, client components handle interactions
- **Middleware Authentication**: Route protection at edge, no page-level auth calls
- **Database Security**: Reads from RLS views, writes to base tables with ownership enforcement
- **Type Safety**: Zod schemas as single source of truth for all data shapes

### ARCHITECTURE LAYERS

#### 1. DATABASE LAYER
- **Tables**: `patient__medhist__allergies` (snake_case naming)
- **Views**: `v_patient__medhist__allergies` (RLS-filtered reads)
- **Purpose**: Data storage with user isolation and soft deletes

#### 2. API LAYER  
- **Routes**: `/api/patient/medical-history/allergies` (kebab-case URLs)
- **Security**: CSRF protection + user authentication + ownership enforcement
- **Validation**: Zod schemas validate all inputs/outputs

#### 3. HOOKS LAYER
- **Files**: `hooks/usePatientAllergies.ts`
- **Purpose**: TanStack Query wrappers for API calls with cache management
- **Pattern**: useList, useById, useCreate, useUpdate, useDelete

#### 4. PAGES LAYER (SERVER COMPONENTS)
 - **Files**: `app/patient/medhist/allergies/page.tsx` (list, detail, create)
 - **Purpose**: Server-side data fetching, SSR with initial data
 - **Pattern**: Fetch from views, pass data to client features
 - **Shells**: Use `ListPageLayout` for lists, `DetailPageLayout` for details, `TilePageLayout` for hubs. Do not use `PageShell` directly.

#### 5. FEATURES LAYER (CLIENT COMPONENTS)  
- **Files**: `components/features/patient/allergies/AllergiesListFeature.tsx`
- **Purpose**: Interactive UI with forms, mutations, state management
- **Pattern**: Receive initial data, handle user interactions, manage loading/error states

### WHY THIS ARCHITECTURE
- **Security**: Authentication at edge, data isolation at database level
- **Performance**: Server-side rendering with client-side interactions
- **Maintainability**: Clear separation between data fetching and UI logic
- **Scalability**: Consistent patterns across 50+ streams

---

## IMPLEMENTATION PROCESS

You will follow this exact process to implement any new stream. Each step includes verification checkpoints to ensure correctness.

```
SCRYPTO STREAM IMPLEMENTATION FLOW

┌─────────────────────────────────────────────────────────────────┐
│                         START HERE                              │
│                    User Request: "Add X"                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: PARSE REQUEST                                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Parse: domain__group__item                              │    │
│  │ Map to: API paths, file names, navigation               │    │
│  │ [Check: Does naming convention make sense?]             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: VERIFY DATABASE                                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Find DDL: ai/specs/ddl/{domain}__{group}__{item}_ddl.md │    │
│  │ Check table exists: mcp__supabase__execute_sql          │    │
│  │ Check view exists: v_{domain}__{group}__{item}          │    │
│  │ Verify columns match DDL specification                  │    │
│  │ [Check: Table + view exist? Columns match DDL?]        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: CREATE ZOD SCHEMAS                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Copy: schemas/allergies.ts                              │    │
│  │ Update: Column names, enum values from DDL              │    │
│  │ Create: Row/Create/Update/List schemas + types          │    │
│  │ [Check: npm run typecheck passes? Enums match DDL?]    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: CREATE API ROUTES                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Copy: app/api/patient/medical-history/allergies/        │    │
│  │ Update: Schema imports, table/view names                │    │
│  │ Verify: CSRF + auth + validation patterns               │    │
│  │ [Check: Compiles? Auth working? Error codes correct?]   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: CREATE TANSTACK HOOKS                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Copy: hooks/usePatientAllergies.ts                      │    │
│  │ Update: API endpoints, schema types, cache keys         │    │
│  │ Verify: Query keys, mutation patterns, invalidation     │    │
│  │ [Check: Hooks compile? Cache keys consistent?]          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: CREATE SERVER PAGES                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Copy: app/patient/medhist/allergies/*.tsx               │    │
│  │ Update: View names, feature component imports           │    │
│  │ Verify: SSR data fetching, layout usage                 │    │
│  │ [Check: Pages compile? Data fetching works?]            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: CREATE FEATURE COMPONENTS                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Read: AllergiesListFeature.tsx (understand patterns)    │    │
│  │ Copy: Entire file to ConditionsListFeature.tsx         │    │
│  │ Update: Field names, schema imports, hook calls         │    │
│  │ Test: npm run typecheck after each change               │    │
│  │ [Check: Interfaces match? Fields exist? APIs correct?]  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: ADD NAVIGATION                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Update: Medical history page tile config                │    │
│  │ Add: Navigation entry pointing to correct path          │    │
│  │ [Check: Navigation link works? Points to right page?]   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 9: END-TO-END TESTING                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Test: npm run typecheck (must pass)                     │    │
│  │ Test: npm run build (must pass)                         │    │
│  │ Test: Playwright MCP full CRUD flow                     │    │
│  │ [Check: Create works? Edit works? Delete works?]        │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUCCESS ✅                                   │
│                Stream Ready for Production                      │
│            Update Job Card with Evidence                       │
└─────────────────────────────────────────────────────────────────┘

VERIFICATION CHECKPOINTS:
[Database] → Table + view exist, columns match DDL
[Schemas] → TypeScript compiles, enums match constraints  
[API] → Auth + CSRF + validation working, correct status codes
[Hooks] → TanStack patterns, cache invalidation working
[Pages] → SSR data fetching, proper layouts used
[Features] → UI components work, forms validate, mutations succeed
[Navigation] → Links work, routing correct
[Testing] → Full CRUD cycle verified with Playwright
```

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
**Example**: Look at `schemas/allergies.ts` as your template
**Create**: `schemas/{item}.ts` (e.g., `schemas/conditions.ts`)

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
**Example**: Look at `app/api/patient/medical-history/allergies/route.ts` and `app/api/patient/medical-history/allergies/[id]/route.ts` as your templates
**Create**:
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
**Example**: Look at `hooks/usePatientAllergies.ts` as your template
**Create**: `hooks/use{ItemPlural}.ts` (e.g., `hooks/usePatientConditions.ts`)

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
**Examples**: Look at these files as your templates:
- `app/patient/medhist/allergies/page.tsx` (list page)
- `app/patient/medhist/allergies/new/page.tsx` (create page)  
- `app/patient/medhist/allergies/[id]/page.tsx` (detail page)

**Create**:
- `app/{domain-readable}/{group-readable}/{item}/page.tsx` (list)
- `app/{domain-readable}/{group-readable}/{item}/new/page.tsx` (create)
- `app/{domain-readable}/{group-readable}/{item}/[id]/page.tsx` (detail/edit)

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
- `config/{item}ListConfig.ts` (list configuration)
- `config/{item}DetailConfig.ts` (detail configuration)
- `components/features/{domain}/{group}/{Item}ListFeature.tsx` (27 lines)
- `components/features/{domain}/{group}/{Item}DetailFeature.tsx` (13 lines)

**CONFIGURATION-DRIVEN METHOD**:

1. **Create configuration file**:
   ```typescript
   // config/{item}ListConfig.ts
   export const {item}ListConfig: ListFeatureConfig<{Item}Row, {Item}Item> = {
     entityName: '{item}',
     entityNamePlural: '{items}',
     basePath: '/{domain-readable}/{group-readable}/{item}',
     
     // DDL field mappings
     transformRowToItem: (row: {Item}Row): {Item}Item => ({
       id: row.{item}_id,           // Primary key from DDL
       title: row.{main_field},     // Display field from DDL
       severity: mapSeverity(row.severity), // Business logic mapping
       // ... other DDL column mappings
     }),
     
     // Filter configuration from DDL enums
     filterFields: [
       {
         key: 'severity',
         label: 'Severity',
         options: SeverityEnum.options.map(opt => ({ value: opt, label: opt }))
       }
     ],
     
     hooks: { useDelete: useDelete{Item} }
   }
   ```

2. **Create minimal feature component**:
   ```typescript
   // components/features/{domain}/{group}/{Item}ListFeature.tsx
   import GenericListFeature from '@/components/layouts/GenericListFeature'
   import { {item}ListConfig } from '@/config/{item}ListConfig'
   
   export default function {Item}ListFeature(props) {
     return <GenericListFeature {...props} config={{item}ListConfig} />
   }
   ```

3. **Verify implementation**:
   ```bash
   npm run typecheck  # Must pass
   npm run dev        # Test in browser
   ```

3. **Create detail configuration**:
   ```typescript
   // config/{item}DetailConfig.ts
   export const {item}DetailConfig: DetailFeatureConfig = {
     entityName: '{item}',
     entityNamePlural: '{items}',
     listPath: '/{domain-readable}/{group-readable}/{item}',
     
     // Form schema and transformation
     formSchema: {item}FormSchema,
     transformRowToFormData: (row) => ({ /* DDL field mappings */ }),
     
     // Field definitions from DDL
     fields: [
       {
         key: '{field_name}',
         label: '{Field Label}',
         type: 'text' | 'textarea' | 'select' | 'date',
         required: true,
         description: 'Field description from DDL'
       }
     ],
     
     hooks: { 
       useUpdate: useUpdate{Item},
       useDelete: useDelete{Item} 
     }
   }
   ```

4. **Create minimal feature components**:
   ```typescript
   // List Feature (27 lines)
   export default function {Item}ListFeature(props) {
     return <GenericListFeature {...props} config={{item}ListConfig} />
   }
   
   // Detail Feature (13 lines)  
   export default function {Item}DetailFeature({ {item} }) {
     return <GenericDetailFeature data={{item}} config={{item}DetailConfig} />
   }
   ```

**RESULT: 40 lines per stream instead of 685+ lines of duplicated code.**

**Checkpoint**: Write in job card:
```
## FEATURE COMPONENTS CREATED ✅
- List configuration with DDL-derived field mappings (67 lines)
- Detail configuration with form fields and validation (90 lines)
- List feature component using GenericListFeature (27 lines)
- Detail feature component using GenericDetailFeature (13 lines)
- All functionality inherited: CRUD, forms, validation, UI states
- TanStack Query, FilterModal, ConfirmDialog integration
- 94% code reduction achieved (40 lines vs 685+ lines)
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
### Page Verification Checklist (UI rules)
- Header: Back (nested) vs Hamburger (top-level) — never both; no user menu.
- Single H1: title rendered by ListViewLayout/DetailViewLayout; header is chrome only.
- Sticky offsets: list/detail sticky bars at `top-14 md:top-16`.
- Lists: may enable polish (`previewPolish`) or via Settings; no behavior changes.
- Tiles: optional `expressive` and `composition='hero'` where appropriate; icons are Lucide.
- No inline SVGs in tiles; use components/assets.
