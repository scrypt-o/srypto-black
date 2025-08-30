'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Camera, User, Stethoscope, Pill, Calendar, AlertTriangle, Loader2 } from 'lucide-react'

interface PrescriptionResultsFeatureProps {
  analysisResult: any
  onSave: () => void
  onRetake: () => void
}

export default function PrescriptionResultsFeature({
  analysisResult,
  onSave,
  onRetake
}: PrescriptionResultsFeatureProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave()
      // Navigate to prescriptions list after save
      router.push('/patient/prescriptions')
    } catch (error) {
      console.error('Save failed:', error)
      setIsSaving(false)
    }
  }

  if (!analysisResult.isPrescription) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-4">
          <h1 className="text-lg font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Not a Prescription
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Could not identify prescription
            </h2>
            <p className="text-gray-600 mb-6">
              {analysisResult.reason || 'The image does not appear to be a medical prescription. Please try again with a clear photo of a prescription.'}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={onRetake}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Camera className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => router.push('/patient/prescriptions')}
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

  const { data } = analysisResult

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 p-4">
        <h1 className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Prescription Analyzed Successfully
        </h1>
        <p className="text-sm text-green-600 mt-1">
          Confidence: {data.overallConfidence}% • Quality: {data.scanQuality}%
        </p>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Patient Information */}
          {(data.patientName || data.patientSurname) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                <User className="w-5 h-5" />
                Patient Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {data.patientName && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">First Name</label>
                    <p className="text-blue-900">{data.patientName}</p>
                  </div>
                )}
                {data.patientSurname && (
                  <div>
                    <label className="text-sm font-medium text-blue-700">Last Name</label>
                    <p className="text-blue-900">{data.patientSurname}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Information */}
          {(data.doctorName || data.practiceNumber) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 flex items-center gap-2 mb-3">
                <Stethoscope className="w-5 h-5" />
                Prescribing Doctor
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {data.doctorName && (
                  <div>
                    <label className="text-sm font-medium text-purple-700">Doctor</label>
                    <p className="text-purple-900">{data.doctorName} {data.doctorSurname || ''}</p>
                  </div>
                )}
                {data.practiceNumber && (
                  <div>
                    <label className="text-sm font-medium text-purple-700">Practice Number</label>
                    <p className="text-purple-900">{data.practiceNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Prescription Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {data.issueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Issue Date
                  </label>
                  <p className="text-gray-900">{data.issueDate}</p>
                </div>
              )}
              {data.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Diagnosis</label>
                  <p className="text-gray-900">{data.diagnosis}</p>
                </div>
              )}
            </div>
          </div>

          {/* Medications */}
          {data.medications && data.medications.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5" />
                Medications ({data.medications.length})
              </h3>
              <div className="space-y-3">
                {data.medications.map((med: any, index: number) => (
                  <div key={index} className="bg-white rounded p-3 border border-green-200">
                    <div className="font-medium text-green-900">{med.name}</div>
                    <div className="text-sm text-green-700 mt-1">
                      <span className="font-medium">Dosage:</span> {med.dosage} • 
                      <span className="font-medium">Frequency:</span> {med.frequency}
                      {med.duration && (
                        <>
                          {' • '}
                          <span className="font-medium">Duration:</span> {med.duration}
                        </>
                      )}
                    </div>
                    {med.instructions && (
                      <div className="text-sm text-green-600 mt-1">
                        <span className="font-medium">Instructions:</span> {med.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Warnings */}
          {data.aiWarnings && data.aiWarnings.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" />
                AI Analysis Warnings
              </h3>
              <ul className="space-y-1">
                {data.aiWarnings.map((warning: string, index: number) => (
                  <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onRetake}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 rounded-lg"
          >
            <Camera className="w-5 h-5" />
            Retake Photo
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Prescription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}