import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { ActiveMedicationUpdateInputSchema } from '@/schemas/medications-active'

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
      .from('v_patient__medications__active')
      .select('*')
      .eq('medication_id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Medication not found' }, { status: 404 })
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
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const obj = raw as Record<string, unknown>
    
    const getStr = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
    const trimmedBody = {
      medication_name: getStr(obj.medication_name),
      dosage: getStr(obj.dosage),
      frequency: getStr(obj.frequency),
      route: getStr(obj.route),
      start_date: typeof obj.start_date === 'string' ? obj.start_date : undefined,
      end_date: typeof obj.end_date === 'string' ? obj.end_date : undefined,
      prescriber: getStr(obj.prescriber),
      status: getStr(obj.status),
      notes: getStr(obj.notes),
    }
    
    let validatedData
    try {
      validatedData = ActiveMedicationUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ error: 'Invalid input data', details: zodError }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('patient__medications__active')
      .update(validatedData)
      .eq('medication_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update medication' }, { status: 500 })
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
      .from('patient__medications__active')
      .update({ is_active: false })
      .eq('medication_id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}