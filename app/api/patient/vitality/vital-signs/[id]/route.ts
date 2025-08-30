import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { VitalSignUpdateInputSchema } from '@/schemas/vitalSigns'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/vitality/vital-signs/[id] - Get single vital sign reading
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single vital sign reading
    const { data, error } = await supabase
      .from('v_patient__vitality__vital_signs')
      .select('*')
      .eq('vital_sign_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vital sign reading not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch vital sign reading' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/vitality/vital-signs/[id] - Update vital sign reading
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
    
    // Helper to safely convert string to number
    const getNum = (v: unknown) => {
      if (typeof v === 'string' && v.trim() !== '') {
        const num = parseFloat(v.trim())
        return isNaN(num) ? undefined : num
      }
      if (typeof v === 'number') return v
      return undefined
    }
    
    // Helper to safely get string
    const getStr = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
    
    const trimmedBody = {
      measurement_date: typeof obj.measurement_date === 'string' ? obj.measurement_date : undefined,
      systolic_bp: getNum(obj.systolic_bp),
      diastolic_bp: getNum(obj.diastolic_bp),
      heart_rate: getNum(obj.heart_rate),
      temperature: getNum(obj.temperature),
      oxygen_saturation: getNum(obj.oxygen_saturation),
      respiratory_rate: getNum(obj.respiratory_rate),
      blood_glucose: getNum(obj.blood_glucose),
      cholesterol_total: getNum(obj.cholesterol_total),
      hdl_cholesterol: getNum(obj.hdl_cholesterol),
      ldl_cholesterol: getNum(obj.ldl_cholesterol),
      triglycerides: getNum(obj.triglycerides),
      measurement_device: getStr(obj.measurement_device),
      measurement_context: getStr(obj.measurement_context),
      notes: getStr(obj.notes),
    }
    
    let validatedData
    try {
      validatedData = VitalSignUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__vitality__vital_signs')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('vital_sign_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vital sign reading not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update vital sign reading' }, { status: 500 })
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

// DELETE /api/patient/vitality/vital-signs/[id] - Soft delete vital sign reading
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
      .from('patient__vitality__vital_signs')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('vital_sign_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete vital sign reading' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}