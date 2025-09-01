import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { 
  MedicationHistoryCreateInputSchema, 
  MedicationHistoryListQuerySchema,
  type MedicationHistoryListResponse 
} from '@/schemas/medications-history'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const SortByEnum = z.enum(['created_at', 'medication_name', 'taken_period', 'effectiveness'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const ExtendedListQuery = MedicationHistoryListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    const queryParams = ExtendedListQuery.parse({
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
      search: searchParams.get('search') || undefined,
      effectiveness: searchParams.get('effectiveness') || undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_dir: searchParams.get('sort_dir') || undefined,
    })

    let query = supabase
      .from('v_patient__medications__history')
      .select('*', { count: 'exact' })
      .order(queryParams.sort_by ?? 'created_at', { ascending: queryParams.sort_dir === 'asc' })

    if (queryParams.search) {
      query = query.or(`medication_name.ilike.%${queryParams.search}%,reason.ilike.%${queryParams.search}%`)
    }

    if (queryParams.effectiveness) {
      query = query.eq('effectiveness', queryParams.effectiveness)
    }

    const from = (queryParams.page - 1) * queryParams.pageSize
    const to = from + queryParams.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch medication history' }, { status: 500 })
    }

    const response: MedicationHistoryListResponse = {
      data: (data ?? []) as MedicationHistoryListResponse['data'],
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
      medication_name: getStr(obj.medication_name),
      taken_period: getStr(obj.taken_period),
      reason: getStr(obj.reason),
      effectiveness: getStr(obj.effectiveness),
      side_effects: getStr(obj.side_effects),
      notes: getStr(obj.notes),
    }
    
    const validatedData = MedicationHistoryCreateInputSchema.parse(trimmedBody)

    const { data, error } = await supabase
      .from('patient__medications__history')
      .insert({ ...validatedData, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create medication history record' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}