import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import CaregiverCreateFeature from '@/components/features/patient/caregivers/CaregiverCreateFeature'
export const dynamic = 'force-dynamic'

export default function NewCaregiverPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="New Caregiver">
      <CaregiverCreateFeature />
    </DetailPageLayout>
  )
}
