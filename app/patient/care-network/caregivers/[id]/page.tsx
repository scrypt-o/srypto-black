import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import CaregiverDetailFeature from '@/components/features/patient/caregivers/CaregiverDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewCaregiverPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__carenet__caregivers')
    .select('*')
    .eq('caregiver_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <CaregiverDetailFeature caregiver={data} />
    </PageShell>
  )
}
