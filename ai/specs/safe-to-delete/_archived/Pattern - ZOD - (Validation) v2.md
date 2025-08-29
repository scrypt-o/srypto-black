**Summary**  
A tiny, strict **Zod schema pattern** that keeps **one set of column names** across every layer: **DB = API = Zod = TanStack = Page**. Each entity gets three schemas (Row, CreateInput, UpdateInput) and optional ListQuery/ApiResponse schemas. **CRITICAL v2 ENHANCEMENTS**: Proper enum validation, UI option derivation, input normalization patterns, and consistent response formats.

**Rationale for pattern**

- **Zero mapping bugs:** same keys everywhere (snake_case).
    
- **Single source of truth:** Zod infers TS types for hooks, pages, and API.
    
- **Simple & safe:** minimal rules (string/number/enum/date/nullable), easy to copy/paste per entity.

- **Enum enforcement:** UI options derive from Zod enums to prevent drift.

- **Input normalization:** Consistent handling of empty strings and optional fields.
    

---

## Details

- **Naming rule:** use the **same snake_case keys** end-to-end (e.g., `allergen`, `severity`, `created_at`, `deleted_at`).
    
- **Schemas per entity:**
    
    1. **Row** (DB row as returned by API; includes server-managed fields like ids/timestamps)
        
    2. **CreateInput** (payload allowed on POST; excludes server-managed fields)
        
    3. **UpdateInput** (payload for PUT; partial of updatable fields + id)
        
- **Soft delete:** include nullable `deleted_at: string | null` in Row; omit from Create; optional in Update if you support restore/soft-delete.
    
- **Types everywhere:** `export type X = z.infer<typeof XRow>` then reuse in TanStack hooks, ListView columns, and pages.
    
- **No transforms/regex:** just `.string() | .number() | z.enum([...]) | z.nullable(z.string())`.
    

---

## Code (copy/paste template, example: `allergy`)

```ts
// /schemas/allergy.ts
import { z } from 'zod'

/** Enums (keep them small & explicit) */
export const AllergenTypeEnum = z.enum(['food', 'medication', 'environmental', 'other'])
export const SeverityEnum = z.enum(['mild', 'moderate', 'severe', 'life_threatening'])
export type AllergenType = z.infer<typeof AllergenTypeEnum>
export type Severity = z.infer<typeof SeverityEnum>

/** 1) DB Row shape (as your API returns it) - CRITICAL: Use enum types not strings */
export const AllergyRow = z.object({
  allergy_id: z.string().uuid(),     // uuid (string)
  user_id: z.string().uuid(),        // server-managed (still part of the row)
  allergen: z.string(),
  allergen_type: AllergenTypeEnum,   // CRITICAL: Use enum not z.string()
  severity: SeverityEnum,            // CRITICAL: Use enum not z.string()
  reaction: z.string().nullable().optional(),
  first_observed: z.string().nullable().optional(), // Date as ISO string
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  trigger_factors: z.string().nullable().optional(),
  emergency_action_plan: z.string().nullable().optional(),
  created_at: z.string(),            // ISO datetime string
  updated_at: z.string().optional(), // ISO
  deleted_at: z.string().nullable().optional(), // soft delete
})
export type Allergy = z.infer<typeof AllergyRow>

/** 2) Create payload (POST) — only fields client is allowed to send */
export const AllergyCreateInput = z.object({
  allergen: z.string().min(1).max(200),
  allergen_type: AllergenTypeEnum,
  severity: SeverityEnum,
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(), // Date as YYYY-MM-DD
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})
export type AllergyCreate = z.infer<typeof AllergyCreateInput>

/** 3) Update payload (PUT) — partial updatable fields */
export const AllergyUpdateInput = z.object({
  allergen: z.string().min(1).max(200).optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
  reaction: z.string().max(1000).optional(),
  first_observed: z.string().optional(),
  notes: z.string().optional(),
  trigger_factors: z.string().optional(),
  emergency_action_plan: z.string().optional(),
})
export type AllergyUpdate = z.infer<typeof AllergyUpdateInput>

/** Optional: List query params (server-side pagination/filter) */
export const AllergyListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  allergen_type: AllergenTypeEnum.optional(),
  severity: SeverityEnum.optional(),
})
export type AllergyListQueryType = z.infer<typeof AllergyListQuery>

/** CRITICAL: API list response - Use 'data' not 'items' (matches REST standards) */
export const AllergyListResponse = z.object({
  data: z.array(AllergyRow),            // CRITICAL: Use 'data' property 
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
})
export type AllergyListResponseType = z.infer<typeof AllergyListResponse>
```

