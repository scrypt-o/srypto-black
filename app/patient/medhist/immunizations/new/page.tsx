import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import ImmunizationCreateFeature from '@/components/features/patient/medhist/ImmunizationCreateFeature'

export const dynamic = 'force-dynamic'

export default function NewImmunizationPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <ImmunizationCreateFeature />
    </PageShell>
  )
}
