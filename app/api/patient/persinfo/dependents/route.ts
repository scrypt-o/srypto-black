import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  DependentCreateInputSchema, 
  DependentListQuerySchema,
  type DependentListResponse 
} from '@/schemas/dependents'
import { z } from 'zod'

// GET /api/patient/persinfo/dependents - List dependents
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
    const SortByEnum = z.enum(['created_at', 'full_name', 'relationship', 'date_of_birth'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = DependentListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        relationship: searchParams.get('relationship') || undefined,
        citizenship: searchParams.get('citizenship') || undefined,
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
      .from('v_patient__persinfo__dependents')
      .select('*', { count: 'exact' })

    // Apply sorting (default: created_at desc)
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`full_name.ilike.%${queryParams.search}%,first_name.ilike.%${queryParams.search}%,last_name.ilike.%${queryParams.search}%`)
    }

    // Apply relationship filter
    if (queryParams.relationship) {
      query = query.eq('relationship', queryParams.relationship)
    }

    // Apply citizenship filter
    if (queryParams.citizenship) {
      query = query.eq('citizenship', queryParams.citizenship)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch dependents' }, { status: 500 })
    }

    const response: DependentListResponse = {
      data: (data ?? []) as DependentListResponse['data'],
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

// POST /api/patient/persinfo/dependents - Create new dependent
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
      full_name: getStr(obj.full_name),
      relationship: getStr(obj.relationship),
      date_of_birth: typeof obj.date_of_birth === 'string' ? obj.date_of_birth : undefined,
      id_number: getStr(obj.id_number),
      medical_aid_number: getStr(obj.medical_aid_number),
      title: getStr(obj.title),
      first_name: getStr(obj.first_name),
      middle_name: getStr(obj.middle_name),
      last_name: getStr(obj.last_name),
      passport_number: getStr(obj.passport_number),
      citizenship: getStr(obj.citizenship),
      use_profile_info: typeof obj.use_profile_info === 'boolean' ? obj.use_profile_info : undefined,
    }
    
    let validatedData
    try {
      validatedData = DependentCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__persinfo__dependents')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create dependent' }, { status: 500 })
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