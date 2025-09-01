import { NextRequest, NextResponse } from 'next/server'
import { getUser, getServiceRoleClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()
  if (q.length < 2) return NextResponse.json({ items: [] })

  try {
    const svc = getServiceRoleClient()
    // Try profile view first if exists; fallback to auth.users
    const tryProfiles = await svc.from('v_profiles' as any).select('user_id:id, email, first_name, last_name, nickname').ilike('search_text' as any, `%${q}%`).limit(10)
    if (!tryProfiles.error && tryProfiles.data) {
      return NextResponse.json({ items: tryProfiles.data })
    }
  } catch {}

  try {
    const svc = getServiceRoleClient()
    const { data, error } = await svc
      .from('auth.users' as any)
      .select('id, email, raw_user_meta_data')
      .or(`email.ilike.%${q}%,raw_user_meta_data->>full_name.ilike.%${q}%`)
      .limit(10)
    if (error) throw error
    const items = (data || []).map((u: any) => ({
      user_id: u.id,
      email: u.email,
      first_name: u.raw_user_meta_data?.first_name ?? null,
      last_name: u.raw_user_meta_data?.last_name ?? null,
      nickname: u.raw_user_meta_data?.nickname ?? null,
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Search unavailable' }, { status: 500 })
  }
}

