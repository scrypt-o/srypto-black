import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  ActiveMedicationCreateInputSchema, 
  ActiveMedicationListQuerySchema,
  type ActiveMedicationListResponse 
} from '@/schemas/medications-active'
import { z } from 'zod'

// GET /api/patient/medications/active - List active medications
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
    const SortByEnum = z.enum(['created_at', 'medication_name', 'status', 'frequency', 'start_date'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = ActiveMedicationListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        route: searchParams.get('route') || undefined,
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
      .from('v_patient__medications__active')
      .select('*', { count: 'exact' })

    // Apply sorting
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`medication_name.ilike.%${queryParams.search}%,prescriber.ilike.%${queryParams.search}%`)
    }

    // Apply status filter
    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    // Apply route filter
    if (queryParams.route) {
      query = query.eq('route', queryParams.route)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
    }

    const response: ActiveMedicationListResponse = {
      data: (data ?? []) as ActiveMedicationListResponse['data'],
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

// POST /api/patient/medications/active - Create new active medication
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
    
    // Trim all text fields before validation
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
      validatedData = ActiveMedicationCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medications__active')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create medication' }, { status: 500 })
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