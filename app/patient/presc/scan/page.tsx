import PrescScanPageLayout from '@/components/layouts/PrescScanPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ScanOrchestrator from '@/components/features/prescriptions/ScanOrchestrator'

export const dynamic = 'force-dynamic'

export default function PrescriptionScanPage() {
  return (
    <PrescScanPageLayout sidebarItems={patientNavItems} headerTitle="Scan Prescription">
      <ScanOrchestrator />
    </PrescScanPageLayout>
  )
}
