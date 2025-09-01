# 01 — Medications APIs: Implement Missing CRUD (Highest Priority)

## Goal
Unblock medications UI streams by implementing required API endpoints with CSRF, auth, Zod validation, and RLS-aligned access.

## Scope
- Entities: `patient__medications__active`, `patient__medications__history`, `patient__medications__adherence` (and views `v_*`).
- Routes: `/api/patient/medications/{active,history,adherence}` (+ `/[id]`).
- Align with Allergies reference pattern (SSR reads from views; writes to tables; ownership `.eq('user_id', user.id)`).

## Success Criteria (Measurable)
- [ ] 6 route handlers exist (3 list/create + 3 id routes) with CSRF on non-GET.
- [ ] Zod schemas created for all 3 entities (Row/Create/Update/List/Response).
- [ ] Unit tests for schemas + API handlers (happy/error paths): ≥ 15 tests total.
- [ ] UI list pages function without client-side errors for all 3 streams.
- [ ] Playwright MCP screenshots saved under `ai/testing/` for each stream’s list page.

## Tasks
1) Schemas
- Add `schemas/medications-active.ts`, `schemas/medications-history.ts`, `schemas/medications-adherence.ts` with:
  - Row schema (db-aligned), Create/Update, ListQuery, ListResponse.
  - Enums for `status`, `route`, `adherence status`.

2) API Routes
- Create these files:
  - `app/api/patient/medications/active/route.ts` (GET list, POST create)
  - `app/api/patient/medications/active/[id]/route.ts` (GET detail, PUT update, DELETE soft-delete)
  - Repeat for `history`, `adherence`.
- Use patterns from `app/api/patient/medical-history/allergies/*`.
- Ensure: `verifyCsrf()` on POST/PUT/DELETE; `supabase.auth.getUser()`; ownership checks.

3) UI Wiring
- Confirm list pages already fetch from `v_patient__medications__active|history|adherence`.
- Update any config delete hooks to hit new endpoints (already present in `config/*ListConfig.ts`).

4) Tests
- Add Jest tests for Zod schemas under `__tests__/schemas/`.
- Add API route unit/integration tests under `__tests__/api/`.
- Target coverage ≥ 80% via `npm run test:coverage`.

5) Evidence
- Run E2E (when MCP is available) and save screenshots to `ai/testing/`.

## Code Examples

### Zod (active example — schemas/medications-active.ts)
```ts
import { z } from 'zod'

export const MedicationStatusEnum = z.enum(['active','paused','completed','discontinued'])
export const RouteEnum = z.enum(['oral','topical','injection','inhaled','sublingual'])

export const ActiveMedicationRowSchema = z.object({
  medication_id: z.string().uuid(),
  user_id: z.string().uuid(),
  medication_name: z.string().nullable(),
  dosage: z.string().nullable(),
  frequency: z.string().nullable(),
  route: RouteEnum.nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  prescriber: z.string().nullable(),
  status: MedicationStatusEnum.nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_active: z.boolean().nullable().default(true),
})

export const ActiveMedicationCreateSchema = z.object({
  medication_name: z.string().min(1).max(200),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  route: RouteEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  prescriber: z.string().max(200).optional(),
  status: MedicationStatusEnum.optional(),
  notes: z.string().optional(),
})

export const ActiveMedicationUpdateSchema = ActiveMedicationCreateSchema.partial()

export const ActiveMedicationListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: MedicationStatusEnum.optional(),
  route: RouteEnum.optional(),
})

export const ActiveMedicationListResponseSchema = z.object({
  data: z.array(ActiveMedicationRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})
```

### API (active list/create — app/api/patient/medications/active/route.ts)
```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'
import { ActiveMedicationCreateSchema, ActiveMedicationListQuerySchema } from '@/schemas/medications-active'

export async function GET(request: NextRequest) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const SortBy = z.enum(['created_at','medication_name','status','frequency','start_date'])
  const SortDir = z.enum(['asc','desc'])
  const sp = request.nextUrl.searchParams
  const qp = ActiveMedicationListQuerySchema.extend({ sort_by: SortBy.optional(), sort_dir: SortDir.optional() })
    .parse({
      page: +(sp.get('page') || '1'), pageSize: +(sp.get('pageSize') || '20'),
      search: sp.get('search') || undefined,
      status: sp.get('status') || undefined,
      route: sp.get('route') || undefined,
      sort_by: sp.get('sort_by') || undefined,
      sort_dir: sp.get('sort_dir') || undefined,
    })

  let q = supabase.from('v_patient__medications__active').select('*', { count: 'exact' })
    .order(qp.sort_by ?? 'created_at', { ascending: qp.sort_dir === 'asc' })

  if (qp.search) q = q.or(`medication_name.ilike.%${qp.search}%,prescriber.ilike.%${qp.search}%`)
  if (qp.status) q = q.eq('status', qp.status)
  if (qp.route) q = q.eq('route', qp.route)

  const from = (qp.page - 1) * qp.pageSize
  const to = from + qp.pageSize - 1
  const { data, error, count } = await q.range(from, to)
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  return NextResponse.json({ data: data ?? [], total: count || 0, page: qp.page, pageSize: qp.pageSize })
}

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const s = (v: unknown) => typeof v === 'string' ? v.trim() : undefined
  const input = ActiveMedicationCreateSchema.parse({
    medication_name: s((raw as any).medication_name),
    dosage: s((raw as any).dosage),
    frequency: s((raw as any).frequency),
    route: s((raw as any).route),
    start_date: s((raw as any).start_date),
    end_date: s((raw as any).end_date),
    prescriber: s((raw as any).prescriber),
    status: s((raw as any).status),
    notes: s((raw as any).notes),
  })

  const { data, error } = await supabase
    .from('patient__medications__active')
    .insert({ ...input, user_id: user.id })
    .select('*').single()

  if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

### API (active detail/update/delete — app/api/patient/medications/active/[id]/route.ts)
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'
import { ActiveMedicationUpdateSchema } from '@/schemas/medications-active'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase
    .from('v_patient__medications__active').select('*').eq('medication_id', params.id).single()
  if (error) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const csrf = verifyCsrf(req); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let raw: unknown
  try { raw = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const s = (v: unknown) => typeof v === 'string' ? v.trim() : undefined
  const input = ActiveMedicationUpdateSchema.parse({
    medication_name: s((raw as any).medication_name),
    dosage: s((raw as any).dosage),
    frequency: s((raw as any).frequency),
    route: s((raw as any).route),
    start_date: s((raw as any).start_date),
    end_date: s((raw as any).end_date),
    prescriber: s((raw as any).prescriber),
    status: s((raw as any).status),
    notes: s((raw as any).notes),
  })

  const { data, error } = await supabase
    .from('patient__medications__active')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('medication_id', params.id).eq('user_id', user.id)
    .select('*').single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const csrf = verifyCsrf(req); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('patient__medications__active')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('medication_id', params.id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

## Rollback/Safety
- Routes are additive. No destructive DB changes included.
- If view/table names differ, adjust schemas and from() calls accordingly.

## Timebox & Ownership
- Est. effort: 1–2 days (API + schemas + tests + wiring).
- Owner: Backend FE/BE engineer.
- Dependencies: Existing views `v_patient__medications__*`. If missing, add per DDL.

