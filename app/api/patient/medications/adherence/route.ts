import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  AdherenceTrackingCreateInputSchema, 
  AdherenceTrackingListQuerySchema,
  type AdherenceTrackingListResponse 
} from '@/schemas/medications-adherence'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const SortByEnum = z.enum(['created_at', 'medication_name', 'scheduled_time', 'status'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = AdherenceTrackingListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    const queryParams = ExtendedListQuery.parse({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_dir: searchParams.get('sort_dir') || undefined,
    })

    let query = supabase
      .from('v_patient__medications__adherence')
      .select('*', { count: 'exact' })
      .order(queryParams.sort_by ?? 'created_at', { ascending: queryParams.sort_dir === 'asc' })

    if (queryParams.search) {
      query = query.ilike('medication_name', `%${queryParams.search}%`)
    }

    if (queryParams.status) {
      query = query.eq('status', queryParams.status)
    }

    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch adherence records' }, { status: 500 })
    }

    const response: AdherenceTrackingListResponse = {
      data: (data ?? []) as AdherenceTrackingListResponse['data'],
      total: count || 0,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = (await request.json()) as unknown
    const obj = raw as Record<string, unknown>
    
    const getStr = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)
    const trimmedBody = {
      medication_id: typeof obj.medication_id === 'string' ? obj.medication_id : undefined,
      medication_name: getStr(obj.medication_name),
      scheduled_time: typeof obj.scheduled_time === 'string' ? obj.scheduled_time : undefined,
      actual_time: typeof obj.actual_time === 'string' ? obj.actual_time : undefined,
      status: getStr(obj.status),
      notes: getStr(obj.notes),
    }
    
    const validatedData = AdherenceTrackingCreateInputSchema.parse(trimmedBody)

    const { data, error } = await supabase
      .from('patient__medications__adherence')
      .insert({ ...validatedData, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create adherence record' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}