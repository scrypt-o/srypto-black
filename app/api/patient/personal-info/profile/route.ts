import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

const UpdateSchema = z.object({
  profile_picture_url: z.string().min(1).optional(), // stores storage path or external URL
})

export async function PUT(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation', details: parsed.error.flatten() }, { status: 422 })

  const updates: Record<string, any> = {}
  if (parsed.data.profile_picture_url) updates.profile_picture_url = parsed.data.profile_picture_url
  updates.updated_at = new Date().toISOString()

  // Upsert by user_id (single profile per user)
  const { data, error } = await supabase
    .from('patient__persinfo__profile')
    .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  return NextResponse.json(data)
}

