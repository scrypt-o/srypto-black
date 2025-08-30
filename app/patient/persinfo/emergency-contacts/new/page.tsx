import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import EmergencyContactCreateFeature from '@/components/features/patient/emergency-contacts/EmergencyContactCreateFeature'

export const dynamic = 'force-dynamic'

export default function NewEmergencyContactPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Scrypto">
      <EmergencyContactCreateFeature />
    </DetailPageLayout>
  )
}