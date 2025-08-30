 
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import FamilyHistoryCreateFeature from '@/components/features/patient/family-history/FamilyHistoryCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewFamilyHistoryPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <FamilyHistoryCreateFeature />
    </DetailPageLayout>
  )
}