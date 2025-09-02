import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { EmergencyContactUpdateInputSchema } from '@/schemas/emergencyContacts'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/personal-info/emergency-contacts/[id] - Get single emergency contact
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single emergency contact
    const { data, error } = await supabase
      .from('v_patient__persinfo__emrg_contacts')
      .select('*')
      .eq('contact_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Emergency contact not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch emergency contact' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/personal-info/emergency-contacts/[id] - Update emergency contact
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
      name: getStr(obj.name),
      relationship: getStr(obj.relationship),
      phone: getStr(obj.phone),
      email: getStr(obj.email),
      address: getStr(obj.address),
      alternative_phone: getStr(obj.alternative_phone),
      is_primary: typeof obj.is_primary === 'boolean' ? obj.is_primary : undefined,
    }
    
    let validatedData
    try {
      validatedData = EmergencyContactUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // If setting as primary, unset any existing primary contact (except this one)
    if (validatedData.is_primary) {
      await supabase
        .from('patient__persinfo__emrg_contacts')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .neq('contact_id', id)
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__persinfo__emrg_contacts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Emergency contact not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update emergency contact' }, { status: 500 })
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

// DELETE /api/patient/personal-info/emergency-contacts/[id] - Soft delete emergency contact
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
      .from('patient__persinfo__emrg_contacts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('contact_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete emergency contact' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}