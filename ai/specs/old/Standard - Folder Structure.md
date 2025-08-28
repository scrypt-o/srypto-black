# Scrypto Folder Structure Standard (SSOT)

**Updated:** August 25, 2025  
**Owner:** Platform / Patterns  
**Scope:** Next.js (App Router) + Supabase. This is the **single source of truth** for where things live, how they’re named, and how layers talk. Uses **Allergies** as a running example.

---

## 1) Principles (read once)

- **One idea per place.** Pages wire UI↔data; hooks fetch/mutate; components render; API validates; DB enforces **RLS**.
    
- **Same names end‑to‑end.** **DB = API = Zod = Hooks = Pages** (snake_case keys). No mapping layers.
    
- **RLS-first.** All protected access goes through server/API; client never bypasses RLS.
    
- **Props over magic.** Layouts & patterns take explicit props (AI-friendly, testable).
    
- **Soft delete by default.** `deleted_at TIMESTAMPTZ NULL`. Lists exclude deleted.
    

---

## 2) Canonical structure

```text
scrypto/
├─ ai/
│  ├─ specs/                       # Single source of truth for patterns/guides
│  │  ├─ authentication-pattern.md
│  │  ├─ detail-view-pattern.md
│  │  ├─ list-view-pattern.md
│  │  ├─ tile-grid-pattern.md
│  │  ├─ file-upload-pattern.md
│  │  └─ crud-implementation-guide.md
│  ├─ _app_specs_map_.md
│  └─ _document-standards_.md
│
├─ app/                            # Next.js App Router
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ (auth)/login/page.tsx
│  ├─ patient/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  └─ medhist/
│  │     └─ allergies/
│  │        ├─ page.tsx            # List page (index)
│  │        ├─ new/page.tsx        # Create page
│  │        └─ [allergy_id]/page.tsx  # Detail (view/edit)
│  └─ api/
│     ├─ auth/
│     │  └─ callback/route.ts      # Cookie sync on client auth change
│     └─ patient/
│        └─ medhist/
│           └─ allergies/
│              ├─ route.ts         # GET(list), POST(create)
│              └─ [allergy_id]/route.ts  # GET(detail), PUT(update), DELETE(soft)
│
├─ components/
│  ├─ layouts/
│  │  ├─ TileGridLayout.tsx
│  │  ├─ ListViewLayout.tsx
│  │  └─ DetailViewLayout.tsx
│  └─ patterns/
│     ├─ ConfirmDialog.tsx
│     ├─ Toast.tsx
│     └─ States.tsx                # EmptyState, ErrorState, SkeletonTable
│
├─ config/
│  ├─ patientNav.ts                # Patient navigation tree
│  └─ adminNav.ts                  # Admin navigation tree
│
├─ hooks/
│  └─ useAllergies.ts              # TanStack hooks (list/detail/create/update/delete)
│
├─ lib/
│  ├─ QueryProvider.tsx            # React Query client provider
│  └─ supabase/
│     ├─ client.tsx                # Browser auth (AuthProvider, sign-in/out)
│     └─ server.ts                 # Server client + getUserOrNull/requireUser
│
├─ schemas/
│  └─ allergy.ts                   # Zod SSOT: Row/Create/Update/ListResponse
│
├─ types/
│  └─ database.types.ts            # Supabase generated types
│
├─ supabase/
│  ├─ config.toml
│  └─ migrations/
│     └─ *.sql
│
├─ public/
│  └─ manifest.json
│
├─ middleware.ts                   # (thin) rewrites/headers; no auth logic
├─ tailwind.config.js
├─ tsconfig.json
└─ package.json
```

---

## 3) What lives where (short, decisive)

### `ai/specs/`

Human & AI-facing **patterns**. Keep code minimal; align with canonical prop contracts.

### `app/`

Route boundaries and page composition. Pages wire **patterns** ↔ **hooks**; no direct DB calls. API routes validate with Zod and rely on Supabase **RLS**.

### `components/`

Pure UI: layouts (ListView/DetailView/TileGrid) + small patterns (ConfirmDialog/Toast/States). No fetching inside these—just props.

### `config/`

Static config (e.g., nav trees) reused by layouts.

### `hooks/`

One file per entity, **five hooks** + keys: `useXList`, `useXById`, `useCreateX`, `useUpdateX`, `useDeleteX`, and `XKeys`. Use callback-based mutations; invalidate on success.

### `lib/supabase/`

- `client.tsx`: `AuthProvider`, `signInWithPassword`, `signOut`, posts session → `/api/auth/callback`.
    
- `server.ts`: `getServerClient()`, `getUserOrNull()`, `requireUser()` using Next cookies (**object‑spread setter**).
    

### `schemas/`

**Zod = SSOT** for shapes: Row, Create, Update, optional List Query/Response. All keys **snake_case** and identical across layers.

### `supabase/`

Migrations + local config. Policies/views implement user isolation. API never bypasses RLS.

---

## 4) Rules & considerations

