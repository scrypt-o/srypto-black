import { NextRequest, NextResponse } from 'next/server'
import { getServerClient, getUser } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { user_id: string } }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const otherId = params.user_id
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('comm__communications')
    .select('*')
    .eq('comm_type', 'message')
    .or(`and(user_from.eq.${user.id},user_to.eq.${otherId}),and(user_from.eq.${otherId},user_to.eq.${user.id})`)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ items: data ?? [] })
}

