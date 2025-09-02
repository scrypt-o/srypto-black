import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  SurgeryCreateInputSchema, 
  SurgeryListQuerySchema,
  type SurgeryListResponse 
} from '@/schemas/surgeries'
import { z } from 'zod'

// GET /api/patient/medhist/surgeries - List surgeries
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
    const SortByEnum = z.enum(['created_at', 'surgery_name', 'surgery_date', 'surgery_type', 'outcome'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = SurgeryListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        surgery_type: searchParams.get('surgery_type') || undefined,
        outcome: searchParams.get('outcome') || undefined,
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
      .from('v_patient__medhist__surgeries')
      .select('*', { count: 'exact' })

    // Apply sorting (default: surgery_date desc)
    const sortBy = queryParams.sort_by ?? 'surgery_date'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`surgery_name.ilike.%${queryParams.search}%,surgeon_name.ilike.%${queryParams.search}%,hospital_name.ilike.%${queryParams.search}%`)
    }

    // Apply surgery_type filter
    if (queryParams.surgery_type) {
      query = query.eq('surgery_type', queryParams.surgery_type)
    }

    // Apply outcome filter
    if (queryParams.outcome) {
      query = query.eq('outcome', queryParams.outcome)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch surgeries' }, { status: 500 })
    }

    const response: SurgeryListResponse = {
      data: (data ?? []) as SurgeryListResponse['data'],
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

// POST /api/patient/medhist/surgeries - Create new surgery
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
      validatedData = SurgeryCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medhist__surgeries')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create surgery' }, { status: 500 })
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