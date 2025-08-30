'use client'

import React, { useState } from 'react'
import { Loader2, Camera, AlertCircle } from 'lucide-react'

interface PrescriptionAnalysisFeatureProps {
  imageData: string
  onAnalysisComplete: (result: any) => void
  onRetake: () => void
  onError: (error: string) => void
}

export default function PrescriptionAnalysisFeature({
  imageData,
  onAnalysisComplete,
  onRetake,
  onError
}: PrescriptionAnalysisFeatureProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const analyzeImage = async () => {
    setIsAnalyzing(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/patient/prescriptions/analyze', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageData,
          fileName: `prescription_${Date.now()}.jpg`,
          fileType: 'image/jpeg'
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.reason || errorData.error || 'Analysis failed')
      }

      const result = await response.json()
      
      setTimeout(() => {
        onAnalysisComplete(result)
      }, 500) // Brief delay to show 100% completion

    } catch (error) {
      console.error('Analysis failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setIsAnalyzing(false)
      setProgress(0)
      onError(errorMessage)
    }
  }

  // Auto-start analysis when component mounts
  React.useEffect(() => {
    analyzeImage()
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-4 text-white">
        <h1 className="text-lg font-semibold">Analyzing Prescription</h1>
      </div>

      {/* Image Preview */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Captured Image */}
          <div className="relative mb-6">
            <img
              src={imageData}
              alt="Captured prescription"
              className="w-full h-auto rounded-lg border-2 border-white/20"
            />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
              {isAnalyzing && (
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Processing with AI...</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mb-6">
              <div className="flex justify-between text-white text-sm mb-2">
                <span>Analyzing prescription data</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={onRetake}
              disabled={isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg"
            >
              <Camera className="w-5 h-5" />
              Retake
            </button>
            
            {!isAnalyzing && (
              <button
                onClick={analyzeImage}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <AlertCircle className="w-5 h-5" />
                Retry Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}