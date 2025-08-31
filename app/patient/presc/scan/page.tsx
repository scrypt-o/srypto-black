'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import CameraCaptureFeature from '@/components/features/prescriptions/CameraCaptureFeature'
import PrescriptionAnalysisFeature from '@/components/features/prescriptions/PrescriptionAnalysisFeature'
import PrescriptionResultsFeature from '@/components/features/prescriptions/PrescriptionResultsFeature'

type ScanStep = 'camera' | 'analyzing' | 'results' | 'error'

export default function PrescriptionScanPage() {
  const [currentStep, setCurrentStep] = useState<ScanStep>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageCaptured = (imageData: string) => {
    setCapturedImage(imageData)
    setCurrentStep('analyzing')
  }

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result)
    setCurrentStep('results')
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setError(null)
    setCurrentStep('camera')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setCurrentStep('error')
  }

  const handleSave = async () => {
    // handled inside PrescriptionResultsFeature now
  }

  const handleCancel = () => {
    window.location.href = '/patient/presc'
  }

  // Error state
  if (currentStep === 'error') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Scanning Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render current step
  switch (currentStep) {
    case 'camera':
      return (
        <CameraCaptureFeature
          onImageCaptured={handleImageCaptured}
          onError={handleError}
          onCancel={handleCancel}
        />
      )
    
    case 'analyzing':
      return capturedImage ? (
        <PrescriptionAnalysisFeature
          imageData={capturedImage}
          onAnalysisComplete={handleAnalysisComplete}
          onRetake={handleRetake}
          onError={handleError}
        />
      ) : null
    
    case 'results':
      return analysisResult ? (
        <PrescriptionResultsFeature
          analysisResult={analysisResult}
          onSave={handleSave}
          onRetake={handleRetake}
        />
      ) : null
    
    default:
      return null
  }
}
