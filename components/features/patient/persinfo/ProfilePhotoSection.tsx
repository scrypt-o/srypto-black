"use client"
import * as React from 'react'
import ProfilePictureUpload from '@/components/uploads/ProfilePictureUpload'
import ProfileImage from '@/components/features/patient/persinfo/ProfileImage'

export default function ProfilePhotoSection({ currentPath }: { currentPath?: string | null }) {
  return (
    <div className="flex items-center gap-4">
      <ProfileImage path={currentPath || undefined} size={96} />
      <ProfilePictureUpload
        currentImageUrl={undefined}
        onImageChange={async (result) => {
          if (!result) return
          try {
            await fetch('/api/patient/persinfo/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profile_picture_url: result.path })
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).location?.reload()
          } catch {}
        }}
      />
    </div>
  )
}

