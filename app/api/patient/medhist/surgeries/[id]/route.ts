import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { SurgeryUpdateInputSchema } from '@/schemas/surgeries'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/medhist/surgeries/[id] - Get single surgery
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single surgery
    const { data, error } = await supabase
      .from('v_patient__medhist__surgeries')
      .select('*')
      .eq('surgery_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Surgery not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch surgery' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/medhist/surgeries/[id] - Update surgery
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
      surgery_name: getStr(obj.surgery_name),
      surgery_type: getStr(obj.surgery_type),
      surgery_date: typeof obj.surgery_date === 'string' ? obj.surgery_date : undefined,
      hospital_name: getStr(obj.hospital_name),
      surgeon_name: getStr(obj.surgeon_name),
      surgeon_practice_number: getStr(obj.surgeon_practice_number),
      anesthetist_name: getStr(obj.anesthetist_name),
      procedure_code: getStr(obj.procedure_code),
      complications: getStr(obj.complications),
      recovery_notes: getStr(obj.recovery_notes),
      outcome: getStr(obj.outcome),
      related_condition_id: typeof obj.related_condition_id === 'string' ? obj.related_condition_id : undefined,
    }
    
    let validatedData
    try {
      validatedData = SurgeryUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__medhist__surgeries')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('surgery_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Surgery not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update surgery' }, { status: 500 })
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

// DELETE /api/patient/medhist/surgeries/[id] - Soft delete surgery
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
      .from('patient__medhist__surgeries')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('surgery_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete surgery' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}