import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import VitalSignDetailFeature from '@/components/features/patient/vitality/VitalSignDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewVitalSignPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__vitality__vital_signs')
    .select('*')
    .eq('vital_sign_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <VitalSignDetailFeature vitalSign={data} />
    </DetailPageLayout>
  )
}