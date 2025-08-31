import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifyCsrf(request)
  if (csrf) return csrf

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const idSchema = z.string().uuid()
  const parsedId = idSchema.safeParse(params.id)
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid id' }, { status: 422 })

  const { data, error } = await supabase
    .from('patient__presc__prescriptions')
    .update({ status: 'ai-analysed-submitted' })
    .eq('prescription_id', parsedId.data)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(data, { status: 200 })
}

