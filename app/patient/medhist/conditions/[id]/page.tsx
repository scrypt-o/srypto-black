import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ConditionDetailFeature from '@/components/features/patient/medhist/ConditionDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewConditionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__medhist__conditions')
    .select('*')
    .eq('condition_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle={data.condition_name || 'Condition'}>
      <ConditionDetailFeature condition={data} />
    </DetailPageLayout>
  )
}