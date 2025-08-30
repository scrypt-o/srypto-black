 
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import SurgeryCreateFeature from '@/components/features/patient/surgeries/SurgeryCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewSurgeryPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <SurgeryCreateFeature />
    </DetailPageLayout>
  )
}