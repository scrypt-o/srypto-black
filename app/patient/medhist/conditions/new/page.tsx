import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import ConditionCreateFeature from '@/components/features/patient/medhist/ConditionCreateFeature'
export const dynamic = 'force-dynamic'

export default async function NewConditionPage() {
  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="New Condition">
      <ConditionCreateFeature />
    </PageShell>
  )
}
