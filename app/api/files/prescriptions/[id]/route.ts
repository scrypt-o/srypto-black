import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Authentication check
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get prescription record to verify ownership
    const { data: prescription, error: prescriptionError } = await supabase
      .from('v_patient__presc__prescriptions')
      .select('prescription_id, image_url, user_id')
      .eq('prescription_id', id)
      .single()

    if (prescriptionError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    // Verify user owns this prescription
    if (prescription.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if image exists
    if (!prescription.image_url) {
      return NextResponse.json({ error: 'No image available' }, { status: 404 })
    }

    // Get signed URL for prescription image
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('prescription-images')
      .createSignedUrl(prescription.image_url, 3600) // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Failed to create signed URL:', urlError)
      return NextResponse.json({ error: 'Image access failed' }, { status: 500 })
    }

    // Return redirect to signed URL (secure access)
    return NextResponse.redirect(signedUrlData.signedUrl)

  } catch (error) {
    console.error('Error serving prescription image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}