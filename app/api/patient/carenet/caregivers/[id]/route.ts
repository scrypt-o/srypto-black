import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { CaregiverUpdateInputSchema } from '@/schemas/caregivers'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/care-network/caregivers/[id] - Get single caregiver
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single caregiver
    const { data, error } = await supabase
      .from('v_patient__carenet__caregivers')
      .select('*')
      .eq('caregiver_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch caregiver' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/care-network/caregivers/[id] - Update caregiver
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
      title: getStr(obj.title),
      first_name: getStr(obj.first_name),
      middle_name: getStr(obj.middle_name),
      last_name: getStr(obj.last_name),
      id_number: getStr(obj.id_number),
      passport_number: getStr(obj.passport_number),
      citizenship: getStr(obj.citizenship),
      relationship: getStr(obj.relationship),
      phone: getStr(obj.phone),
      email: getStr(obj.email),
      emergency_contact: getStr(obj.emergency_contact),
      access_level: getStr(obj.access_level),
      permissions: typeof obj.permissions === 'object' ? obj.permissions : undefined,
      use_profile_info: typeof obj.use_profile_info === 'boolean' ? obj.use_profile_info : undefined,
    }
    
    let validatedData
    try {
      validatedData = CaregiverUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__carenet__caregivers')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('caregiver_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update caregiver' }, { status: 500 })
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

// DELETE /api/patient/care-network/caregivers/[id] - Soft delete caregiver
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
      .from('patient__carenet__caregivers')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('caregiver_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete caregiver' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}