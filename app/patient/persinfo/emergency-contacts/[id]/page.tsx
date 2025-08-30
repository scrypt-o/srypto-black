import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import EmergencyContactDetailFeature from '@/components/features/patient/emergency-contacts/EmergencyContactDetailFeature'

export const dynamic = 'force-dynamic'

export default async function ViewEmergencyContactPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__persinfo__emrg_contacts')
    .select('*')
    .eq('contact_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <EmergencyContactDetailFeature emergencyContact={data} />
    </PageShell>
  )
}
