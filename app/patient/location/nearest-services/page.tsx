import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import LocationServicesFeature from '@/components/features/location/LocationServicesFeature'

export const dynamic = 'force-dynamic'

export default async function NearestServicesPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Location">
      <div className="h-[calc(100vh-12rem)]">
        <LocationServicesFeature />
      </div>
    </DetailPageLayout>
  )
}
