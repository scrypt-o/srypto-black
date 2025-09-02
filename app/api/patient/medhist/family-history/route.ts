import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  FamilyHistoryCreateInputSchema, 
  FamilyHistoryListQuerySchema,
  type FamilyHistoryListResponse 
} from '@/schemas/family-history'
import { z } from 'zod'

// GET /api/patient/medhist/family-history - List family history records
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
    const SortByEnum = z.enum(['created_at', 'relative', 'condition', 'relationship', 'age_at_onset'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = FamilyHistoryListQuerySchema.extend({
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
      .from('v_patient__medhist__family_hist')
      .select('*', { count: 'exact' })

    // Apply sorting (default: relationship, then relative)
    const sortBy = queryParams.sort_by ?? 'relationship'
    const sortDir = queryParams.sort_dir ?? 'asc'
    if (sortBy === 'relationship') {
      query = query.order('relationship', { ascending: sortDir === 'asc' })
        .order('relative', { ascending: true })
    } else {
      query = query.order(sortBy, { ascending: sortDir === 'asc' })
    }

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`relative.ilike.%${queryParams.search}%,condition.ilike.%${queryParams.search}%`)
    }

    // Apply relationship filter
    if (queryParams.relationship) {
      query = query.eq('relationship', queryParams.relationship)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch family history' }, { status: 500 })
    }

    const response: FamilyHistoryListResponse = {
      data: (data ?? []) as FamilyHistoryListResponse['data'],
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

// POST /api/patient/medhist/family-history - Create new family history record
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
    const getNum = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : undefined)
    const trimmedBody = {
      relative: getStr(obj.relative),
      condition: getStr(obj.condition),
      relationship: getStr(obj.relationship),
      age_at_onset: getNum(obj.age_at_onset),
      notes: getStr(obj.notes),
    }
    
    let validatedData
    try {
      validatedData = FamilyHistoryCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medhist__family_hist')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create family history record' }, { status: 500 })
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
