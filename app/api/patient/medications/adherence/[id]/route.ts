import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { AdherenceTrackingUpdateInputSchema } from '@/schemas/medications-adherence'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('v_patient__medications__adherence')
      .select('*')
      .eq('adherence_id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Adherence record not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = (await request.json()) as unknown
    const obj = raw as Record<string, unknown>
    
    const getStr = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
    const trimmedBody = {
      medication_id: typeof obj.medication_id === 'string' ? obj.medication_id : undefined,
      medication_name: getStr(obj.medication_name),
      scheduled_time: typeof obj.scheduled_time === 'string' ? obj.scheduled_time : undefined,
      actual_time: typeof obj.actual_time === 'string' ? obj.actual_time : undefined,
      status: getStr(obj.status),
      notes: getStr(obj.notes),
    }
    
    const validatedData = AdherenceTrackingUpdateInputSchema.parse(trimmedBody)

    const { data, error } = await supabase
      .from('patient__medications__adherence')
      .update(validatedData)
      .eq('adherence_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update adherence record' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('patient__medications__adherence')
      .update({ is_active: false })
      .eq('adherence_id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete adherence record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}