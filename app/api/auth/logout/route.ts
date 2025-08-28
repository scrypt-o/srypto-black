import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await getServerClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}