 
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import SurgeryCreateFeature from '@/components/features/patient/surgeries/SurgeryCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewSurgeryPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Scrypto">
      <SurgeryCreateFeature />
    </PageShell>
  )
}
