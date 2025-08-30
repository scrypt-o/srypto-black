import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { ConditionUpdateInputSchema } from '@/schemas/conditions'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/medical-history/conditions/[id] - Get single condition
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single condition
    const { data, error } = await supabase
      .from('v_patient__medhist__conditions')
      .select('*')
      .eq('condition_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch condition' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/medical-history/conditions/[id] - Update condition
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Parse and validate request body
    const raw = (await request.json()) as unknown
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const obj = raw as Record<string, unknown>
    const getStr = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
    const trimmedBody = {
      condition_name: getStr(obj.condition_name),
      icd10_code: getStr(obj.icd10_code),
      other_standard_codes: getStr(obj.other_standard_codes),
      diagnosis_doctor_name: getStr(obj.diagnosis_doctor_name),
      diagnosis_doctor_surname: getStr(obj.diagnosis_doctor_surname),
      practice_number: getStr(obj.practice_number),
      severity: getStr(obj.severity),
      treatment: getStr(obj.treatment),
      current_status: getStr(obj.current_status),
      notes: getStr(obj.notes),
      diagnosis_date: typeof obj.diagnosis_date === 'string' ? obj.diagnosis_date : undefined,
      related_allergies_id: typeof obj.related_allergies_id === 'string' ? obj.related_allergies_id : undefined,
    }
    
    let validatedData
    try {
      validatedData = ConditionUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__medhist__conditions')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('condition_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update condition' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/patient/medical-history/conditions/[id] - Soft delete condition
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Soft delete (set is_active = false)
    const { error } = await supabase
      .from('patient__medhist__conditions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('condition_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete condition' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}