import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  ConditionCreateInputSchema, 
  ConditionListQuerySchema,
  type ConditionListResponse 
} from '@/schemas/conditions'
import { z } from 'zod'

// GET /api/patient/medhist/conditions - List conditions
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
    const SortByEnum = z.enum(['created_at', 'condition_name', 'severity', 'current_status'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = ConditionListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let queryParams: z.infer<typeof ExtendedListQuery>
    try {
      queryParams = ExtendedListQuery.parse({
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '20'),
        search: searchParams.get('search') || undefined,
        severity: searchParams.get('severity') || undefined,
        current_status: searchParams.get('current_status') || undefined,
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
      .from('v_patient__medhist__conditions')
      .select('*', { count: 'exact' })

    // Apply sorting (default: created_at desc)
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`condition_name.ilike.%${queryParams.search}%,treatment.ilike.%${queryParams.search}%`)
    }

    // Apply severity filter
    if (queryParams.severity) {
      query = query.eq('severity', queryParams.severity)
    }

    // Apply current_status filter
    if (queryParams.current_status) {
      query = query.eq('current_status', queryParams.current_status)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch conditions' }, { status: 500 })
    }

    const response: ConditionListResponse = {
      data: (data ?? []) as ConditionListResponse['data'],
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

// POST /api/patient/medhist/conditions - Create new condition
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
      condition_name: getStr(obj.condition_name),
      icd10_code: getStr(obj.icd10_code),
      other_standard_codes: getStr(obj.other_standard_codes),
      diagnosis_doctor_name: getStr(obj.diagnosis_doctor_name),
      diagnosis_doctor_surname: getStr(obj.diagnosis_doctor_surname),
      practice_number: getStr(obj.practice_number),
      severity: getStr(obj.severity),
      treatment: getStr(obj.treatment),
      current_status: getStr(obj.current_status),
      notes: getStr(obj.notes),
      diagnosis_date: typeof obj.diagnosis_date === 'string' ? obj.diagnosis_date : undefined,
      related_allergies_id: typeof obj.related_allergies_id === 'string' ? obj.related_allergies_id : undefined,
    }
    
    let validatedData
    try {
      validatedData = ConditionCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__medhist__conditions')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create condition' }, { status: 500 })
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