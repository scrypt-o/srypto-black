 
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AllergyCreateFeature from '@/components/features/patient/allergies/AllergyCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewAllergyPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <AllergyCreateFeature />
    </DetailPageLayout>
  )
}
