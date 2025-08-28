import { notFound } from 'next/navigation'
import { requireUser, getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AllergyDetailFeature from '@/components/features/patient/allergies/AllergyDetailFeature'
export const dynamic = 'force-dynamic'

export default async function ViewAllergyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const supabase = await getServerClient()
  const { id } = await params

  const { data, error } = await supabase
    .from('v_patient__medhist__allergies')
    .select('*')
    .eq('allergy_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle={data.allergen || 'Allergy'}>
      <AllergyDetailFeature allergy={data} />
    </DetailPageLayout>
  )
}
