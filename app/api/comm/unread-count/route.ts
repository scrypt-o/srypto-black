import { NextResponse } from 'next/server'
import { getServerClient, getUser } from '@/lib/supabase-server'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ count: 0 })
  const supabase = await getServerClient()
  const { count, error } = await supabase
    .from('v_comm__communications')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null)
  if (error) return NextResponse.json({ count: 0 })
  return NextResponse.json({ count: count ?? 0 })
}

