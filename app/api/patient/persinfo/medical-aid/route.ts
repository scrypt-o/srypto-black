import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'
import { MedicalAidUpdateSchema } from '@/schemas/medicalAid'

export async function GET() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__medical_aid')
    .select('*')
    .single()
  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = MedicalAidUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation', details: parsed.error.flatten() }, { status: 422 })

  const updates = { ...parsed.data, updated_at: new Date().toISOString(), user_id: user.id }
  const { data, error } = await supabase
    .from('patient__persinfo__medical_aid')
    .upsert(updates, { onConflict: 'user_id' })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: 'Failed to update medical aid' }, { status: 500 })
  return NextResponse.json(data)
}

