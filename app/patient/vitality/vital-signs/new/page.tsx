import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import VitalSignCreateFeature from '@/components/features/patient/vitality/VitalSignCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewVitalSignPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <VitalSignCreateFeature />
    </DetailPageLayout>
  )
}