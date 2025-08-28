
---

# API Pattern (CRUD-first, RPC-optional)

## What this solves

- **AI-friendly:** one obvious way to build every endpoint.
    
- **Consistent shapes:** **DB = API = Zod = Hooks = Pages**.
    
- **Separation of concerns:** RLS + views for reads; simple inserts/updates for writes.
    
- **Optional transactions:** when you truly need atomic multi-table writes, toggle **RPC mode** for that route only.
    

---

## 1) Modes

- **CRUD mode (default)**  
    Reads from `v_<domain>__<group>__<item>`; writes to `<domain>__<group>__<item>` table.  
    Soft delete via `is_active = false`. No stored procedures.
    
- **RPC mode (optional)**  
    Same route + same Zod I/O. Internally calls a Postgres function via `supabase.rpc()`.  
    Use only if you need atomic, multi-table, or heavy server-side logic.
    

**Naming (RPC functions):**  
`fn_<domain>__<group>__<item>__<verb>`  
Example: `fn_patient__medhist__allergies__create`

---

## 2) Route contract (all endpoints)

- **Headers**: none special (optionally support `Idempotency-Key` for POST).
    
- **Errors**: `{ error: string, code?: string }`
    
- **List query**: `?page=1&pageSize=20&search=` (+ optional `sort, order`)
    
- **Soft delete**: `DELETE /:id` sets `is_active = false` (not a hard delete)
    

---

## 3) Tiny helpers (drop-in)

```ts
// /lib/api/http.ts
import { NextResponse } from 'next/server'

export const ok = (data: unknown, init: number = 200) =>
  NextResponse.json(data, { status: init })

export const bad = (error: string, code = 'BAD_REQUEST', init = 400) =>
  NextResponse.json({ error, code }, { status: init })

export function paginate(page: number, pageSize: number) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to }
}
```

---

## 4) Allergies — CRUD mode endpoints (SSOT)

```ts
// /app/api/patient/medhist/allergies/route.ts
import { NextRequest } from 'next/server'
import { ok, bad, paginate } from '@/lib/api/http'
import { AllergyCreateInput, AllergyListQuery, AllergyListResponse } from '@/schemas/allergy'
import { getServerClient, requireUser } from '@/lib/supabase/server'

// GET list
export async function GET(req: NextRequest) {
  await requireUser()
  const { searchParams } = new URL(req.url)
  const qp = AllergyListQuery.parse({
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
    search: searchParams.get('search') ?? '',
  })
  const supabase = getServerClient()
  const { from, to } = paginate(qp.page, qp.pageSize)

  const { data, error, count } = await supabase
    .from('v_patient__medhist__allergies')
    .select('*', { count: 'exact' })
    .ilike('allergen', `%${qp.search}%`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return bad(error.message)
  return ok(AllergyListResponse.parse({ items: data, total: count ?? 0, page: qp.page, pageSize: qp.pageSize }))
}

// POST create
export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser()
  const input = AllergyCreateInput.parse(await req.json())

  const { data, error } = await supabase
    .from('patient__medhist__allergies')
    .insert({ ...input, user_id: user.id })
    .select('*')
    .single()

  if (error) return bad(error.message)
  return ok(data, 201)
}
```

```ts
// /app/api/patient/medhist/allergies/[allergy_id]/route.ts
import { NextResponse } from 'next/server'
import { ok, bad } from '@/lib/api/http'
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

  if (error) return bad(error.message, 'NOT_FOUND', 404)
  return ok(data)
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

  if (error) return bad(error.message)
  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: { allergy_id: string } }) {
  await requireUser()
  const supabase = getServerClient()
  const { error } = await supabase
    .from('patient__medhist__allergies')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('allergy_id', params.allergy_id)

  if (error) return bad(error.message)
  return ok({ ok: true })
}
```

---

## 5) Flip the switch to RPC (only when needed)

Add a tiny flag per endpoint (or per feature) so you can keep one code path:

