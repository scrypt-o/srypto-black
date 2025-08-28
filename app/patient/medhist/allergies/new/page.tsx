import { requireUser } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AllergyCreateFeature from '@/components/features/patient/allergies/AllergyCreateFeature'
export const dynamic = 'force-dynamic'

export default async function NewAllergyPage() {
  await requireUser()
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Add New Allergy">
      <AllergyCreateFeature />
    </DetailPageLayout>
  )
}
