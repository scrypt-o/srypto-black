import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  const csrf = verifyCsrf(request)
  if (csrf) return csrf

  const supabase = await getServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resolvedParams = await params
  const idSchema = z.string().uuid()
  const parsedId = idSchema.safeParse(resolvedParams.id)
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid id' }, { status: 422 })

  const { data, error } = await supabase
    .from('patient__presc__prescriptions')
    .update({ status: 'ai-analysed-submitted' })
    .eq('prescription_id', parsedId.data)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Also trigger allocation to pharmacies
  try {
    const allocateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4569'}/api/patient/presc/prescriptions/${parsedId.data}/allocate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        }
      }
    )
    
    if (!allocateResponse.ok) {
      console.error('Failed to allocate to pharmacies:', await allocateResponse.text())
    }
  } catch (allocError) {
    console.error('Allocation error:', allocError)
    // Don't fail the submit if allocation fails
  }

  return NextResponse.json(data, { status: 200 })
}

