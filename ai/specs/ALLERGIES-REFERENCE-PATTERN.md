# Allergies Reference Pattern - Complete End-to-End Implementation

**STATUS**: ✅ PRODUCTION READY (2025-08-30)
**PURPOSE**: Exact pattern for implementing any Scrypto stream (50+ streams)

---

## VERIFIED WORKING IMPLEMENTATION

### File Structure (Copy Exactly)
```
app/patient/medhist/allergies/
├── page.tsx                    # List page (SSR)
├── new/page.tsx               # Create page (SSR)  
└── [id]/page.tsx              # Detail page (SSR)

app/api/patient/medical-history/allergies/
├── route.ts                   # List GET, Create POST
└── [id]/route.ts              # Get GET, Update PUT, Delete DELETE

config/
├── allergiesListConfig.ts     # List configuration (67 lines)
└── allergiesDetailConfig.ts   # Detail configuration (90 lines)

components/features/patient/allergies/
├── AllergiesListFeature.tsx   # List component (27 lines)
└── AllergyDetailFeature.tsx   # Detail component (13 lines)

components/layouts/
├── GenericListFeature.tsx     # Reusable list component (276 lines)
├── GenericDetailFeature.tsx   # Reusable detail component (305 lines)
└── ListViewLayout.tsx         # Base list UI component

components/patterns/
└── FilterModal.tsx            # Reusable filter modal (125 lines)

schemas/allergies.ts           # Zod validation schemas
hooks/usePatientAllergies.ts   # TanStack Query hooks

tests/e2e/allergies.spec.ts    # E2E tests with screenshots
__tests__/schemas/allergies.test.ts  # Schema validation tests
__tests__/api/allergies.test.ts      # API integration tests
```

---

## AUTHENTICATION PATTERN (VERIFIED WORKING)

### Environment Configuration (REQUIRED)
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://hyufvcwzuaihmyohvwpv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:4569
CSRF_ALLOWED_ORIGINS=http://localhost:4569,https://qa.scrypto.online
```

### Server Client Implementation (lib/supabase-server.ts)
```ts
export async function getServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // CRITICAL: Single try-catch only - allows token refresh in API routes
          }
        },
      },
    }
  )
}
```

### Server Pages Pattern
```ts
// No requireUser() needed - middleware protects /patient/* routes
const supabase = await getServerClient()
const { data } = await supabase
  .from('v_patient__medhist__allergies')
  .select('*')
```

### API Routes Pattern
```ts
export async function PUT(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // WORKS: Token refresh succeeds due to corrected setAll function
}
```

---

## UI DESIGN PATTERNS (MODERN)

### List View
- **Header**: App shows "Scrypto", page shows "Allergies"
- **Sticky header**: Search bar + action buttons (no gaps)
- **Items**: 2-letter square badges (PE, IB, CA)
- **Actions**: Select/Filter (left) → Add new (right)
- **Select mode**: [Checkbox] Cancel (left) → Delete → Export (right)

### Detail View  
- **Header**: App shows "Scrypto", sticky shows "Viewing/Editing Allergy"
- **Layout toggle**: Table view (label: field) ↔ Stacked view (label above field)
- **Actions**: Layout toggle (left) → Edit/Save/Delete/Cancel (right)
- **Styling**: Blue theme, red asterisks for required fields, pink error states

### Create View
- **Identical to detail**: Same sticky header, same layouts, same styling
- **Title**: "Add New Allergy" instead of allergen name
- **Actions**: Layout toggle (left) → Create/Cancel (right)

---

## DATA LAYER PATTERN

### Database Access
- **Reads**: From views `v_patient__medhist__allergies` (RLS-scoped)
- **Writes**: To tables `patient__medhist__allergies` with ownership enforcement
- **All operations**: Filter by `user_id` for data isolation

### TanStack Query Implementation
```ts
export function useUpdateAllergy() {
  const queryClient = useQueryClient()
  return useMutation<AllergyRow, Error, { id: string; data: AllergyUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw await ApiError.fromResponse(response)
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
      queryClient.invalidateQueries({ queryKey: ['allergies', 'detail', data.allergy_id] })
    },
  })
}
```

---

## FORM PATTERNS (REACT HOOK FORM + ZOD)

### Validation Implementation
```ts
const form = useForm<AllergyFormData>({
  resolver: zodResolver(allergyFormSchema),
  defaultValues: { /* from allergy data or empty */ }
})

