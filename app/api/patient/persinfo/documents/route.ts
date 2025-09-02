import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

const CreateSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  file_url: z.string().min(1), // storage path
  file_size: z.number().int().positive(),
  description: z.string().optional(),
  category: z.enum(['id-document','medical-record','insurance','prescription','lab-result','imaging','consent-form','other']).default('other'),
  is_confidential: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation', details: parsed.error.flatten() }, { status: 422 })

  const payload = parsed.data
  const { data, error } = await supabase
    .from('patient__persinfo__documents')
    .insert({
      user_id: user.id,
      file_name: payload.file_name,
      file_type: payload.file_type,
      file_url: payload.file_url,
      file_size: payload.file_size,
      description: payload.description ?? null,
      category: payload.category,
      is_confidential: payload.is_confidential ?? false,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

