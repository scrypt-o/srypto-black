'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Image, User, Stethoscope, Pill, Calendar, FileText, AlertTriangle } from 'lucide-react'
import type { PrescriptionRow } from '@/config/prescriptionsListConfig'

interface PrescriptionDetailFeatureProps {
  prescription: PrescriptionRow
}

export default function PrescriptionDetailFeature({ prescription }: PrescriptionDetailFeatureProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  // Get secure image URL
  const imageUrl = prescription.image_url 
    ? `/api/files/prescriptions/${prescription.prescription_id}`
    : null

  const formatConfidence = (score: number | null): string => {
    if (!score) return 'Unknown'
    if (score >= 90) return `${score}% (Excellent)`
    if (score >= 75) return `${score}% (Good)`  
    if (score >= 60) return `${score}% (Fair)`
    return `${score}% (Low)`
  }

  const getConfidenceColor = (score: number | null): string => {
    if (!score) return 'text-gray-500'
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/patient/presc/active')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Prescriptions
        </button>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Scanned {new Date(prescription.created_at).toLocaleDateString()}
          </p>
          <p className={`text-sm font-medium ${getConfidenceColor(prescription.scan_quality_score)}`}>
            Confidence: {formatConfidence(prescription.scan_quality_score)}
          </p>
        </div>
      </div>

      {/* Original Prescription Image */}
      {imageUrl && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Original Prescription
          </h2>
          
          {!imageError ? (
            <div className="max-w-2xl mx-auto">
              <img
                src={imageUrl}
                alt="Original prescription scan"
                className="w-full h-auto rounded border shadow-sm"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Unable to load prescription image</p>
            </div>
          )}
        </div>
      )}

      {/* Patient Information */}
      {(prescription.patient_name || prescription.patient_surname) && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Patient Name</label>
              <p className="text-blue-900">
                {`${prescription.patient_name || ''} ${prescription.patient_surname || ''}`.trim() || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Information */}
      {(prescription.dr_name || (prescription as any).practice_number) && (
        <div className="bg-purple-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Prescribing Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescription.dr_name && (
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Doctor</label>
                <p className="text-purple-900">
                  {`${prescription.dr_name} ${prescription.dr_surname || ''}`.trim()}
                </p>
              </div>
            )}
            {(prescription as any).practice_number && (
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-1">Practice Number</label>
                <p className="text-purple-900">{(prescription as any).practice_number}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prescription Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Prescription Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescription.prescription_date && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Issue Date
              </label>
              <p className="text-gray-900">{prescription.prescription_date}</p>
            </div>
          )}
          {prescription.condition_diagnosed && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
              <p className="text-gray-900">{prescription.condition_diagnosed}</p>
            </div>
          )}
        </div>
      </div>

      {/* Medications */}
      {prescription.medications_prescribed && (
        <div className="bg-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Medications 
            {Array.isArray(prescription.medications_prescribed) && 
              ` (${prescription.medications_prescribed.length})`
            }
          </h2>
          
          {Array.isArray(prescription.medications_prescribed) ? (
            <div className="space-y-3">
              {prescription.medications_prescribed.map((med: any, index: number) => (
                <div key={index} className="bg-white rounded p-4 border border-green-200">
                  <div className="font-medium text-green-900">{med.name || 'Medication name not extracted'}</div>
                  <div className="text-sm text-green-700 mt-1 space-y-1">
                    {med.dosage && <div><span className="font-medium">Dosage:</span> {med.dosage}</div>}
                    {med.frequency && <div><span className="font-medium">Frequency:</span> {med.frequency}</div>}
                    {med.duration && <div><span className="font-medium">Duration:</span> {med.duration}</div>}
                    {med.instructions && <div><span className="font-medium">Instructions:</span> {med.instructions}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-green-700">
              <p>Medication data format: {typeof prescription.medications_prescribed}</p>
              <pre className="text-xs mt-2 bg-white p-2 rounded border">
                {JSON.stringify(prescription.medications_prescribed, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Information */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          AI Analysis Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block font-medium text-yellow-700 mb-1">Scan Quality</label>
            <p className={getConfidenceColor(prescription.scan_quality_score)}>
              {formatConfidence(prescription.scan_quality_score)}
            </p>
          </div>
          <div>
            <label className="block font-medium text-yellow-700 mb-1">Status</label>
            <p className="text-yellow-900">{prescription.status || 'Unknown'}</p>
          </div>
          <div>
            <label className="block font-medium text-yellow-700 mb-1">Processing</label>
            <p className="text-yellow-900">AI Extracted Data</p>
          </div>
        </div>
        
        {/* No Edit Warning */}
        <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Prescription data cannot be edited to prevent fraud. 
            If the information is incorrect, please scan the prescription again.
          </p>
        </div>
      </div>
    </div>
  )
}
