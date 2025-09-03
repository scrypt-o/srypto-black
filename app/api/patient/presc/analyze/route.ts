import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { z } from 'zod'
import { verifyCsrf } from '@/lib/api-helpers'
import { ModernPrescriptionAIService } from '@/lib/services/prescription-ai.service'
// import { AICostControlService } from '@/lib/services/ai-cost-control.service'

// Input validation schema
const AnalyzeInputSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['image/jpeg', 'image/png']).default('image/jpeg')
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [PRESCRIPTION_ANALYZE] Starting prescription analysis...')
    
    // CSRF verification (current standard)
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    // Authentication check (current standard - no requireUser)
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate JSON body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const validatedInput = AnalyzeInputSchema.safeParse(body)
    if (!validatedInput.success) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: validatedInput.error 
      }, { status: 422 })
    }

    const { imageBase64, fileName, fileType } = validatedInput.data

    // Basic MIME and size checks (defense in depth, no rate limit)
    // Accept only data URLs that match declared fileType and <= ~6MB payload
    const dataUrlMatch = /^data:(image\/(?:jpeg|png));base64,(.+)$/i.exec(imageBase64)
    if (!dataUrlMatch) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 415 })
    }
    const mimeFromDataUrl = dataUrlMatch[1].toLowerCase()
    if (mimeFromDataUrl !== fileType.toLowerCase()) {
      return NextResponse.json({ error: 'MIME type mismatch' }, { status: 400 })
    }
    const b64Payload = dataUrlMatch[2]
    try {
      const raw = Buffer.from(b64Payload, 'base64')
      const maxBytes = 6 * 1024 * 1024 // 6MB
      if (raw.length > maxBytes) {
        return NextResponse.json({ error: 'Image too large (max 6MB)' }, { status: 413 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
    }

    // Removed usage limits blocking - let users scan prescriptions freely

    // Generate session ID for tracking
    const sessionId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Perform AI analysis
    const aiService = new ModernPrescriptionAIService()
    const analysisResult = await aiService.analyzePrescription({
      imageBase64,
      fileName,
      userId: user.id,
      sessionId
    })

    // Keep simple logging without blocking
    // TODO: Add basic logging if needed for admin monitoring

    if (!analysisResult.success) {
      return NextResponse.json({ 
        error: 'Analysis failed', 
        reason: analysisResult.error 
      }, { status: 500 })
    }

    // Return analysis results
    return NextResponse.json({
      success: true,
      isPrescription: analysisResult.isPrescription,
      data: analysisResult.data,
      sessionId: analysisResult.sessionId,
      uploadedPath: analysisResult.uploadedPath,
      cost: analysisResult.cost,
      processing_time: analysisResult.processingTime || 0,
      reason: analysisResult.reason
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [PRESCRIPTION_ANALYZE] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Prescription analysis failed'
    }, { status: 500 })
  }
}
