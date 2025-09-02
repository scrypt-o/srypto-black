import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import DetailViewLayout, { type DetailViewLayoutProps } from '@/components/layouts/DetailViewLayout'
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

  // If no profile row exists for this user yet, create a minimal one so the page always works
  if (!data) {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData?.user?.id
    if (uid) {
      // best-effort upsert (ignore errors silently to avoid breaking SSR render)
      await supabase
        .from('patient__persinfo__profile')
        .upsert({ user_id: uid, first_name: (userData.user.user_metadata as any)?.given_name || '', last_name: (userData.user.user_metadata as any)?.family_name || '' }, { onConflict: 'user_id' })
        .select('*')
        .single()
      // Re-read from view
      const reread = await supabase
        .from('v_patient__persinfo__profile')
        .select('*')
        .single()
      ;(reread.error) ? null : (Object.assign((data as any ?? {}), reread.data))
    }
  }

  const formId = 'profile-edit-form'
  const sections: DetailViewLayoutProps['sections'] = [
    {
      id: 'profile-header',
      content: (
        <div className="flex items-center gap-4">
          <ProfilePhotoSection currentPath={(data as any)?.profile_picture_url} />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {((data as any)?.first_name || (data as any)?.last_name)
                ? `${(data as any)?.first_name ?? ''} ${(data as any)?.last_name ?? ''}`.trim()
                : 'Your Profile'}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              {(data as any)?.email || 'Keep your personal information up to date.'}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'details',
      title: 'Profile details',
      content: data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {([
            ['title', 'Title'],
            ['first_name', 'First name'],
            ['middle_name', 'Middle name'],
            ['last_name', 'Last name'],
            ['nick_name', 'Nickname'],
            ['id_number', 'ID number'],
            ['passport_number', 'Passport number'],
            ['citizenship', 'Citizenship'],
            ['date_of_birth', 'Date of birth'],
            ['gender', 'Gender'],
            ['marital_status', 'Marital status'],
            ['phone', 'Phone'],
            ['email', 'Email'],
            ['primary_language', 'Primary language'],
          ] as const).map(([key, label]) => (
            <div key={key} className="grid grid-cols-3 gap-3">
              <div className="col-span-1 text-gray-500">{label}</div>
              <div className="col-span-2 font-medium text-gray-900 break-words">
                {String(((data as any)?.[key] ?? '') || '—')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-600">No profile data yet. Use the form below to add your details.</div>
      )
    },
    {
      id: 'edit',
      title: 'Edit profile',
      content: (
        <ProfileEditForm
          formId={formId}
          initial={{
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
          }}
        />
      )
    }
  ]

  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Profile"
      detailProps={{
        title: 'Profile',
        mode: 'edit',
        formId,
        sections,
        stickyActions: true,
        secondaryActionLabel: 'Cancel',
        // onCancel removed - cannot pass functions from server to client components
      }}
    />
  )
}
