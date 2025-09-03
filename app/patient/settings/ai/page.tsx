import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AISettingsDetailFeature from '@/components/features/settings/AISettingsDetailFeature'

export const dynamic = 'force-dynamic'

export default async function AISettingsPage() {
  const supabase = await getServerClient()
  
  // Get user's AI configuration for prescription analysis
  const { data, error } = await supabase
    .from('v_ai_setup')
    .select('*')
    .eq('ai_type', 'prescription_analysis')
    .eq('is_active', true)
    .single()

  return (
    <DetailPageLayout 
      sidebarItems={patientNavItems} 
      headerTitle="AI Settings"
    >
      <AISettingsDetailFeature 
        aiConfig={data} 
        error={error}
      />
    </DetailPageLayout>
  )
}
