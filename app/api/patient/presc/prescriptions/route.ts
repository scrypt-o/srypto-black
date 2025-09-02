import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

const SaveInputSchema = z.object({
  analysis: z.any(),
  uploadedPath: z.string().min(1),
  sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const csrf = verifyCsrf(request)
  if (csrf) return csrf

  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = SaveInputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 422 })
  }

  const { analysis, uploadedPath, sessionId } = parsed.data

  const { data, error } = await supabase
    .from('patient__presc__prescriptions')
    .insert({
      user_id: user.id,
      status: 'ai-analysed-saved',
      image_path: uploadedPath,
      ai_session_id: sessionId ?? null,
      analysis_data: analysis ?? null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

