# Parallel Implementation Strategy - V2 Pages

**Status:** RECOMMENDED APPROACH  
**Created:** 2025-08-26  
**Purpose:** Scale quickly without breaking existing code  

---

## Strategy: Parallel Work Trees

Create NEW v2 pages alongside existing ones, allowing:
- Immediate development without breaking current functionality
- Gradual migration when convenient
- Testing both versions side-by-side
- Quick rollback if needed

---

## Folder Structure

```
app/
├── patient/
│   ├── medhist/
│   │   ├── allergies/          # Current (broken navigation)
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   └── allergies-v2/       # NEW - Next.js 15 compliant
│   │       ├── page.tsx
│   │       ├── new/
│   │       └── [id]/
│   │           ├── page.tsx     # Async wrapper
│   │           └── client.tsx   # Client component
```

---

## Implementation Pattern for V2 Pages

### 1. List Page (No Changes Needed)
```typescript
// app/patient/medhist/allergies-v2/page.tsx
// Can copy existing page - it works fine
export { default } from '../allergies/page'
```

### 2. Dynamic Route Page (MUST UPDATE)
```typescript
// app/patient/medhist/allergies-v2/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AllergyPageV2({ params }: PageProps) {
  const { id } = await params
  return <AllergyDetailClient allergyId={id} />
}
```

```typescript
// app/patient/medhist/allergies-v2/[id]/client.tsx
'use client'

interface AllergyDetailClientProps {
  allergyId: string
}

export default function AllergyDetailClient({ allergyId }: AllergyDetailClientProps) {
  // Move ALL logic from original [id]/page.tsx here
  // But use allergyId prop instead of params.id
  const { data: allergy } = useAllergyById(allergyId)
  // ... rest of component
}
```

### 3. New/Create Page (Minor Updates)
```typescript
// app/patient/medhist/allergies-v2/new/page.tsx
'use client'

export default function NewAllergyPageV2() {
  const router = useRouter()
  
  // Update navigation to v2 routes
  const handleSuccess = () => {
    router.push('/patient/medhist/allergies-v2')
  }
  
  const handleCancel = () => {
    router.push('/patient/medhist/allergies-v2')
  }
  
  // ... rest stays the same
}
```

---

## Quick Start Commands

```bash
# 1. Create v2 directory structure
mkdir -p app/patient/medhist/allergies-v2/\[id\]
mkdir -p app/patient/medhist/allergies-v2/new

# 2. Copy and modify files
cp app/patient/medhist/allergies/page.tsx app/patient/medhist/allergies-v2/
cp app/patient/medhist/allergies/new/page.tsx app/patient/medhist/allergies-v2/new/

# 3. Create new [id] pages with async handling
# (Use the patterns above)
```

---

## Navigation Updates for V2

### In List Page
```typescript
// app/patient/medhist/allergies-v2/page.tsx
onAdd={() => router.push('/patient/medhist/allergies-v2/new')}
onRowClick={(row) => router.push(`/patient/medhist/allergies-v2/${row.allergy_id}`)}
onEdit={(row) => router.push(`/patient/medhist/allergies-v2/${row.allergy_id}`)}
```

### In Detail Pages
```typescript
// Update all navigation to use -v2 routes
onBack={() => router.push('/patient/medhist/allergies-v2')}
onSuccess={() => router.push('/patient/medhist/allergies-v2')}
```

---

## Testing Strategy

1. **Keep both versions running**
   - `/patient/medhist/allergies` - Current version
   - `/patient/medhist/allergies-v2` - New version

2. **Test v2 thoroughly**
   - All CRUD operations
   - Navigation works
   - No console errors

3. **Gradual migration**
   - Update links one by one
   - Monitor for issues
   - Easy rollback if needed

---

## Benefits of This Approach

✅ **No Breaking Changes** - Current app keeps working  
✅ **Parallel Development** - Multiple devs can work on different v2 pages  
✅ **Easy Testing** - Compare old vs new side-by-side  
✅ **Safe Rollback** - Just change URLs back if issues  
✅ **Incremental Migration** - Move users gradually  

---

## Migration Checklist

For each module (allergies, conditions, medications, etc.):

- [ ] Create -v2 directory structure
- [ ] Copy list page (usually works as-is)
- [ ] Create async wrapper for [id] page
- [ ] Move [id] logic to client component
- [ ] Update all internal navigation to v2 routes
- [ ] Test all CRUD operations
- [ ] Test navigation flow
- [ ] Verify no console errors
- [ ] Update main navigation to point to v2

---

## Example File Tree After Implementation

```
allergies-v2/
├── page.tsx                    # List (copy of original)
├── new/
│   └── page.tsx               # Create (updated nav)
└── [id]/
    ├── page.tsx               # Async wrapper (NEW)
    ├── client.tsx             # Client component (logic from original)
    └── edit/
        └── page.tsx           # Optional: Separate edit page
```

---

## When to Switch

Switch from `/allergies` to `/allergies-v2` when:
1. All CRUD operations tested ✓
2. Navigation working perfectly ✓
3. No console errors ✓
4. Performance acceptable ✓
5. User acceptance tested ✓

Then update main navigation menu to point to v2 routes.

---

## Rollback Plan

If issues found after switching:
1. Change navigation back to non-v2 routes
2. Debug v2 version while users continue on stable version
3. Fix and test again
4. Re-deploy when ready

---

**THIS APPROACH ALLOWS IMMEDIATE SCALING WITHOUT BREAKING EXISTING FUNCTIONALITY**