import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedApiClient } from '@/lib/supabase-api'
import { verifyCsrf } from '@/lib/api-helpers'

export async function POST(request: NextRequest, { params }: { params: Promise<{ comm_id: string }> }) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const { supabase, user } = await getAuthenticatedApiClient()
  const { comm_id } = await params
  const { data, error } = await supabase
    .from('comm__communications')
    .update({ status: 'read', read_at: new Date().toISOString() })
    .eq('comm_id', comm_id)
    .eq('user_to', user.id)
    .select('comm_id, status, read_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const res = NextResponse.json({ ok: true, item: data })
  res.headers.set('X-Deprecation', 'Use /api/patient/comm/read/[comm_id]')
  return res
}