// Error states for required fields
className={`...base-styles ${errors.allergen ? 'bg-red-50 border-red-300' : ''}`}
```

### Field Styling
- **Required fields**: Red asterisks `<span className="text-red-500">*</span>`
- **Labels**: Blue headings `text-blue-600 dark:text-blue-400`
- **Tooltips**: Lighter blue `text-blue-400 dark:text-blue-300` with indent `ml-4`
- **Error states**: Pink background for validation errors

---

## TESTING PATTERN (COMPREHENSIVE)

### Test Coverage
- **25+ tests passing**: Schemas, API endpoints, E2E workflows
- **Screenshot evidence**: 7 images with DDMMYYYY naming in `ai/testing/`
- **DDL compliance**: All tests based on actual database schema

### E2E Test Flow
```ts
// Login → Navigate → Create → Edit → Delete → Verify
await page.goto('/login')
await page.getByRole('textbox', { name: 'email@example.com' }).fill('t@t.com')
await page.getByRole('textbox', { name: '••••••••' }).fill('t12345')
await page.getByRole('button', { name: 'Continue', exact: true }).click()
// Complete CRUD operations with screenshot capture
```

---

## COMPONENT ARCHITECTURE (BEST PRACTICES)

### Server Components (Pages)
- **List**: `app/patient/medhist/allergies/page.tsx`
- **Detail**: `app/patient/medhist/allergies/[id]/page.tsx`
- **Create**: `app/patient/medhist/allergies/new/page.tsx`

### Client Components (Features)
- **AllergiesListFeature**: Handles list interactions, search, filters
- **AllergyDetailFeature**: Handles view/edit mode, form submission
- **AllergyCreateFeature**: Handles new allergy creation

### UI Components (Reusable)
- **ActionButtons**: Select/Add/Delete/Export button logic
- **ErrorBoundary**: App-level error handling
- **QueryProvider**: TanStack Query configuration

---

## CORE SPECIFICATIONS COMPLIANCE

### Following Core Specs
1. **01-Authentication.md**: Middleware protection, CSRF, environment setup ✅
2. **02-API-Patterns.md**: Status codes, error handling, validation ✅
3. **03-Database-Access.md**: Views for reads, tables for writes ✅
4. **04-Zod-Validation.md**: Schema validation, enum constraints ✅
5. **05-Layout-Components.md**: Proper component hierarchy ✅
6. **06-SSR-Architecture.md**: Server pages, client components ✅
7. **07-Navigation-URL-State.md**: URL-driven state management ✅
8. **08-Component-Hierarchy.md**: Clear naming conventions ✅
9. **09-State-Management.md**: TanStack Query implementation ✅

---

## DEPLOYMENT READINESS

### Quality Gates Passed
- ✅ **TypeScript compilation**: Clean, no errors
- ✅ **Authentication working**: 403 → 401 → 200 progression verified
- ✅ **CRUD operations**: Create, read, update, delete all functional
- ✅ **Form validation**: Client and server validation working
- ✅ **Error handling**: Graceful failure with user feedback
- ✅ **Loading states**: Visual feedback during operations
- ✅ **Test coverage**: Comprehensive validation and E2E testing

### Performance Verified
- **Authentication**: Session management and token refresh working
- **UI responsiveness**: Sticky headers, smooth transitions
- **Data persistence**: All operations save correctly to database
- **Mobile ready**: Responsive design with proper spacing

---

## REPLICATION INSTRUCTIONS

### For Any New Stream
1. **Read DDL specification** for data structure
2. **Copy allergies folder structure** exactly
3. **Replace "allergies" with your item name** throughout
4. **Update schemas** based on DDL constraints
5. **Follow test patterns** for validation and E2E coverage
6. **Use ActionButtons component** for consistent UI
7. **Apply same styling**: Blue theme, sticky headers, 2-letter badges

### Critical Success Factors
- **Environment variables**: Must be configured for authentication
- **Component separation**: Don't put business logic in layout components
- **Test first**: Create tests based on DDL, then implement
- **Single source**: One component per purpose, replace don't duplicate

**This implementation is VERIFIED WORKING and ready for production use.**