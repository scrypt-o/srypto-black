'use client'

import React, { useRef, useEffect, useState } from 'react'

interface CameraCaptureTemplateProps {
  onCapture: (imageData: string) => void
  onFileUpload: (file: File) => void
  onCancel: () => void
  capturedImage?: string | null
  isLoading?: boolean
  loadingMessage?: string
  onRetake?: () => void
  onSubmitForProcessing?: () => void
  className?: string
}

export function CameraCaptureTemplate({
  onCapture,
  onFileUpload,
  onCancel,
  capturedImage,
  isLoading = false,
  loadingMessage,
  onRetake,
  onSubmitForProcessing,
  className = ''
}: CameraCaptureTemplateProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize camera
  useEffect(() => {
    if (capturedImage || isLoading) return // Don't start camera if we have image or are loading
    
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Rear camera preferred
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        
        setStream(mediaStream)
        setHasPermission(true)
        setError(null)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.warn('Camera access failed:', error)
        setHasPermission(false)
        setError('Camera access denied. Please use file upload instead.')
      }
    }

    initCamera()

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [capturedImage, isLoading, stream])

  // Stop camera when image is captured
  useEffect(() => {
    if (capturedImage && stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [capturedImage, stream])

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    onCapture(imageData)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setError(null)
      onFileUpload(file)
    }
  }

  const handleRetake = () => {
    setError(null)
    onRetake?.()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[600px] bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">{loadingMessage || 'Processing...'}</p>
      </div>
    )
  }

  // Show captured image preview
  if (capturedImage) {
    return (
      <div className={`flex flex-col items-center space-y-4 bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
        
        <div className="relative max-w-md w-full">
          <img 
            src={capturedImage} 
            alt="Captured prescription" 
            className="w-full rounded-lg border-2 border-gray-200"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRetake}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retake
          </button>
          <button
            onClick={onSubmitForProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Submit for Processing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">Scan Prescription</h2>
        <p className="text-blue-100 mt-1">Take a photo or upload an image of your prescription</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Camera view or fallback */}
        {hasPermission === true ? (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-96 object-cover"
              />
              
              {/* Document guide overlay */}
              <div className="absolute inset-4 border-2 border-white border-dashed opacity-60 rounded-lg pointer-events-none">
                <div className="absolute top-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  Align prescription within this frame
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleCapture}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                📷 Capture
              </button>
            </div>
          </div>
        ) : (
          // File upload fallback
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-6xl">📄</div>
                <div>
                  <p className="text-lg font-medium text-gray-700">Upload Prescription Image</p>
                  <p className="text-gray-500 mt-1">JPEG or PNG format, max 10MB</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>
          
          {hasPermission === false && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retry Camera
            </button>
          )}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}