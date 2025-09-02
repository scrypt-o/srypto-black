import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { AllergyUpdateInputSchema } from '@/schemas/allergies'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/patient/medical-history/allergies/[id] - Get single allergy
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch single allergy
    const { data, error } = await supabase
      .from('v_patient__medhist__allergies')
      .select('*')
      .eq('allergy_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Allergy not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch allergy' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patient/medical-history/allergies/[id] - Update allergy
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
      allergen: getStr(obj.allergen),
      allergen_type: getStr(obj.allergen_type),
      severity: getStr(obj.severity),
      reaction: getStr(obj.reaction),
      notes: getStr(obj.notes),
      trigger_factors: getStr(obj.trigger_factors),
      emergency_action_plan: getStr(obj.emergency_action_plan),
      first_observed: typeof obj.first_observed === 'string' ? obj.first_observed : undefined,
    }
    
    let validatedData
    try {
      validatedData = AllergyUpdateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Update in database
    const { data, error } = await supabase
      .from('patient__medhist__allergies')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('allergy_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Allergy not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update allergy' }, { status: 500 })
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

// DELETE /api/patient/medical-history/allergies/[id] - Soft delete allergy
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
      .from('patient__medhist__allergies')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('allergy_id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete allergy' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
