import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  EmergencyContactCreateInputSchema, 
  EmergencyContactListQuerySchema,
  type EmergencyContactListResponse 
} from '@/schemas/emergencyContacts'
import { z } from 'zod'

// GET /api/patient/persinfo/emergency-contacts - List emergency contacts
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
    const SortByEnum = z.enum(['created_at', 'name', 'relationship', 'is_primary'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = EmergencyContactListQuerySchema.extend({
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
        is_primary: searchParams.get('is_primary') === 'true' ? true : 
                   searchParams.get('is_primary') === 'false' ? false : undefined,
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
      .from('v_patient__persinfo__emrg_contacts')
      .select('*', { count: 'exact' })

    // Apply sorting (default: is_primary desc, then created_at desc)
    const sortBy = queryParams.sort_by ?? 'created_at'
    const sortDir = queryParams.sort_dir ?? 'desc'
    query = query.order('is_primary', { ascending: false })
             .order(sortBy, { ascending: sortDir === 'asc' })

    // Apply search filter
    if (queryParams.search) {
      query = query.or(`name.ilike.%${queryParams.search}%,relationship.ilike.%${queryParams.search}%`)
    }

    // Apply relationship filter
    if (queryParams.relationship) {
      query = query.eq('relationship', queryParams.relationship)
    }

    // Apply is_primary filter
    if (queryParams.is_primary !== undefined) {
      query = query.eq('is_primary', queryParams.is_primary)
    }

    // Apply pagination
    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch emergency contacts' }, { status: 500 })
    }

    const response: EmergencyContactListResponse = {
      data: (data ?? []) as EmergencyContactListResponse['data'],
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

// POST /api/patient/persinfo/emergency-contacts - Create new emergency contact
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
      name: getStr(obj.name),
      relationship: getStr(obj.relationship),
      phone: getStr(obj.phone),
      email: getStr(obj.email),
      address: getStr(obj.address),
      alternative_phone: getStr(obj.alternative_phone),
      is_primary: typeof obj.is_primary === 'boolean' ? obj.is_primary : false,
    }
    
    let validatedData
    try {
      validatedData = EmergencyContactCreateInputSchema.parse(trimmedBody)
    } catch (zodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: zodError 
      }, { status: 422 })
    }

    // If setting as primary, unset any existing primary contact
    if (validatedData.is_primary) {
      await supabase
        .from('patient__persinfo__emrg_contacts')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .eq('is_primary', true)
    }

    // Insert into database
    const { data, error } = await supabase
      .from('patient__persinfo__emrg_contacts')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create emergency contact' }, { status: 500 })
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