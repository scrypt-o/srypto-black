import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'

// Normalized address fields for a given type (home|postal|delivery)
const baseFields = {
  address1: z.string().min(1).max(200).optional(),
  address2: z.string().max(200).optional(),
  street_no: z.string().max(50).optional(),
  street_name: z.string().max(200).optional(),
  suburb: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  province: z.string().max(200).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(120).optional(),
}

const TypeEnum = z.enum(['home','postal','delivery'])

const UpdateSchema = z.object({
  type: TypeEnum,
  // when toggles are used
  postal_same_as_home: z.boolean().optional(),
  delivery_same_as_home: z.boolean().optional(),
  // normalized fields (will be mapped to table columns by type)
  ...baseFields,
})

export async function GET() {
  const supabase = await getServerClient()
  // Try singular view first per DDL, fallback to legacy plural
  let { data, error } = await supabase
    .from('v_patient__persinfo__address')
    .select('*')
    .single()
  if (error) {
    const res = await supabase.from('v_patient__persinfo__addresses').select('*').single()
    data = res.data
  }
  return NextResponse.json({ data: data ?? null })
}

export async function PUT(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation', details: parsed.error.flatten() }, { status: 422 })
  const payload = parsed.data

  const prefix = payload.type // 'home' | 'postal' | 'delivery'
  const map: Record<string, any> = { updated_at: new Date().toISOString(), user_id: user.id }

  // same-as toggles
  if (typeof payload.postal_same_as_home === 'boolean') map['postal_same_as_home'] = String(payload.postal_same_as_home)
  if (typeof payload.delivery_same_as_home === 'boolean') map['delivery_same_as_home'] = payload.delivery_same_as_home

  // normalized -> table columns (e.g., home_address1, postal_city, delivery_postal_code)
  const assign = (key: keyof typeof baseFields) => {
    const val = (payload as any)[key]
    if (val !== undefined) {
      const columnKey = `${prefix}_${key}`
      map[columnKey] = val
    }
  }
  Object.keys(baseFields).forEach(k => assign(k as keyof typeof baseFields))

  // Upsert single-record table by user_id
  const { data, error } = await supabase
    .from('patient__persinfo__address')
    .upsert(map, { onConflict: 'user_id' })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  return NextResponse.json(data)
}

