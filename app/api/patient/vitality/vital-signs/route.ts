import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  VitalSignCreateInputSchema, 
  VitalSignListQuerySchema,
  type VitalSignListResponse 
} from '@/schemas/vitalSigns'
import { z } from 'zod'

// GET /api/patient/vitality/vital-signs - List vital signs
export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    // Extend list query schema with server-side sorting
    const SortByEnum = z.enum(['created_at', 'measurement_date', 'systolic_bp', 'heart_rate', 'temperature'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = VitalSignListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        measurement_context: searchParams.get('measurement_context') || undefined,
        date_from: searchParams.get('date_from') || undefined,
        date_to: searchParams.get('date_to') || undefined,
        sort_by: searchParams.get('sort_by') || undefined,
        sort_dir: searchParams.get('sort_dir') || undefined,
      })
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: zodError 
      }, { status: 422 })
    }

    // Build query
    let query = supabase
      .from('v_patient__vitality__vital_signs')
      .select('*', { count: 'exact' })

    // Apply sorting (default: created_at desc)
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter - search across measurement device, context, and notes
    if (queryParams.search) {
      query = query.or(`measurement_device.ilike.%${queryParams.search}%,measurement_context.ilike.%${queryParams.search}%,notes.ilike.%${queryParams.search}%`)
    }

    // Apply measurement_context filter
    if (queryParams.measurement_context) {
      query = query.eq('measurement_context', queryParams.measurement_context)
    }

    // Apply date range filters
    if (queryParams.date_from) {
      query = query.gte('measurement_date', queryParams.date_from)
    }
    if (queryParams.date_to) {
      query = query.lte('measurement_date', queryParams.date_to)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch vital signs' }, { status: 500 })
    }

    const response: VitalSignListResponse = {
      data: (data ?? []) as VitalSignListResponse['data'],
      total: count || 0,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/patient/vitality/vital-signs - Create new vital sign reading
export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    const supabase = await getServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      validatedData = VitalSignCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__vitality__vital_signs')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create vital sign reading' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}