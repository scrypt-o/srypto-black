import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { verifyCsrf } from '@/lib/api-helpers'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = verifyCsrf(request); if (csrf) return csrf
  const supabase = await getServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('patient__persinfo__documents')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('document_id', params.id)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

