import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/supabase-server'
import { patientNavItems } from '@/config/patientNav'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import PrescriptionDetailFeature from '@/components/features/prescriptions/PrescriptionDetailFeature'

export const dynamic = 'force-dynamic'

export default async function PrescriptionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const supabase = await getServerClient()

  // Fetch prescription data
  const { data, error } = await supabase
    .from('v_patient__presc__prescriptions')
    .select('*')
    .eq('prescription_id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  return (
    <DetailPageLayout 
      sidebarItems={patientNavItems} 
      headerTitle={`${data.patient_name || ''} ${data.patient_surname || ''}`.trim() || 'Prescription'}
    >
      <PrescriptionDetailFeature prescription={data} />
    </DetailPageLayout>
  )
}