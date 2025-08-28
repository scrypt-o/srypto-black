'use client'

import { useState, useCallback } from 'react'

export interface FileUploadConfig {
  bucket: 'personal-documents' | 'profile-images' | 'prescription-images' | 'user-uploads'
  maxSize?: number // in bytes
  allowedTypes?: string[]
  path?: string // custom path within user folder
  onProgress?: (progress: number) => void
}

export interface FileUploadResult {
  url: string           // Signed URL (temporary, 1 hour)
  path: string         // Storage path (store this in database)
  fileName: string     // Original filename
  fileSize: number     // File size in bytes
  fileType: string     // MIME type
}

// Secure defaults based on medical requirements
const DEFAULT_CONFIGS: Record<string, Partial<FileUploadConfig>> = {
  'personal-documents': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  },
  'profile-images': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  'prescription-images': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  },
  'user-uploads': {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  }
}

export function useFileUpload(config: FileUploadConfig) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Merge config with secure defaults
  const bucketDefaults = DEFAULT_CONFIGS[config.bucket] || {}
  const finalConfig = { ...bucketDefaults, ...config }

  const validateFile = useCallback((file: File): string | null => {
    // File type validation
    if (!finalConfig.allowedTypes?.includes(file.type)) {
      const allowedTypesStr = finalConfig.allowedTypes?.map(type => {
        if (type.startsWith('image/')) return type.replace('image/', '').toUpperCase()
        if (type === 'application/pdf') return 'PDF'
        if (type.includes('word')) return 'DOC/DOCX'
        return type
      }).join(', ')
      return `Invalid file type. Allowed: ${allowedTypesStr}`
    }

    // File size validation
    if (finalConfig.maxSize && file.size > finalConfig.maxSize) {
      const maxSizeMB = Math.round(finalConfig.maxSize / (1024 * 1024))
      return `File too large (max ${maxSizeMB}MB)`
    }

    // Additional security checks
    if (file.name.length > 255) {
      return 'Filename too long (max 255 characters)'
    }

    return null
  }, [finalConfig])

  const uploadFile = useCallback(async (file: File): Promise<FileUploadResult | null> => {
    const validationError = validateFile(file)
    if (validationError) {
      // File validation error
      return null
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', config.bucket)
      
      // Create timestamped, sanitized filename
      const timestamp = new Date().getTime()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = config.path 
        ? `${config.path}/${timestamp}_${sanitizedFileName}`
        : `${timestamp}_${sanitizedFileName}`
      
      formData.append('path', filePath)

      // Upload with progress tracking
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Upload successful

      return {
        url: result.url,      // Temporary signed URL
        path: result.path,    // Store this in database
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      // Upload error
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [config, validateFile])

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent): FileList => {
    e.preventDefault()
    setDragActive(false)
    return e.dataTransfer.files
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  return {
    dragActive,
    isUploading,
    uploadProgress,
    uploadFile,
    validateFile,
    handleDrop,
    handleDragOver,
    handleDragLeave
  }
}