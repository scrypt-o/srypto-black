import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  AllergyCreateInputSchema, 
  AllergyListQuerySchema,
  type AllergyListResponse 
} from '@/schemas/allergies'
import { z } from 'zod'

// GET /api/patient/medhist/allergies - List allergies
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
    const SortByEnum = z.enum(['created_at', 'allergen', 'severity', 'allergen_type'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = AllergyListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        allergen_type: searchParams.get('allergen_type') || undefined,
        severity: searchParams.get('severity') || undefined,
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
      .from('v_patient__medhist__allergies')
      .select('*', { count: 'exact' })

    // Apply sorting (default: created_at desc)
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`allergen.ilike.%${queryParams.search}%,reaction.ilike.%${queryParams.search}%`)
    }

    // Apply allergen_type filter
    if (queryParams.allergen_type) {
      query = query.eq('allergen_type', queryParams.allergen_type)
    }

    // Apply severity filter
    if (queryParams.severity) {
      query = query.eq('severity', queryParams.severity)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch allergies' }, { status: 500 })
    }

    const response: AllergyListResponse = {
      data: (data ?? []) as AllergyListResponse['data'],
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

// POST /api/patient/medhist/allergies - Create new allergy
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
    // Trim all text fields before validation (safely)
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
      validatedData = AllergyCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medhist__allergies')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create allergy' }, { status: 500 })
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
