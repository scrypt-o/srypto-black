'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X, Camera, RotateCcw, Zap, ZapOff } from 'lucide-react'

interface CameraCaptureFeatureProps {
  onImageCaptured: (imageData: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function CameraCaptureFeature({ 
  onImageCaptured, 
  onError, 
  onCancel 
}: CameraCaptureFeatureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isBackCamera, setIsBackCamera] = useState(true)
  const [hasFlash, setHasFlash] = useState(false)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  // Initialize camera on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported on this device')
      }

      // Request camera stream (back camera for document scanning)
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: isBackCamera ? 'environment' : 'user',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setHasPermission(true)

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      // Check if device has flash/torch capability
      const videoTrack = mediaStream.getVideoTracks()[0]
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.()
        setHasFlash(capabilities && 'torch' in capabilities)
      }

    } catch (error) {
      console.error('Camera initialization failed:', error)
      setHasPermission(false)
      
      if (error instanceof Error) {
        const errorMessage = error.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please enable camera access to scan prescriptions.'
          : error.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : error.name === 'NotReadableError'
          ? 'Camera is already in use by another application.'
          : 'Failed to access camera. Please try again.'
        
        setCameraError(errorMessage)
        onError(errorMessage)
      }
    }
  }, [isBackCamera, onError])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) throw new Error('Canvas context not available')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64 (high quality for AI analysis)
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      
      // Stop camera after capture
      stopCamera()
      
      // Pass image data to parent
      onImageCaptured(imageData)
      
    } catch (error) {
      console.error('Image capture failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to capture image'
      setCameraError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsCapturing(false)
    }
  }, [onImageCaptured, onError, stopCamera])

  const switchCamera = useCallback(() => {
    stopCamera()
    setIsBackCamera(!isBackCamera)
    // startCamera will be called via useEffect when isBackCamera changes
  }, [stopCamera, isBackCamera])

  const toggleFlash = useCallback(async () => {
    if (!stream || !hasFlash) return

    try {
      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) return
      
      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashOn } as any]
      })
      setIsFlashOn(!isFlashOn)
    } catch (error) {
      console.error('Flash toggle failed:', error)
    }
  }, [stream, hasFlash, isFlashOn])

  // Re-start camera when camera direction changes
  useEffect(() => {
    if (hasPermission !== null) {
      startCamera()
    }
  }, [isBackCamera, startCamera, hasPermission])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 text-white">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-white/10"
          aria-label="Cancel scanning"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg font-semibold">Scan Prescription</h1>
        
        <div className="flex items-center gap-2">
          {/* Flash Toggle */}
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className="p-2 rounded-lg hover:bg-white/10"
              aria-label={isFlashOn ? "Turn off flash" : "Turn on flash"}
            >
              {isFlashOn ? <ZapOff className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </button>
          )}
          
          {/* Camera Switch */}
          <button
            onClick={switchCamera}
            className="p-2 rounded-lg hover:bg-white/10"
            aria-label="Switch camera"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {hasPermission === false ? (
          <div className="flex items-center justify-center h-full text-white text-center p-8">
            <div>
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
              <p className="text-gray-300 mb-4">
                {cameraError || 'Please allow camera access to scan prescriptions'}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : hasPermission === null ? (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
              <p>Initializing camera...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video Stream */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Document Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white border-dashed rounded-lg w-80 h-60 md:w-96 md:h-72 flex items-center justify-center">
                <p className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                  Position prescription within frame
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Capture Controls */}
      {hasPermission && (
        <div className="p-6 flex justify-center">
          <button
            onClick={captureImage}
            disabled={isCapturing}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 shadow-lg"
            aria-label="Capture prescription"
          >
            <Camera className="w-8 h-8 text-gray-800" />
          </button>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}