### Use in your Next.js API routes

```ts
// /app/api/patient/medhist/allergies/route.ts  (GET list, POST create)
import { NextRequest, NextResponse } from 'next/server'
import { AllergyCreateInput, AllergyListQuery, AllergyListResponse } from '@/schemas/allergy'
// getServerClient enforces Supabase auth + RLS
import { getServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const parsed = AllergyListQuery.parse({
    page: url.searchParams.get('page'),
    pageSize: url.searchParams.get('pageSize'),
    search: url.searchParams.get('search') ?? '',
  })

  const supabase = await getServerClient()
  const from = (parsed.page - 1) * parsed.pageSize
  const to = from + parsed.pageSize - 1

  let query = supabase
    .from('v_patient__medhist__allergies') // RLS-scoped view
    .select('*', { count: 'exact' })
    .ilike('allergen', `%${parsed.search}%`)
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const payload = AllergyListResponse.parse({
    data: data, total: count ?? 0, page: parsed.page, pageSize: parsed.pageSize
  })
  return NextResponse.json(payload)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const input = AllergyCreateInput.parse(body)

  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('patient__medhist__allergies')
    .insert(input) // server sets user_id, created_at
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data) // matches AllergyRow
}
```

### Use in TanStack hooks (types line up automatically)

```ts
// /hooks/useAllergies.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Allergy, AllergyListResponseType, AllergyCreate, AllergyUpdate } from '@/schemas/allergy'
import { AllergyKeys } from './useAllergies.keys' // your keys object from earlier
import { fetchJson } from '@/lib/api' // your small fetch helper

export function useAllergiesList(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const qp = new URLSearchParams({ page: String(params.page ?? 1), pageSize: String(params.pageSize ?? 20), search: params.search ?? '' })
  return useQuery({
    queryKey: AllergyKeys.list({ ...params }),
    queryFn: () => fetchJson<AllergyListResponseType>(`/api/patient/medhist/allergies?${qp}`),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useCreateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AllergyCreate) =>
      fetchJson<Allergy>(`/api/patient/medhist/allergies`, { method: 'POST', body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: AllergyKeys.all }),
  })
}

export function useUpdateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AllergyUpdate) =>
      fetchJson<Allergy>(`/api/patient/medhist/allergies/${payload.allergy_id}`, { method: 'PUT', body: payload }),
    onSuccess: (_data, p) => {
      qc.invalidateQueries({ queryKey: AllergyKeys.detail(p.allergy_id) })
      qc.invalidateQueries({ queryKey: AllergyKeys.all })
    },
  })
}
```

### Use in pages/forms (React Hook Form optional)

