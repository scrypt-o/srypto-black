'use client'

import { useState, useRef } from 'react'
import { Camera, User, Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useFileUpload, FileUploadResult } from '@/hooks/useFileUpload'
import { cn } from '@/lib/utils'

interface ProfilePictureUploadProps {
  currentImageUrl?: string
  currentImagePath?: string  // Store path in database, not URL
  onImageChange: (result: FileUploadResult | null) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32'
}

export default function ProfilePictureUpload({
  currentImageUrl,
  currentImagePath,
  onImageChange,
  className = '',
  size = 'lg'
}: ProfilePictureUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(currentImageUrl)
  const [showMenu, setShowMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, isUploading } = useFileUpload({
    bucket: 'profile-images',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    path: 'profile'
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file)
      setImageUrl(previewUrl)
      
      // Upload file
      const result = await uploadFile(file)
      
      if (result) {
        // Update with actual uploaded URL
        setImageUrl(result.url)
        onImageChange(result)
        
        // Clean up preview
        URL.revokeObjectURL(previewUrl)
      } else {
        // Revert on failure
        setImageUrl(currentImageUrl)
      }
    } catch (error) {
      console.error('Profile picture upload error:', error)
      setImageUrl(currentImageUrl)
    } finally {
      setShowMenu(false)
    }
  }

  const handleRemovePhoto = () => {
    setImageUrl(undefined)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowMenu(false)
  }

  const sizeClass = sizeClasses[size]

  return (
    <div className={cn('relative flex-shrink-0', sizeClass, className)}>
      {/* Profile Picture */}
      <button
        type="button"
        onClick={() => setShowMenu(true)}
        disabled={isUploading}
        className="relative group cursor-pointer"
      >
        <div className={cn(
          'rounded-full overflow-hidden bg-gray-100 ring-4 ring-gray-100 transition-all duration-200',
          'group-hover:ring-gray-200 relative',
          sizeClass,
          isUploading && 'opacity-75'
        )}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Profile"
              fill
              className="object-cover"
              unoptimized={true}
              onError={() => setImageUrl(undefined)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <User className={cn(
                'text-gray-400',
                size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
              )} />
            </div>
          )}
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className={cn(
              'text-white',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
            )} />
          )}
        </div>
        
        {/* Edit icon */}
        <div className={cn(
          'absolute bottom-0 right-0 bg-emerald-600 rounded-full flex items-center justify-center border-2 border-white shadow-md',
          size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
        )}>
          <Pencil className={cn(
            'text-white',
            size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {showMenu && !isUploading && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[180px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"
            >
              <Camera className="w-4 h-4" />
              Upload photo
            </button>
            
            {imageUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-red-600 border-t border-gray-100"
              >
                <Trash2 className="w-4 h-4" />
                Remove photo
              </button>
            )}
          </div>
        </>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}