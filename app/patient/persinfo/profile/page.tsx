import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import ProfileEditForm from '@/components/features/patient/persinfo/ProfileEditForm'
import ProfilePhotoSection from '@/components/features/patient/persinfo/ProfilePhotoSection'
import ProfileDetailFeature from '@/components/features/patient/persinfo/ProfileDetailFeature'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import type { ProfileRow } from '@/schemas/profile'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await getServerClient()
  
  // Get existing profile for current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  const { data: profile } = await supabase
    .from('v_patient__persinfo__profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Profile">
      <div className="space-y-6">
        <ProfilePhotoSection currentPath={profile?.profile_picture_url} />
        
        {/* Medical Aid Quick Access */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Medical Aid Information</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Manage your medical aid scheme and member details</p>
            </div>
            <Link 
              href="/patient/persinfo/medical-aid"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
            >
              Manage Medical Aid
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {profile
          // Use the standardized Detail feature when a row exists (renders Edit/View UX)
          ? <ProfileDetailFeature profile={profile as ProfileRow} />
          // Fallback: if no row yet, render the lightweight edit form to capture basics
          : <ProfileEditForm initial={{ first_name: '', last_name: '' }} />
        }
      </div>
    </DetailPageLayout>
  )
}
