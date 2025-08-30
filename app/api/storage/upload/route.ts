import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getAuthenticatedApiClient } from '@/lib/supabase-api'

export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    // Authentication required
    const { supabase, user } = await getAuthenticatedApiClient()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const path = formData.get('path') as string

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!bucket || !path) {
      return NextResponse.json({ error: 'Bucket and path are required' }, { status: 400 })
    }

    // Security: Validate bucket name
    const validBuckets = ['personal-documents', 'profile-images', 'prescription-images', 'user-uploads']
    if (!validBuckets.includes(bucket)) {
      console.error(`Invalid bucket attempt: ${bucket} by user ${user.id}`)
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    // Additional file validation
    if (file.size > 20 * 1024 * 1024) { // 20MB absolute limit
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
    }

    // Convert to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // CRITICAL: Create user-specific path for complete isolation
    const userPath = `${user.id}/${path}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(userPath, buffer, {
        contentType: file.type,
        upsert: true // Allow overwriting
      })

    if (error) {
      console.error('Storage upload failed:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Generate signed URL for immediate access (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 3600) // 1 hour

    if (signedUrlError) {
      console.error('Failed to create signed URL:', signedUrlError)
      return NextResponse.json({ error: 'Failed to create secure URL' }, { status: 500 })
    }

    return NextResponse.json({ 
      url: signedUrlData.signedUrl,  // Temporary signed URL
      path: data.path,               // STORE THIS in database
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
