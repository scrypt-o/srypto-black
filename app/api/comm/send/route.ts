import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient, getUser, getServiceRoleClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'

const SendSchema = z.object({
  to: z.string().min(1), // email or uuid
  type: z.enum(['message','alert','notification']).default('message'),
  subject: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
  context_type: z.enum(['prescription']).optional(),
  context_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const csrf = verifyCsrf(req); if (csrf) return csrf
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: unknown
  try { payload = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const p = SendSchema.safeParse(payload)
  if (!p.success) return NextResponse.json({ error: 'Validation', details: p.error.flatten() }, { status: 422 })

  const { to, type, subject, body, context_type, context_id } = p.data

  // Resolve recipient: uuid or by email via service role
  let userTo: string | null = null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRegex.test(to)) {
    userTo = to
  } else {
    try {
      const svc = getServiceRoleClient()
      const { data: rows, error } = await svc.from('auth.users' as any).select('id').eq('email', to).limit(1)
      if (error) throw error
      userTo = rows?.[0]?.id ?? null
    } catch {
      return NextResponse.json({ error: 'Recipient resolution failed' }, { status: 400 })
    }
  }
  if (!userTo) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const supabase = await getServerClient()
  const meta = (context_type && context_id) ? { context_type, context_id } : null
  const { data, error } = await supabase
    .from('comm__communications')
    .insert({ comm_type: type, user_from: user.id, user_to: userTo, subject, body, ...(meta ? { meta } : {}) })
    .select('comm_id, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const res = NextResponse.json({ ok: true, id: data?.comm_id, created_at: data?.created_at }, { status: 201 })
  res.headers.set('X-Deprecation', 'Use /api/patient/comm/send')
  return res
}
