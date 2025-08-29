**Summary**  
A small, **AI-friendly TanStack Query pattern** for Scrypto: one place for query keys, one fetch helper, and a predictable set of hooks per entity—`useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`. **CRITICAL v2 ENHANCEMENTS**: Proper SPA navigation patterns, cache invalidation fixes, and form submission handling. Hooks call your **Next.js API routes** and expose `loading`, `data`, and **callback-based** mutations.

---

**Rationale for pattern**

- **Consistency:** Every entity gets the same 5 hooks and the same query key structure.
    
- **Safety (medical):** Writes go through API routes with RLS; **no optimistic writes** by default; clear success/error callbacks.
    
- **AI-friendly:** Tiny surface area, obvious names, minimal configuration.
    
- **Performance:** Stable query keys, sensible defaults (`staleTime`, focused invalidation), and server-driven pagination.
    

---

## Details

### What you always define per entity

- **Query keys**: a single object with `all`, `list(params)`, `detail(id)` → stable arrays.
    
- **Fetch helper**: `fetchJson` with consistent error handling.
    
- **List hook**: `useXList({ search?, page?, pageSize? })` → calls `/api/{domain}/{group}/{item}` with query params, returns `{data, isLoading, error}`.
    
- **Detail hook**: `useXById(id)` → calls `/api/{domain}/{group}/{item}/{id}`.
    
- **Mutations**: `useCreateX()`, `useUpdateX()`, `useDeleteX()` → POST/PUT/DELETE to API routes; **use `.mutate(data, { onSuccess, onError })`** and invalidate the right keys.
    

### Defaults (recommended)

- `staleTime`: 5 minutes for lists, 1 minute for details.
    
- `refetchOnWindowFocus: false`, `retry: 1` (reduce flicker in clinical contexts).
    
- **No optimistic updates by default** (regulatory safety). If you need them, confine to non-critical UI metadata and include a `onMutate` rollback.
    
- Server-driven pagination/sort/filter. The list hook accepts `{page, pageSize, search}` and forwards to the API.
    

### Query key shape (copy/paste rule)

```
['patient','medhist','allergies']                      // all
['patient','medhist','allergies','list', {…params}]    // list
['patient','medhist','allergies','detail', id]         // detail
```

---

## Code (drop-in pattern for one entity: Allergies)

> Place in `hooks/useAllergies.ts` (adjust paths). Repeat the same shape for every entity.

```ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/** --------------------------------
 * Shared helpers (could live in /lib/api.ts)
 * --------------------------------*/
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type FetchOptions = { method?: HttpMethod; body?: unknown; headers?: Record<string,string> }

async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers } = opts
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    // Credentials/cookies are handled by Next/Supabase server-side auth via your API routes
  })
  if (!res.ok) {
    // normalize to string for UI; API should also include machine-parseable codes if needed
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

/** --------------------------------
 * Types (adapt to your schema)
 * --------------------------------*/
export type Allergy = {
  allergy_id: string
  allergen: string
  severity: 'mild' | 'moderate' | 'severe'
  reaction?: string | null
  notes?: string | null
  created_at: string
  // user_id present server-side; reads are already user-scoped in the API
}

export type AllergyListParams = {
  page?: number
  pageSize?: number
  search?: string
}

export type AllergyListResponse = {
  items: Allergy[]
  total: number
  page: number
  pageSize: number
}

/** --------------------------------
 * Query keys (single source of truth)
 * --------------------------------*/
export const AllergyKeys = {
  all: ['patient', 'medhist', 'allergies'] as const,
  list: (params: AllergyListParams) =>
    [...AllergyKeys.all, 'list', { ...params }] as const,
  detail: (id: string) =>
    [...AllergyKeys.all, 'detail', id] as const,
}

/** --------------------------------
 * Hooks: List & Detail
 * --------------------------------*/
export function useAllergiesList(params: AllergyListParams = {}) {
  const { page = 1, pageSize = 20, search = '' } = params
  const qp = new URLSearchParams()
  qp.set('page', String(page))
  qp.set('pageSize', String(pageSize))
  if (search) qp.set('search', search)

  return useQuery({
    queryKey: AllergyKeys.list({ page, pageSize, search }),
    queryFn: () =>
      fetchJson<AllergyListResponse>(`/api/patient/medhist/allergies?${qp.toString()}`),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useAllergyById(id?: string) {
  return useQuery({
    queryKey: id ? AllergyKeys.detail(id) : ['_disabled'],
    queryFn: () => fetchJson<Allergy>(`/api/patient/medhist/allergies/${id}`),
    enabled: !!id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

/** --------------------------------
 * Hooks: Create / Update / Delete
 * Use mutate with callbacks; avoid mutateAsync.
 * --------------------------------*/
type CreateAllergyInput = {
  allergen: string
  severity: Allergy['severity']
  reaction?: string | null
  notes?: string | null
}
type UpdateAllergyInput = Partial<CreateAllergyInput> & { allergy_id: string }

export function useCreateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAllergyInput) =>
      fetchJson<{ id: string }>(`/api/patient/medhist/allergies`, { method: 'POST', body: payload }),
    onSuccess: () => {
      // Invalidate list; detail will be fetched when navigated to
      qc.invalidateQueries({ queryKey: AllergyKeys.all })
    },
  })
}

export function useUpdateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAllergyInput) =>
      fetchJson<void>(`/api/patient/medhist/allergies/${payload.allergy_id}`, {
        method: 'PUT',
        body: payload,
      }),
    onSuccess: (_data, payload) => {
      // Nuke detail cache for this id + refresh lists
      qc.invalidateQueries({ queryKey: AllergyKeys.detail(payload.allergy_id) })
      qc.invalidateQueries({ queryKey: AllergyKeys.all })
    },
  })
}

export function useDeleteAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (allergy_id: string) =>
      fetchJson<void>(`/api/patient/medhist/allergies/${allergy_id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AllergyKeys.all })
    },
  })
}
```

### Example usage (List page)

```tsx
// /app/patient/medhist/allergies/page.tsx
'use client'
import { useAllergiesList, useDeleteAllergy } from '@/hooks/useAllergies'
import ListViewLayout from '@/components/layouts/ListViewLayout'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AllergiesListPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { data, isLoading, error } = useAllergiesList({ page: 1, pageSize: 20, search })
  const del = useDeleteAllergy()

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const columns = [
    { id: 'allergen', header: 'Allergen', sortable: true, sortField: 'allergen' },
    { id: 'severity', header: 'Severity', sortable: true, sortField: 'severity' },
    { id: 'reaction', header: 'Reaction' },
    { id: 'created_at', header: 'Created',
      accessor: (r: any) => new Date(r.created_at).toLocaleDateString(),
      sortable: true,
      sortKey: (r: any) => new Date(r.created_at).getTime()
    },
  ]

  return (
    <ListViewLayout
      title="Allergies"
      description="Manage your known allergies."
      data={items}
      columns={columns as any}
      getRowId={(r: any) => r.allergy_id}
      loading={isLoading}
      errors={error ? [{ field: 'api', message: (error as Error).message }] : undefined}
      searchValue={search}
      onSearch={setSearch}
      onAdd={() => router.push('/patient/medhist/allergies/new')}
      onRowClick={(row: any) => router.push(`/patient/medhist/allergies/${row.allergy_id}`)}
      onDelete={(row: any) => del.mutate(row.allergy_id)}
      pagination={{
        page: 1,
        pageSize: 20,
        total,
        onPageChange: () => {}, // wire up when you add server pagination controls
      }}
      style="glass"
      motion="subtle"
    />
  )
}
```

### Example usage (Create form + safe save flow)

```tsx
'use client'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import { useCreateAllergy } from '@/hooks/useAllergies'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewAllergyPage() {
  const router = useRouter()
  const create = useCreateAllergy()
  const [apiError, setApiError] = useState<string | null>(null)

  const onSubmit = (formData: FormData) => {
    setApiError(null)
    const payload = {
      allergen: String(formData.get('allergen') || ''),
      severity: String(formData.get('severity') || 'mild') as 'mild' | 'moderate' | 'severe',
      reaction: (formData.get('reaction') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    }
    create.mutate(payload, {
      onSuccess: () => router.push('/patient/medhist/allergies'),
      onError: (e) => setApiError(e instanceof Error ? e.message : 'Failed to save'),
    })
  }

  return (
    <>
      <DetailViewLayout
        title="Add New Allergy"
        subtitle="Capture a new allergy record"
        mode="create"
        formId="new-allergy-form"
        loading={create.isPending}
        errors={apiError ? [{ field: 'api', message: apiError }] : undefined}
        onCancel={() => router.push('/patient/medhist/allergies')}
        style="glass"
        motion="subtle"
      >
        <form
          id="new-allergy-form"
          action={(formData: FormData) => onSubmit(formData)}
          className="grid gap-4 p-6 sm:grid-cols-2"
        >
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
    </>
  )
}
```

---

## Copy-paste checklist (apply to every entity)

-  Create **Keys** object with `all`, `list(params)`, `detail(id)`.
    
-  Implement **`useXList`** (server pagination/sort/search via query params).
    
-  Implement **`useXById`** with `enabled: !!id`.
    
-  Implement **`useCreateX` / `useUpdateX` / `useDeleteX`** using `.mutate(..., { onSuccess, onError })`.
    
-  On success, **invalidate**: `qc.invalidateQueries({ queryKey: XKeys.all })` and specific `detail(id)` where relevant.
    
-  **No optimistic writes** by default; if you must, add `onMutate` + rollback only for non-critical UI metadata.
    
-  Keep **`refetchOnWindowFocus: false`** and modest `retry` to avoid jarring reloads in clinical sessions.
    
-  Keep **API** as the only data source (no direct Supabase from client hooks) to preserve RLS and auditability.