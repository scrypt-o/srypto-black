import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ImmunizationDetailFeature from '@/components/features/patient/medhist/ImmunizationDetailFeature'

export const dynamic = 'force-dynamic'

export default async function ViewImmunizationPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__medhist__immunizations')
    .select('*')
    .eq('immunization_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle={data.vaccine_name || 'Immunization'}>
      <ImmunizationDetailFeature immunization={data} />
    </DetailPageLayout>
  )
}
