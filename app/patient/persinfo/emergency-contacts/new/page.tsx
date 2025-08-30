import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import EmergencyContactCreateFeature from '@/components/features/patient/emergency-contacts/EmergencyContactCreateFeature'

export const dynamic = 'force-dynamic'

export default function NewEmergencyContactPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <EmergencyContactCreateFeature />
    </PageShell>
  )
}
