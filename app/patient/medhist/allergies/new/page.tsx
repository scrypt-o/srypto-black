import { requireUser } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import NewAllergyIsland from '@/components/features/patient/allergies/NewAllergyIsland'
export const dynamic = 'force-dynamic'

export default async function NewAllergyPage() {
  await requireUser()
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Add New Allergy">
      <NewAllergyIsland />
    </DetailPageLayout>
  )
}

