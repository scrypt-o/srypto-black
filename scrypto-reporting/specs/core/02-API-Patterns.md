# API and Error Semantics — Revised Approach

## Overview
- Reads: Server components query Supabase via `getServerClient()` from RLS‑scoped views `v_*`.
- Writes: Use Next API routes; keep consistent status codes and CSRF checks.
- Client: Use `getBrowserClient()` for simple optimistics or call our API routes via `fetch` with `ApiError`.

## Helpers
- Server: `requireUser()`, `getServerClient()` from `@/lib/supabase-server`.
- Client: `getBrowserClient()` from `@/lib/supabase-browser`, `ApiError` and `useQuery/useMutation/invalidateQueries` from `@/lib/query/runtime`.

## Status Codes
- 422: Validation failure (include Zod error details).
- 400: Malformed/invalid JSON body.
- 401/403: Unauthenticated/Unauthorized.
- 404: Not found (e.g., PGRST116).
- 500: Unexpected server/database error.

## Response Shapes
- List endpoints return: `{ data: Row[], total, page, pageSize }`.
- Detail endpoints return the row or 404.

## Example — List (GET)
```ts
// app/api/patient/medical-history/allergies/route.ts
export async function GET(request: NextRequest) {
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const qp = AllergyListQuerySchema.extend({
    sort_by: z.enum(['created_at','allergen','severity','allergen_type']).optional(),
    sort_dir: z.enum(['asc','desc']).optional(),
  })
  const sp = request.nextUrl.searchParams
  const parsed = qp.parse({
    page: +sp.get('page')! || 1,
    pageSize: +sp.get('pageSize')! || 20,
    search: sp.get('search') || undefined,
    allergen_type: sp.get('allergen_type') || undefined,
    severity: sp.get('severity') || undefined,
    sort_by: sp.get('sort_by') || undefined,
    sort_dir: sp.get('sort_dir') || undefined,
  })

  let q = supabase
    .from('v_patient__medhist__allergies')
    .select('*', { count: 'exact' })
    .order(parsed.sort_by ?? 'created_at', { ascending: parsed.sort_dir === 'asc' })
  if (parsed.search) q = q.or(`allergen.ilike.%${parsed.search}%,reaction.ilike.%${parsed.search}%`)
  if (parsed.allergen_type) q = q.eq('allergen_type', parsed.allergen_type)
  if (parsed.severity) q = q.eq('severity', parsed.severity)

  const from = (parsed.page - 1) * parsed.pageSize
  const to = from + parsed.pageSize - 1
  const { data, error, count } = await q.range(from, to)
  if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

  return NextResponse.json({ data: data ?? [], total: count || 0, page: parsed.page, pageSize: parsed.pageSize })
}
```

## Example — Create (POST)
```ts
// app/api/patient/medical-history/allergies/route.ts
export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }) }
  const s = (v: unknown) => typeof v === 'string' ? v.trim() : undefined
  const trimmed = {
    allergen: s((body as any).allergen),
    allergen_type: s((body as any).allergen_type),
    severity: s((body as any).severity),
    reaction: s((body as any).reaction),
    notes: s((body as any).notes),
    trigger_factors: s((body as any).trigger_factors),
    emergency_action_plan: s((body as any).emergency_action_plan),
    first_observed: typeof (body as any).first_observed === 'string' ? (body as any).first_observed : undefined,
  }

  try {
    const input = AllergyCreateInputSchema.parse(trimmed)
    const { data, error } = await supabase
      .from('patient__medhist__allergies')
      .insert({ ...input, user_id: user.id })
      .select()
      .single()
    if (error) return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (zodError) {
    return NextResponse.json({ error: 'Invalid input data', details: zodError }, { status: 422 })
  }
}
```

## Client Usage
```ts
// hooks/usePatientAllergies.ts
return useMutation<AllergyCreateInput, AllergyRow>({
  mutationFn: async (data) => {
    const res = await fetch('/api/patient/medical-history/allergies', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    })
    if (!res.ok) throw await ApiError.fromResponse(res)
    return res.json()
  },
  onSuccess: () => invalidateQueries(['allergies'] as any),
})
```

