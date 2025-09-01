import { getServerClient } from '@/lib/supabase-server'
import PageShell from '@/components/layouts/PageShell'
import { patientNavItems } from '@/config/patientNav'
import ProfilePhotoSection from '@/components/features/patient/persinfo/ProfilePhotoSection'
import ProfileEditForm from '@/components/features/patient/persinfo/ProfileEditForm'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from('v_patient__persinfo__profile')
    .select('*')
    .single()

  return (
    <PageShell sidebarItems={patientNavItems} headerTitle="Profile">
      <div className="p-4 space-y-4">
        {error && <div className="text-red-600 mb-3">Failed to load profile</div>}
        <ProfilePhotoSection currentPath={(data as any)?.profile_picture_url} />

        {data ? (
          <div className="bg-white border rounded p-4 space-y-2 text-sm">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2">
                <div className="font-medium text-gray-600">{k}</div>
                <div className="col-span-2 text-gray-900 break-words">{String(v ?? '')}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600">No profile data.</div>
        )}

        {/* Edit form */}
        <ProfileEditForm initial={{
          first_name: (data as any)?.first_name,
          last_name: (data as any)?.last_name,
          title: (data as any)?.title,
          middle_name: (data as any)?.middle_name,
          nick_name: (data as any)?.nick_name,
          id_number: (data as any)?.id_number,
          passport_number: (data as any)?.passport_number,
          citizenship: (data as any)?.citizenship,
          date_of_birth: (data as any)?.date_of_birth,
          gender: (data as any)?.gender,
          marital_status: (data as any)?.marital_status,
          phone: (data as any)?.phone,
          email: (data as any)?.email,
          primary_language: (data as any)?.primary_language,
        }} />
      </div>
    </PageShell>
  )
}
