import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import SurgeryDetailFeature from '@/components/features/patient/surgeries/SurgeryDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewSurgeryPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__medhist__surgeries')
    .select('*')
    .eq('surgery_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle={data.procedure_name || 'Surgery'}>
      <SurgeryDetailFeature surgery={data} />
    </DetailPageLayout>
  )
}
