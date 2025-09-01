# 02 — Communications Alignment: Patient Pattern + CSRF

## Goal
Realign communications to the approved patient auth/data pattern, enforce CSRF on writes, and standardize naming for future-proofed RLS and audits.

## Scope
- Move endpoints from `/api/comm/*` to `/api/patient/comm/*` (compat shim optional).
- Ensure DB access uses `patient__comm__communications` and views `v_patient__comm__{messages,alerts,notifications,reminders}` with `auth.uid()` filters.
- Add CSRF checks on all non-GET routes.

## Success Criteria (Measurable)
- [ ] New routes exist and pass unit/integration tests.
- [ ] All POST/PUT/DELETE comms routes call `verifyCsrf()`.
- [ ] Ownership enforced on writes (`user_from = auth.uid()`; reads restricted by view filters).
- [ ] Inbox/list pages render with `v_patient__comm__*` without regression.
- [ ] Deprecation notice logged when old `/api/comm/*` is used (optional, for one release).

## Tasks
1) Routes
- Create:
  - `app/api/patient/comm/recipients/route.ts`
  - `app/api/patient/comm/send/route.ts`
  - `app/api/patient/comm/read/[comm_id]/route.ts`
  - `app/api/patient/comm/inbox/route.ts`
  - `app/api/patient/comm/with/[user_id]/route.ts`
- Update implementations to:
  - Use `verifyCsrf()` on non-GET.
  - Read from `v_patient__comm__*` views.
  - Insert into `patient__comm__communications` with `user_from = user.id`.

2) DB Views & Naming
- Confirm presence of `v_patient__comm__messages|alerts|notifications|reminders` (RLS-scoped). If missing, add migrations per DDL.

3) UI Pages
- Update patient comm pages to query via new routes where client fetch exists (most are SSR currently using views directly).

4) Compatibility (Optional)
- Keep old `/api/comm/*` routes for one release returning 308 to new paths with a console warning.

## Code Examples

### Send (app/api/patient/comm/send/route.ts)
```ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient, getServiceRoleClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'

const SendSchema = z.object({
  to: z.string().min(1),
  type: z.enum(['message','alert','notification']).default('message'),
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
})

export async function POST(req: NextRequest) {
  const csrf = verifyCsrf(req); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: unknown
  try { payload = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const p = SendSchema.safeParse(payload)
  if (!p.success) return NextResponse.json({ error: 'Validation', details: p.error.flatten() }, { status: 422 })

  const { to, type, subject, body } = p.data
  let userTo: string | null = null
  const uuid = /^[0-9a-f-]{36}$/i
  if (uuid.test(to)) {
    userTo = to
  } else {
    const svc = getServiceRoleClient()
    const { data: r } = await svc.from('auth.users' as any).select('id').eq('email', to).limit(1)
    userTo = r?.[0]?.id ?? null
  }
  if (!userTo) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('patient__comm__communications')
    .insert({ comm_type: type, user_from: user.id, user_to: userTo, subject, body })
    .select('comm_id, created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, id: data?.comm_id, created_at: data?.created_at }, { status: 201 })
}
```

### Inbox (SSR page reads via view)
```ts
const { data } = await supabase
  .from('v_patient__comm__messages')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100)
```

## Acceptance Tests
- Unit: send validates input, resolves email→uuid, inserts with `user_from=user.id`.
- GET inbox returns only current user messages (view-scoped).
- POST read marks `read_at` and returns updated row; rejects when unauthenticated.

## Timebox & Ownership
- Est. effort: 1 day (routes + view checks + tests).
- Owner: BE/FE engineer.

