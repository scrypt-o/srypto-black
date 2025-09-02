import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import DependentDetailFeature from '@/components/features/patient/persinfo/DependentDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewDependentPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__persinfo__dependents')
    .select('*')
    .eq('dependent_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Dependent">
      <DependentDetailFeature dependent={data} />
    </DetailPageLayout>
  )
}
