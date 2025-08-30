import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ConditionCreateFeature from '@/components/features/patient/medhist/ConditionCreateFeature'
export const dynamic = 'force-dynamic'

export default async function NewConditionPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="New Condition">
      <ConditionCreateFeature />
    </DetailPageLayout>
  )
}