 
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import DependentCreateFeature from '@/components/features/patient/persinfo/DependentCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewDependentPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <DependentCreateFeature />
    </PageShell>
  )
}
