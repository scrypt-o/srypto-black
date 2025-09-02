import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  ImmunizationCreateInputSchema, 
  ImmunizationListQuerySchema,
  type ImmunizationListResponse 
} from '@/schemas/immunizations'
import { z } from 'zod'

// GET /api/patient/medhist/immunizations - List immunizations
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
    const SortByEnum = z.enum(['created_at', 'vaccine_name', 'date_given', 'provider_name'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = ImmunizationListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        site: searchParams.get('site') || undefined,
        route: searchParams.get('route') || undefined,
        start_date: searchParams.get('start_date') || undefined,
        end_date: searchParams.get('end_date') || undefined,
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
      .from('v_patient__medhist__immunizations')
      .select('*', { count: 'exact' })

    // Apply sorting (default: date_given desc, then created_at desc)
    const sortBy = queryParams.sort_by ?? 'date_given'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })
    if (sortBy !== 'created_at') {
      query = query.order('created_at', { ascending: false })
    }

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`vaccine_name.ilike.%${queryParams.search}%,provider_name.ilike.%${queryParams.search}%,notes.ilike.%${queryParams.search}%`)
    }

    // Apply site filter
    if (queryParams.site) {
      query = query.eq('site', queryParams.site)
    }

    // Apply route filter
    if (queryParams.route) {
      query = query.eq('route', queryParams.route)
    }

    // Apply date range filters
    if (queryParams.start_date) {
      query = query.gte('date_given', queryParams.start_date)
    }
    if (queryParams.end_date) {
      query = query.lte('date_given', queryParams.end_date)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch immunizations' }, { status: 500 })
    }

    const response: ImmunizationListResponse = {
      data: (data ?? []) as ImmunizationListResponse['data'],
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

// POST /api/patient/medhist/immunizations - Create new immunization
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
      vaccine_name: getStr(obj.vaccine_name),
      vaccine_code: getStr(obj.vaccine_code),
      provider_name: getStr(obj.provider_name),
      batch_number: getStr(obj.batch_number),
      site: getStr(obj.site),
      route: getStr(obj.route),
      notes: getStr(obj.notes),
      date_given: typeof obj.date_given === 'string' ? obj.date_given : undefined,
    }
    
    let validatedData
    try {
      validatedData = ImmunizationCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medhist__immunizations')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create immunization' }, { status: 500 })
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