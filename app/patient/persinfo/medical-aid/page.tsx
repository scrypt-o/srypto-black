import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import MedicalAidForm from '@/components/features/patient/persinfo/MedicalAidForm'

export const dynamic = 'force-dynamic'

export default async function MedicalAidPage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__medical_aid')
    .select('*')
    .single()

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Medical Aid">
      <div className="p-4 space-y-4">
        {error && <div className="text-red-600 mb-3">Failed to load medical aid</div>}
        <MedicalAidForm initial={data as any} />
      </div>
    </DetailPageLayout>
  )
}
