import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getAuthenticatedApiClient } from '@/lib/supabase-api'

export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    const { supabase, user } = await getAuthenticatedApiClient()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = (await request.json()) as unknown
    if (typeof raw !== 'object' || raw === null) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const body = raw as Record<string, unknown>
    const path = typeof body.path === 'string' ? body.path : ''
    const bucket = typeof body.bucket === 'string' ? body.bucket : ''
    
    // Validate input
    if (!path || !bucket) {
      return NextResponse.json({ error: 'Path and bucket are required' }, { status: 400 })
    }

    // Security: Validate bucket name
    const validBuckets = ['personal-documents', 'profile-images', 'prescription-images', 'user-uploads']
    if (!validBuckets.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }
    
    // Verify user owns the file (path starts with user ID)
    if (!path.startsWith(user.id)) {
      console.error(`Access denied: User ${user.id} tried to access ${path}`)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600) // 1 hour

    if (error) {
      console.error('Failed to create signed URL:', error)
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error('Signed URL API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
