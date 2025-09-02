import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import {
  SleepCreateInputSchema,
  SleepListQuerySchema,
  type SleepListResponse,
} from '@/schemas/sleep'

// GET /api/patient/vitality/sleep - List sleep entries
export async function GET(request: NextRequest) {
  try {
    const supabase = await getServerClient()
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const SortByEnum = z.enum(['sleep_date', 'created_at', 'sleep_quality_rating'])
    const SortDirEnum = z.enum(['asc', 'desc'])
    const Extended = SleepListQuerySchema.extend({
      sort_by: SortByEnum.optional(),
      sort_dir: SortDirEnum.optional(),
    })

    let qp: z.infer<typeof Extended>
    try {
      qp = Extended.parse({
        page: parseInt(sp.get('page') || '1'),
        pageSize: parseInt(sp.get('pageSize') || '20'),
        search: sp.get('search') || undefined,
        min_quality: sp.get('min_quality') || undefined,
        date_from: sp.get('date_from') || undefined,
        date_to: sp.get('date_to') || undefined,
        sort_by: sp.get('sort_by') || undefined,
        sort_dir: sp.get('sort_dir') || undefined,
      })
    } catch (zerr) {
      return NextResponse.json({ error: 'Invalid query parameters', details: zerr }, { status: 422 })
    }

    let query = supabase
      .from('v_patient__vitality__sleep')
      .select('*', { count: 'exact' })

    const sortBy = qp.sort_by ?? 'sleep_date'
    const sortDir = qp.sort_dir ?? 'desc'
    query = query.order(sortBy, { ascending: sortDir === 'asc' })

    if (qp.search) {
      query = query.or(`notes.ilike.%${qp.search}%,sleep_aids_used.ilike.%${qp.search}%`)
    }
    if (qp.min_quality) {
      query = query.gte('sleep_quality_rating', qp.min_quality)
    }
    if (qp.date_from) {
      query = query.gte('sleep_date', qp.date_from)
    }
    if (qp.date_to) {
      query = query.lte('sleep_date', qp.date_to)
    }

    const from = (qp.page - 1) * qp.pageSize
    const to = from + qp.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch sleep entries' }, { status: 500 })
    }

    const response: SleepListResponse = {
      data: (data ?? []) as SleepListResponse['data'],
      total: count || 0,
      page: qp.page,
      pageSize: qp.pageSize,
    }
    return NextResponse.json(response)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/patient/vitality/sleep - Create sleep entry
export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request); if (csrf) return csrf
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let raw: unknown
    try { raw = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    // Trim strings
    const o = (raw || {}) as Record<string, unknown>
    const s = (v: unknown) => typeof v === 'string' ? v.trim() : undefined
    const trimmed = {
      sleep_date: s(o.sleep_date),
      bedtime: s(o.bedtime),
      wake_time: s(o.wake_time),
      sleep_duration_hours: typeof o.sleep_duration_hours === 'number' ? o.sleep_duration_hours : undefined,
      sleep_efficiency_percentage: typeof o.sleep_efficiency_percentage === 'number' ? o.sleep_efficiency_percentage : undefined,
      sleep_quality_rating: typeof o.sleep_quality_rating === 'number' ? o.sleep_quality_rating : undefined,
      rem_minutes: typeof o.rem_minutes === 'number' ? o.rem_minutes : undefined,
      deep_sleep_minutes: typeof o.deep_sleep_minutes === 'number' ? o.deep_sleep_minutes : undefined,
      light_sleep_minutes: typeof o.light_sleep_minutes === 'number' ? o.light_sleep_minutes : undefined,
      interruptions_count: typeof o.interruptions_count === 'number' ? o.interruptions_count : undefined,
      sleep_environment_rating: typeof o.sleep_environment_rating === 'number' ? o.sleep_environment_rating : undefined,
      sleep_aids_used: s(o.sleep_aids_used),
      notes: s(o.notes),
    }

    let payload
    try {
      payload = SleepCreateInputSchema.parse(trimmed)
    } catch (zerr) {
      return NextResponse.json({ error: 'Invalid input data', details: zerr }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('patient__vitality__sleep')
      .insert({
        ...payload,
        user_id: user.id,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create sleep entry' }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

