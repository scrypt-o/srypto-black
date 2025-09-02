import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { SleepUpdateInputSchema } from '@/schemas/sleep'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/vitality/sleep/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { data, error } = await supabase
      .from('v_patient__vitality__sleep')
      .select('*')
      .eq('sleep_id', id)
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch sleep entry' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/vitality/sleep/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const csrf = verifyCsrf(request); if (csrf) return csrf
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let raw: unknown
    try { raw = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
    // Trim strings and coerce numbers left to schema
    const o = (raw || {}) as Record<string, unknown>
    const s = (v: unknown) => typeof v === 'string' ? v.trim() : undefined
    const trimmed = {
      sleep_date: s(o.sleep_date),
      bedtime: s(o.bedtime),
      wake_time: s(o.wake_time),
      sleep_duration_hours: typeof o.sleep_duration_hours === 'number' ? o.sleep_duration_hours : undefined,
      sleep_efficiency_percentage: typeof o.sleep_efficiency_percentage === 'number' ? o.sleep_efficiency_percentage : undefined,
      sleep_quality_rating: typeof o.sleep_quality_rating === 'number' ? o.sleep_quality_rating : undefined,
      rem_minutes: typeof o.rem_minutes === 'number' ? o.rem_minutes : undefined,
      deep_sleep_minutes: typeof o.deep_sleep_minutes === 'number' ? o.deep_sleep_minutes : undefined,
      light_sleep_minutes: typeof o.light_sleep_minutes === 'number' ? o.light_sleep_minutes : undefined,
      interruptions_count: typeof o.interruptions_count === 'number' ? o.interruptions_count : undefined,
      sleep_environment_rating: typeof o.sleep_environment_rating === 'number' ? o.sleep_environment_rating : undefined,
      sleep_aids_used: s(o.sleep_aids_used),
      notes: s(o.notes),
    }

    let payload
    try {
      payload = SleepUpdateInputSchema.parse(trimmed)
    } catch (zerr) {
      return NextResponse.json({ error: 'Invalid input data', details: zerr }, { status: 422 })
    }

    const { id } = await params
    const { data, error } = await supabase
      .from('patient__vitality__sleep')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('sleep_id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      if ((error as any).code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update sleep entry' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/patient/vitality/sleep/[id] (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const csrf = verifyCsrf(request); if (csrf) return csrf
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { error } = await supabase
      .from('patient__vitality__sleep')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('sleep_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete sleep entry' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