1. **Same column names end-to-end** — `allergen`, `severity`, `created_at`, `deleted_at`.
    
2. **Soft delete** — nullable `deleted_at`; lists filter `IS NULL`; DELETE sets timestamp.
    
3. **Separation of concerns** — Pages (glue), Hooks (data), Components (UI), API (validate + DB), DB (RLS).
    
4. **Auth** — Client handles sign-in/out; server owns cookies; protect API with `requireUser()`; RLS in DB policies.
    
5. **Testing** — Playwright happy paths; screenshots under `ai/testing/screenshots/...`.
    

---

## 5) Allergies — minimal files (& what they do)

**Schemas** — `/schemas/allergy.ts`

- Exports `AllergyRow`, `AllergyCreateInput`, `AllergyUpdateInput`, `AllergyListQuery`, `AllergyListResponse`.
    

**API** — `/app/api/patient/medhist/allergies/...`

- `GET /` (list) + `POST /` (create) with Zod validation.
    
- `GET /:allergy_id`, `PUT /:allergy_id`, `DELETE /:allergy_id` (soft delete).
    

**Hooks** — `/hooks/useAllergies.ts`

- `AllergyKeys` + the 5 standard hooks; `.mutate(..., { onSuccess, onError })` only.
    

**Pages** — `/app/patient/medhist/allergies/...`

- `page.tsx` → `ListViewLayout` wired to `useAllergiesList`.
    
- `new/page.tsx` → `DetailViewLayout` (create).
    
- `[allergy_id]/page.tsx` → `DetailViewLayout` (edit).
    

**UI** — `/components/layouts` & `/components/patterns`

- `ListViewLayout.tsx`, `DetailViewLayout.tsx`, `ConfirmDialog.tsx`, `Toast.tsx`, `States.tsx`.
    

---

## 6) Copy‑paste stubs (tiny, so you can fill fast)

### `/schemas/allergy.ts`

```ts
import { z } from 'zod'

export const severity_enum = z.enum(['mild', 'moderate', 'severe'])

export const AllergyRow = z.object({
  allergy_id: z.string(),
  user_id: z.string(),
  allergen: z.string(),
  severity: severity_enum,
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().nullable().optional(),
})
export type Allergy = z.infer<typeof AllergyRow>

export const AllergyCreateInput = z.object({
  allergen: z.string(),
  severity: severity_enum,
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})
export type AllergyCreate = z.infer<typeof AllergyCreateInput>

export const AllergyUpdateInput = z.object({
  allergy_id: z.string(),
  allergen: z.string().optional(),
  severity: severity_enum.optional(),
  reaction: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
})
export type AllergyUpdate = z.infer<typeof AllergyUpdateInput>

export const AllergyListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(20),
  search: z.string().default(''),
})
export type AllergyListQueryType = z.infer<typeof AllergyListQuery>

export const AllergyListResponse = z.object({
  items: z.array(AllergyRow),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
})
export type AllergyListResponseType = z.infer<typeof AllergyListResponse>
```

### `/app/api/patient/medhist/allergies/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { AllergyCreateInput, AllergyListQuery, AllergyListResponse } from '@/schemas/allergy'
import { getServerClient, requireUser } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  await requireUser()
  const { searchParams } = new URL(req.url)
  const qp = AllergyListQuery.parse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
    search: searchParams.get('search') ?? '',
  })

  const supabase = getServerClient()
  const from = (qp.page - 1) * qp.pageSize
  const to = from + qp.pageSize - 1
  const { data, error, count } = await supabase
    .from('v_patient__medhist__allergies')
    .select('*', { count: 'exact' })
    .ilike('allergen', `%${qp.search}%`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(
    AllergyListResponse.parse({ items: data, total: count ?? 0, page: qp.page, pageSize: qp.pageSize })
  )
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser()
  const input = AllergyCreateInput.parse(await req.json())
  const { data, error } = await supabase
    .from('patient__medhist__allergies')
    .insert({ ...input, user_id: user.id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
```

### `/app/api/patient/medhist/allergies/[allergy_id]/route.ts`

```ts
import { NextResponse } from 'next/server'
import { AllergyUpdateInput } from '@/schemas/allergy'
import { requireUser, getServerClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { allergy_id: string } }) {
  await requireUser()
  const supabase = getServerClient()
  const { data, error } = await supabase
    .from('v_patient__medhist__allergies')
    .select('*')
    .eq('allergy_id', params.allergy_id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: { allergy_id: string } }) {
  await requireUser()
  const supabase = getServerClient()
  const input = AllergyUpdateInput.parse({ ...(await req.json()), allergy_id: params.allergy_id })
  const { data, error } = await supabase
    .from('patient__medhist__allergies')
    .update(input)
    .eq('allergy_id', params.allergy_id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: { params: { allergy_id: string } }) {
  await requireUser()
  const supabase = getServerClient()
  const { error } = await supabase
    .from('patient__medhist__allergies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('allergy_id', params.allergy_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
```

### `/hooks/useAllergies.ts` (skeleton)

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AllergyListResponseType, Allergy, AllergyCreate, AllergyUpdate } from '@/schemas/allergy'

export const AllergyKeys = {
  all: ['patient','medhist','allergies'] as const,
  list: (p: {page?:number;pageSize?:number;search?:string}) => [...AllergyKeys.all,'list',p] as const,
  detail: (id: string) => [...AllergyKeys.all,'detail',id] as const,
}

export function useAllergiesList(p: {page?:number;pageSize?:number;search?:string} = {}) {
  const qp = new URLSearchParams({ page: String(p.page ?? 1), pageSize: String(p.pageSize ?? 20), search: p.search ?? '' })
  return useQuery({
    queryKey: AllergyKeys.list(p),
    queryFn: async () => {
      const res = await fetch(`/api/patient/medhist/allergies?${qp}`)
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as AllergyListResponseType
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useAllergyById(id?: string) {
  return useQuery({
    queryKey: id ? AllergyKeys.detail(id) : ['_disabled'],
    queryFn: async () => {
      const res = await fetch(`/api/patient/medhist/allergies/${id}`)
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as Allergy
    },
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useCreateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AllergyCreate) => {
      const res = await fetch(`/api/patient/medhist/allergies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as Allergy
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: AllergyKeys.all }),
  })
}