```ts
// /lib/config/api.ts
export const API_MODE = {
  ALLERGIES_CREATE: 'crud',  // 'crud' | 'rpc'
  ALLERGIES_UPDATE: 'crud',
  // ... add others only if you introduce RPC functions later
} as const
```

**Create via RPC (example)**

```ts
// /app/api/patient/medhist/allergies/route.ts (POST only)
/* ...imports... */
import { API_MODE } from '@/lib/config/api'

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireUser()
  const input = AllergyCreateInput.parse(await req.json())

  if (API_MODE.ALLERGIES_CREATE === 'rpc') {
    const { data, error } = await supabase.rpc('fn_patient__medhist__allergies__create', {
      p_user_id: user.id,
      p_allergen: input.allergen,
      p_severity: input.severity,
      p_reaction: input.reaction,
      p_notes: input.notes,
    })
    if (error) return bad(error.message)
    return ok(data, 201) // function must return row shaped like AllergyRow
  }

  // fallback CRUD
  const { data, error } = await supabase
    .from('patient__medhist__allergies')
    .insert({ ...input, user_id: user.id })
    .select('*')
    .single()
  if (error) return bad(error.message)
  return ok(data, 201)
}
```

**RPC SQL template**

```sql
-- fn_patient__medhist__allergies__create.sql
create or replace function public.fn_patient__medhist__allergies__create(
  p_user_id uuid,
  p_allergen text,
  p_severity text,
  p_reaction text default null,
  p_notes text default null
) returns public.patient__medhist__allergies
language plpgsql
security definer
as $$
declare
  v_row public.patient__medhist__allergies;
begin
  insert into public.patient__medhist__allergies (user_id, allergen, severity, reaction, notes)
  values (p_user_id, p_allergen, p_severity, p_reaction, p_notes)
  returning * into v_row;
  return v_row;
end $$;

-- RLS still applies for selects; function is definer for controlled writes.
```

**Key rule:** even in RPC mode, **inputs and outputs** must match your Zod schemas exactly. Pages and hooks never know (or care) if RPC is used.

---

## 6) When to use RPC (and only then)

- **Atomic multi-table write** (e.g., create parent + children and log an audit row).
    
- **Heavy server-side validation** that is easier/safer in SQL.
    
- **Bulk operations** that would be chatty from the API.
    

Everything else: **CRUD mode**.

---

## 7) Implementation plan (integrated with your sheet)

1. **Adopt the CRUD-first endpoints above** for all features; set **DB Proc = –** in the status sheet.
    
2. If a row later needs atomic multi-table or heavy logic:
    
    - Add an `fn_<...>__<verb>` in migrations.
        
    - Flip the local `API_MODE.FEATURE_VERB = 'rpc'` for that route.
        
    - Keep Zod schemas and responses unchanged.
        
3. Keep **soft delete** everywhere; lists filter `deleted_at is null` (either in the view or in the API query).
    
4. Tests:
    
    - Unit: Zod parsing + API error envelopes.
        
    - E2E: create/edit/delete flows; confirm errors return `{ error, code }`.
        

---

## 8) Copy/paste checklists

**Every route handler**

-  `await requireUser()` (or optional auth, if truly public).
    
-  Validate `req` with the Zod input.
    
-  CRUD by default; RPC only behind a flag.
    
-  Return Row or ListResponse (validated or trusted if from DB).
    
-  Errors use `{ error, code? }`.
    

**Every feature**

-  Table with `deleted_at`, view for reads.
    
-  Zod: Row/Create/Update/ListQuery/ListResponse.
    
-  Hooks: 5 functions + keys (callback style).
    
-  Pages: List + Detail + Create wired to hooks and patterns.
    

---

If you want, I can drop these patterns into your **SSOT doc** as an “API Pattern” section and/or generate ready-to-commit files for another entity (e.g., **conditions**) in both CRUD and RPC toggles.