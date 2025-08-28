import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const raw = (await request.json()) as unknown
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const rawEmail = (raw as Record<string, unknown>).email
    const email = typeof rawEmail === 'string' ? rawEmail : ''

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await getServerClient()

    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email as string, {
      redirectTo: `${request.nextUrl.origin}/reset-password/confirm`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      message: 'Password reset email sent successfully' 
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
