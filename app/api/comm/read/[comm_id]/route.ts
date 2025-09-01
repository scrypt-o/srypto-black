import { NextRequest, NextResponse } from 'next/server'
import { getServerClient, getUser } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'

export async function POST(req: NextRequest, { params }: { params: { comm_id: string } }) {
  const csrf = verifyCsrf(req); if (csrf) return csrf
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('comm__communications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('comm_id', params.comm_id)
    .eq('user_to', user.id)
    .select('comm_id, status, read_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const res = NextResponse.json({ ok: true, item: data })
  res.headers.set('X-Deprecation', 'Use /api/patient/comm/read/[comm_id]')
  return res
}
