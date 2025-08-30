import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import FamilyHistoryDetailFeature from '@/components/features/patient/family-history/FamilyHistoryDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewFamilyHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__medhist__family_hist')
    .select('*')
    .eq('family_history_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <FamilyHistoryDetailFeature familyHistory={data} />
    </DetailPageLayout>
  )
}