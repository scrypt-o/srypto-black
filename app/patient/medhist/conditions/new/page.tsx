import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ConditionCreateFeature from '@/components/features/patient/medhist/ConditionCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewConditionPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="New Condition">
      <ConditionCreateFeature />
    </DetailPageLayout>
  )
}