export function useUpdateAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AllergyUpdate) => {
      const res = await fetch(`/api/patient/medhist/allergies/${payload.allergy_id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as Allergy
    },
    onSuccess: (_data, p) => {
      qc.invalidateQueries({ queryKey: AllergyKeys.detail(p.allergy_id) })
      qc.invalidateQueries({ queryKey: AllergyKeys.all })
    },
  })
}

export function useDeleteAllergy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/patient/medhist/allergies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      return (await res.json()) as { ok: true }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: AllergyKeys.all }),
  })
}
```

### `/app/api/auth/callback/route.ts` (cookie sync)

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { session } = await req.json()
  const supabase = getServerClient()

  if (session?.access_token && session?.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  await supabase.auth.signOut()
  return NextResponse.json({ ok: true })
}
```

---

## 7) Migration **diff checklist** (rename & remove safely)

### A. Renames

```bash
git mv lib/supabase-browser.ts lib/supabase/client.tsx
git mv lib/supabase-server.ts  lib/supabase/server.ts
```

### B. Removals

```bash
git rm lib/supabase-api.ts   # use getServerClient() inside Route Handlers
```

### C. Sidebar consolidation

```bash
mkdir -p components/nav config
# Example: AdminSidebar -> NavSidebar
git mv components/layouts/AdminSidebar.tsx components/nav/NavSidebar.tsx
```

### D. Hooks naming

```bash
git mv hooks/usePatientAllergies.ts hooks/useAllergies.ts
```

### E. Specs consolidation

```bash
mkdir -p ai/specs
# Move auth doc into patterns
git mv docs/authentication.md ai/specs/authentication-pattern.md
```

### F. Add Zod SSOT

```bash
mkdir -p schemas
# create schemas/allergy.ts with Row/Create/Update/List shapes
```

### G. Verify routes

- `app/api/patient/medhist/allergies/route.ts`
    
- `app/api/patient/medhist/allergies/[allergy_id]/route.ts`
    
- `app/patient/medhist/allergies/page.tsx`
    
- `app/patient/medhist/allergies/new/page.tsx`
    
- `app/patient/medhist/allergies/[allergy_id]/page.tsx`
    

---

## 8) PR validation checklist (pre‑merge)

-  Zod **Row/Create/Update** exist; keys are snake_case and match DB/API.
    
-  API handlers validate with Zod and return **Row** shape.
    
-  Hooks file exports 5 hooks + Keys; uses `.mutate(..., { onSuccess, onError })`.
    
-  Pages compose patterns; **no fetch** inside components.
    
-  Soft delete implemented (`deleted_at`) and excluded from lists.
    
-  RLS policies verified for the entity’s tables/views.
    
-  Playwright happy-path screenshots saved under `ai/testing/screenshots/...`.
    

---

## 9) Anti‑patterns to avoid

- Components performing fetch/mutations.
    
- Client calling Supabase DB directly for protected data (bypass API/RLS).
    
- Divergent field names across layers (no camel↔snake mapping).
    
- `mutateAsync` in core save flows (prefer callbacks for predictable UX).
    
- LocalStorage tokens or ad‑hoc cookie manipulation.
    

---

## 10) Quick templates (see specs)

- **List view:** `ai/specs/list-view-pattern.md`
    
- **Detail view:** `ai/specs/detail-view-pattern.md`
    
- **Tile grid:** `ai/specs/tile-grid-pattern.md`
    
- **Auth:** `ai/specs/authentication-pattern.md`
    
- **CRUD guide:** `ai/specs/crud-implementation-guide.md`
    

> If anything here conflicts with a spec, update the **spec** first, then update this standard.