import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient, getUser } from '@/lib/supabase-server'

const QuerySchema = z.object({
  type: z.enum(['message','alert','notification']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    type: url.searchParams.get('type') || undefined,
    page: url.searchParams.get('page') || '1',
    pageSize: url.searchParams.get('pageSize') || '20',
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 422 })
  }
  const { type, page, pageSize } = parsed.data

  const supabase = await getServerClient()
  let q = supabase.from('v_comm__communications').select('*', { count: 'exact' })
  if (type) q = q.eq('comm_type', type)
  q = q.order('created_at', { ascending: false })
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  q = q.range(from, to)
  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ items: data, total: count ?? 0 })
}
