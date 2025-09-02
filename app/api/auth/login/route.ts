import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerClient()
    const body = await request.json().catch(() => null) as { email?: string; password?: string } | null
    if (!body?.email || !body?.password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })
    if (signInError || !signInData?.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Ensure a profile row exists for this user (single per user)
    try {
      const u = signInData.user
      await supabase
        .from('patient__persinfo__profile')
        .upsert({
          user_id: u.id,
          first_name: (u.user_metadata as any)?.given_name || (u.user_metadata as any)?.first_name || '',
          last_name: (u.user_metadata as any)?.family_name || (u.user_metadata as any)?.last_name || '',
        }, { onConflict: 'user_id' })
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

