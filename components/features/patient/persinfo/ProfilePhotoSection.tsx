"use client"
import * as React from 'react'
import ProfilePictureUpload from '@/components/uploads/ProfilePictureUpload'
import ProfileImage from '@/components/features/patient/persinfo/ProfileImage'

export default function ProfilePhotoSection({ currentPath }: { currentPath?: string | null }) {
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <div className="flex items-center gap-4">
      <ProfileImage path={currentPath ?? null} size={96} />
      <div className="space-y-2">
        <ProfilePictureUpload
          onImageChange={async (result) => {
            if (!result) return
            setUploading(true)
            setError(null)
            try {
              const response = await fetch('/api/patient/persinfo/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_picture_url: result.path })
              })
              
              if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to save profile picture')
              }
              
              // Success - reload to show new image
              window.location?.reload()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Upload failed')
              console.error('Profile picture save failed:', err)
            } finally {
              setUploading(false)
            }
          }}
        />
        {uploading && <p className="text-sm text-blue-600">Saving profile picture...</p>}
        {error && <p className="text-sm text-red-600">Error: {error}</p>}
      </div>
    </div>
  )
}
