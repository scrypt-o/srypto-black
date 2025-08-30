import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import CaregiverCreateFeature from '@/components/features/patient/caregivers/CaregiverCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewCaregiverPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <CaregiverCreateFeature />
    </PageShell>
  )
}
