**Summary**  
A tiny, strict **Zod schema pattern** that keeps **one set of column names** across every layer: **DB = API = Zod = TanStack = Page**. Each entity gets three schemas (Row, CreateInput, UpdateInput) and optional ListQuery/ApiResponse schemas. No fancy validations—just types and nullability—so AIs and humans never drift on names.

**Rationale for pattern**

- **Zero mapping bugs:** same keys everywhere (snake_case).
    
- **Single source of truth:** Zod infers TS types for hooks, pages, and API.
    
- **Simple & safe:** minimal rules (string/number/enum/date/nullable), easy to copy/paste per entity.
    

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
export const severity_enum = z.enum(['mild', 'moderate', 'severe'])
export type Severity = z.infer<typeof severity_enum>

/** 1) DB Row shape (as your API returns it) */
export const AllergyRow = z.object({
  allergy_id: z.string(),            // uuid (string)
  user_id: z.string(),               // server-managed (still part of the row)
  allergen: z.string(),
  severity: severity_enum,
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),            // ISO datetime string
  updated_at: z.string().optional(), // ISO
  deleted_at: z.string().nullable().optional(), // soft delete
})
export type Allergy = z.infer<typeof AllergyRow>

/** 2) Create payload (POST) — only fields client is allowed to send */
export const AllergyCreateInput = z.object({
  allergen: z.string(),
  severity: severity_enum,
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type AllergyCreate = z.infer<typeof AllergyCreateInput>

/** 3) Update payload (PUT) — id + partial updatable fields */
export const AllergyUpdateInput = z.object({
  allergy_id: z.string(),
  allergen: z.string().optional(),
  severity: severity_enum.optional(),
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  // If you support restore/soft-delete via API, include below as optional:
  deleted_at: z.string().nullable().optional(),
})
export type AllergyUpdate = z.infer<typeof AllergyUpdateInput>

/** Optional: List query params (server-side pagination/filter) */
export const AllergyListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(20),
  search: z.string().default(''),
})
export type AllergyListQueryType = z.infer<typeof AllergyListQuery>

/** Optional: API list response */
export const AllergyListResponse = z.object({
  items: z.array(AllergyRow),
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
    items: data, total: count ?? 0, page: parsed.page, pageSize: parsed.pageSize
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
    const raw: AllergyCreate = {
      allergen: String(formData.get('allergen') || ''),
      severity: String(formData.get('severity') || 'mild') as any,
      reaction: (formData.get('reaction') as string) || null,
      notes: (formData.get('notes') as string) || null,
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
          <span className="text-sm">Severity</span>
          <select name="severity" className="w-full rounded-lg border px-3 py-2">
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
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

## Copy-paste checklist

-  Keep **snake_case** keys identical across DB/API/Zod/hooks/pages.
    
-  Define **Row**, **CreateInput**, **UpdateInput** per entity; infer TS types from Zod.
    
-  Include `deleted_at` (nullable) in **Row**; omit from **Create**; optional in **Update**.
    
-  Validate **API input** with Zod; return **Row** shapes from API.
    
-  Reuse Zod-inferred types in TanStack hooks and UI components.
    

Want me to generate the same Zod pack for your next entity (e.g., prescriptions, medications) with the exact fields you’re using?