import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify document ownership and get storage path
  const { data: doc, error } = await supabase
    .from('v_patient__persinfo__documents')
    .select('document_id, file_url, user_id')
    .eq('document_id', params.id)
    .single()
  if (error || !doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (doc.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const path = doc.file_url
  const bucket = 'personal-documents'
  const { data: signed, error: urlError } = await supabase.storage.from(bucket).createSignedUrl(path, 900)
  if (urlError || !signed) return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
  return NextResponse.redirect(signed.signedUrl)
}