```ts
// /app/patient/medhist/allergies/new/page.tsx  (plain form example)
'use client'
import { AllergyCreateInput, type AllergyCreate } from '@/schemas/allergy'
import { useCreateAllergy } from '@/hooks/useAllergies'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAllergyPage() {
  const router = useRouter()
  const create = useCreateAllergy()
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = async (formData: FormData) => {
    setApiError(null)
    
    // CRITICAL: Normalize empty strings to undefined for optional fields
    const raw: AllergyCreate = {
      allergen: String(formData.get('allergen') || ''),
      allergen_type: String(formData.get('allergen_type')) as any,
      severity: String(formData.get('severity')) as any,
      reaction: formData.get('reaction')?.toString() || undefined,
      first_observed: formData.get('first_observed')?.toString() || undefined,
      notes: formData.get('notes')?.toString() || undefined,
      trigger_factors: formData.get('trigger_factors')?.toString() || undefined,
      emergency_action_plan: formData.get('emergency_action_plan')?.toString() || undefined,
    }
    // Validate on the client (optional)
    const payload = AllergyCreateInput.parse(raw)

    create.mutate(payload, {
      onSuccess: () => router.push('/patient/medhist/allergies'),
      onError: (e) => setApiError(e instanceof Error ? e.message : 'Failed to save'),
    })
  }

  return (
    <DetailViewLayout
      title="Add Allergy"
      mode="create"
      formId="new-allergy-form"
      loading={create.isPending}
      errors={apiError ? [{ field: 'api', message: apiError }] : undefined}
      style="glass"
      motion="subtle"
    >
      <form id="new-allergy-form" action={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm">Allergen</span>
          <input name="allergen" className="w-full rounded-lg border px-3 py-2" required />
        </label>
        <label className="space-y-1">
          <span className="text-sm">Allergen Type</span>
          <select name="allergen_type" className="w-full rounded-lg border px-3 py-2" required>
            {/* CRITICAL: Derive options from Zod enum to prevent drift */}
            {Object.values(AllergenTypeEnum.enum).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm">Severity</span>
          <select name="severity" className="w-full rounded-lg border px-3 py-2" required>
            {/* CRITICAL: Derive options from Zod enum to prevent drift */}
            {Object.values(SeverityEnum.enum).map(severity => (
              <option key={severity} value={severity}>{severity.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm">Reaction</span>
          <input name="reaction" className="w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm">Notes</span>
          <textarea name="notes" rows={3} className="w-full rounded-lg border px-3 py-2" />
        </label>
      </form>
    </DetailViewLayout>
  )
}
```

---

## 🚨 CRITICAL v2 ENHANCEMENTS (Required for All Streams)

### 1. Enum Type Enforcement
```typescript
// ❌ WRONG - Allows any string, causes runtime errors
allergen_type: z.string().nullable(),
severity: z.string().nullable(),

// ✅ CORRECT - Enforces valid enum values at compile and runtime
allergen_type: AllergenTypeEnum,
severity: SeverityEnum,
```

### 2. UI Option Derivation from Zod Enums
```typescript
// ❌ WRONG - Hard-coded options can drift from schema
<option value="food">Food</option>
<option value="medication">Medication</option>

// ✅ CORRECT - Options derived from enum prevent drift
{Object.values(AllergenTypeEnum.enum).map(type => (
  <option key={type} value={type}>{type}</option>
))}
```

### 3. Input Normalization Pattern
```typescript
// ✅ CRITICAL - Convert empty strings to undefined for optional fields
const payload = {
  ...data,
  reaction: data.reaction || undefined,           // empty string → undefined
  notes: data.notes || undefined,                 // empty string → undefined
  first_observed: data.first_observed || undefined, // empty string → undefined
}
```

### 4. Response Format Consistency
```typescript
// ❌ WRONG - Uses 'items' property (causes UI bugs)
export const AllergyListResponse = z.object({
  items: z.array(AllergyRow),
})

// ✅ CORRECT - Uses 'data' property (matches REST standards)
export const AllergyListResponse = z.object({
  data: z.array(AllergyRow),
})
```

### 5. Server-Side Input Trimming
```typescript
// ✅ CRITICAL - Always trim text fields server-side before validation
const input = AllergyCreateInput.parse({
  ...body,
  allergen: body.allergen?.trim(),
  notes: body.notes?.trim(),
  // ... trim all text fields
})
```

---

## Enhanced Copy-paste checklist (v2)

-  Keep **snake_case** keys identical across DB/API/Zod/hooks/pages.
    
-  Define **Row**, **CreateInput**, **UpdateInput** per entity; infer TS types from Zod.

-  **CRITICAL**: Use enum types in Row schema, not `z.string().nullable()`
    
-  Include `is_active` (boolean) and `deleted_at` (nullable) in **Row**; omit from **Create**; optional in **Update**.

-  **CRITICAL**: Use `data` property in list responses, not `items`
    
-  Validate **API input** with Zod; return **Row** shapes from API.

-  **CRITICAL**: Derive UI select options from Zod enums using `Object.values(MyEnum.enum)`

-  **CRITICAL**: Normalize empty strings to `undefined` for optional fields in forms

-  **CRITICAL**: Trim all text fields server-side before validation
    
-  Reuse Zod-inferred types in TanStack hooks and UI components.

-  Include proper validation limits (min/max lengths, pageSize ≤ 100)

**Status**: v2 Enhanced with critical standardization fixes. Ready for allergies stream implementation.