 
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import DependentCreateFeature from '@/components/features/patient/persinfo/DependentCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewDependentPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <DependentCreateFeature />
    </DetailPageLayout>
  )
}