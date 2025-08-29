# CRITICAL: Next.js 15 Breaking Changes - V2 Spec

**Status:** URGENT - Blocks ALL Scaling  
**Created:** 2025-08-26  
**Priority:** HIGHEST  
**Impact:** Affects EVERY dynamic route in the application  

---

## The Problem

Next.js 15 has made `params` and `searchParams` asynchronous. This is a BREAKING CHANGE that affects:
- All [id] pages
- All [slug] pages  
- Any dynamic route segments
- searchParams access

**Current Error:** "params is now a Promise and should be unwrapped with React.use()"

---

## V2 Pattern: Async Params Handling

### For Client Components ('use client')

```typescript
'use client'
import { use } from 'react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function ClientPage({ params, searchParams }: PageProps) {
  // Unwrap the promises
  const { id } = use(params)
  const search = searchParams ? use(searchParams) : {}
  
  // Now use id normally
  const { data } = useDataById(id)
  
  return <div>...</div>
}
```

### For Server Components (Recommended)

```typescript
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ServerPage({ params, searchParams }: PageProps) {
  // Await the promises
  const { id } = await params
  const search = searchParams ? await searchParams : {}
  
  // Fetch data server-side
  const data = await fetchDataById(id)
  
  return <ClientComponent initialData={data} id={id} />
}
```

### Hybrid Pattern (Best for Scrypto)

```typescript
// app/patient/medhist/allergies/[id]/page.tsx
import { use } from 'react'
import ClientAllergyView from './ClientAllergyView'

interface PageProps {
  params: Promise<{ id: string }>
}

// Thin async wrapper
export default async function AllergyPage({ params }: PageProps) {
  const { id } = await params
  
  // Pass resolved id to client component
  return <ClientAllergyView allergyId={id} />
}
```

```typescript
// app/patient/medhist/allergies/[id]/ClientAllergyView.tsx
'use client'

interface ClientAllergyViewProps {
  allergyId: string
}

export default function ClientAllergyView({ allergyId }: ClientAllergyViewProps) {
  const { data: allergy } = useAllergyById(allergyId)
  // ... rest of the component logic
}
```

---

## Migration Strategy for Scrypto

### Phase 1: Fix Breaking Pages (IMMEDIATE)
1. Update all [id] pages to handle async params
2. Use the hybrid pattern above
3. Test each page after update

### Phase 2: Standardize Pattern (THIS WEEK)
1. Create reusable wrapper components
2. Update all dynamic routes
3. Add TypeScript types for PageProps

### Phase 3: Optimize (NEXT WEEK)
1. Move appropriate data fetching to server
2. Implement streaming where beneficial
3. Add proper loading states

---

## Files That MUST Be Updated

### Critical (Breaking Now)
- `app/patient/medhist/allergies/[id]/page.tsx`
- `app/patient/persinfo/profile/[id]/page.tsx` (if exists)
- `app/patient/medications/[id]/page.tsx` (if exists)
- Any other [id] or [slug] routes

### Pattern Files to Update
- Create `types/next15.ts` with standard PageProps types
- Update all page templates

---

## Example Fix for Allergies

```typescript
// app/patient/medhist/allergies/[id]/page.tsx
import { use } from 'react'
import AllergyDetailClient from './AllergyDetailClient'

interface AllergyPageProps {
  params: Promise<{ id: string }>
}

export default async function AllergyPage({ params }: AllergyPageProps) {
  const { id } = await params
  return <AllergyDetailClient allergyId={id} />
}
```

```typescript
// app/patient/medhist/allergies/[id]/AllergyDetailClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAllergyById, useUpdateAllergy, useDeleteAllergy } from '@/hooks/usePatientAllergies'
// ... rest of the original component code, but using allergyId prop instead of params.id
```

---

## Testing After Fix

```bash
# Test locally
npm run dev

# Check for params errors in console
# Should see ZERO "params is now a Promise" errors

# Test navigation
# All router.push() calls should work
```

---

## Why This Matters for Scaling

1. **Performance**: Server components can fetch data in parallel
2. **SEO**: Server-rendered content is immediately available
3. **Type Safety**: Proper types prevent runtime errors
4. **Future Proof**: Aligns with Next.js direction
5. **Streaming**: Enables progressive rendering

---

## DO NOT

- ❌ Access params.id directly in client components
- ❌ Use params without await/use
- ❌ Ignore TypeScript errors about Promise types
- ❌ Mix old and new patterns in same file

## ALWAYS

- ✅ Await params in server components
- ✅ Use `use()` in client components
- ✅ Type params as Promise<T>
- ✅ Test after each update
- ✅ Keep pattern consistent across app

---

## References

- [Next.js 15 Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Async Request APIs](https://nextjs.org/docs/messages/sync-dynamic-apis)

---

**THIS MUST BE FIXED BEFORE ANY OTHER WORK PROCEEDS**