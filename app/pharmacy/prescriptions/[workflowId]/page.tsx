import PharmacyValidationWorkstation from '@/components/features/pharmacy/PharmacyValidationWorkstation'
import { getServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ workflowId: string }>
}

export default async function PharmacyValidationPage({ params }: PageProps) {
  const { workflowId } = await params
  const supabase = await getServerClient()

  // In real implementation, fetch from pharmacy__workflow__prescriptions view
  // For now, mock data will be used in the component
  
  // const { data: workflowData } = await supabase
  //   .from('v_pharmacy__workflow__prescriptions')
  //   .select('*')
  //   .eq('workflow_id', workflowId)
  //   .single()

  // if (!workflowData) {
  //   notFound()
  // }

  return <PharmacyValidationWorkstation workflowId={workflowId} />
}