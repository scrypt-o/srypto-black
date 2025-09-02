import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ImmunizationCreateFeature from '@/components/features/patient/medhist/ImmunizationCreateFeature'

export const dynamic = 'force-dynamic'

export default function NewImmunizationPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="New Immunization">
      <ImmunizationCreateFeature />
    </DetailPageLayout>
  )
}
