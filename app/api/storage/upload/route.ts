import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'

// Magic bytes validation for medical security compliance
function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  // Common image magic bytes patterns
  const magicBytes: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]] // RIFF header
  }
  
  const patterns = magicBytes[mimeType]
  if (!patterns) return true // Allow unknown types to pass through
  
  return patterns.some(pattern => {
    for (let i = 0; i < pattern.length; i++) {
      if (buffer[i] !== pattern[i]) return false
    }
    return true
  })
}

export async function POST(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    // Authentication required
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
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

    // Enhanced file validation for medical security (2025 standards)
    
    // 1. File size validation by bucket type
    const maxSizes: Record<string, number> = {
      'profile-images': 5 * 1024 * 1024,      // 5MB for profile photos
      'personal-documents': 10 * 1024 * 1024,  // 10MB for documents
      'prescription-images': 10 * 1024 * 1024, // 10MB for prescription scans
      'user-uploads': 20 * 1024 * 1024         // 20MB for general uploads
    }
    
    const maxSize = maxSizes[bucket] || 5 * 1024 * 1024 // Default 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large (max ${Math.round(maxSize / (1024 * 1024))}MB for ${bucket})` 
      }, { status: 400 })
    }

    // 2. File type validation (whitelist approach)
    const allowedTypes: Record<string, string[]> = {
      'profile-images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'personal-documents': [
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      'prescription-images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      'user-uploads': [
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }
    
    const validTypes = allowedTypes[bucket] || []
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${validTypes.join(', ')}` 
      }, { status: 400 })
    }

    // 3. Filename security validation
    if (file.name.length > 255) {
      return NextResponse.json({ error: 'Filename too long (max 255 characters)' }, { status: 400 })
    }
    
    // Sanitize filename to prevent directory traversal
    const sanitizedName = file.name.replace(/[^\w\-_\.\(\)]/g, '_')
    
    // 4. Convert file to buffer for validation and upload
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // 5. Magic bytes validation for additional security
    if (file.type.startsWith('image/')) {
      const isValidImage = validateImageMagicBytes(buffer, file.type)
      if (!isValidImage) {
        return NextResponse.json({ 
          error: 'Invalid image file - content does not match declared type' 
        }, { status: 400 })
      }
    }

    // 6. Create secure, timestamped filename
    const timestamp = Date.now()
    const secureFileName = `${timestamp}_${sanitizedName}`

    // CRITICAL: Create user-specific path for complete isolation  
    const finalPath = path.includes('/') ? path : `${path}/${secureFileName}`
    const userPath = `${user.id}/${finalPath}`

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

    // 7. Audit logging for medical compliance
    console.log(`🔒 [MEDICAL_AUDIT] File upload: user=${user.id}, bucket=${bucket}, type=${file.type}, size=${file.size}, path=${data.path}`)

    return NextResponse.json({ 
      url: signedUrlData.signedUrl,  // Temporary signed URL (1 hour)
      path: data.path,               // STORE THIS in database
      fileName: file.name,           // Original filename for display
      secureFileName: secureFileName, // Actual stored filename
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
