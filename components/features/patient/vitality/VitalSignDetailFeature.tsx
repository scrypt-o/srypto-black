'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, ArrowLeft } from 'lucide-react'
import type { VitalSignRow } from '@/schemas/vitalSigns'
import { useDeleteVitalSign } from '@/hooks/usePatientVitalSigns'
import { useToast } from '@/components/patterns/Toast'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'

export type VitalSignDetailFeatureProps = {
  vitalSign: VitalSignRow
}

export default function VitalSignDetailFeature({ vitalSign }: VitalSignDetailFeatureProps) {
  const router = useRouter()
  const toast = useToast()
  const deleteMutation = useDeleteVitalSign()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(vitalSign.vital_sign_id)
      toast?.push({ type: 'success', message: 'Vital sign reading deleted successfully' })
      router.push('/patient/vitality/vital-signs')
    } catch (error) {
      toast?.push({ type: 'error', message: 'Failed to delete vital sign reading' })
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified'
    return new Date(dateStr).toLocaleDateString()
  }

  const formatValue = (value: number | null, unit = '') => {
    if (value === null) return 'Not recorded'
    return `${value}${unit}`
  }

  return (
    <>
      {/* Clean sticky header */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Vital Sign Reading
          </h1>
          <div className="flex items-center justify-between w-full max-w-sm mx-auto">
            {/* Left: Back button */}
            <button
              onClick={() => router.push('/patient/vitality/vital-signs')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push(`/patient/vitality/vital-signs/${vitalSign.vital_sign_id}/edit`)}
                className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-5 h-5" />
                <span className="text-sm">Edit</span>
              </button>
              <button 
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-24 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Measurement Date</label>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(vitalSign.measurement_date)}</p>
              </div>
              {vitalSign.measurement_context && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Context</label>
                  <p className="text-gray-900 dark:text-gray-100">{vitalSign.measurement_context.replace('_', ' ')}</p>
                </div>
              )}
              {vitalSign.measurement_device && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Device Used</label>
                  <p className="text-gray-900 dark:text-gray-100">{vitalSign.measurement_device}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Measurements</h3>
            <div className="space-y-3">
              {(vitalSign.systolic_bp || vitalSign.diastolic_bp) && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Pressure</label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatValue(vitalSign.systolic_bp)}/{formatValue(vitalSign.diastolic_bp)} mmHg
                  </p>
                </div>
              )}
              {vitalSign.heart_rate && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Heart Rate</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatValue(vitalSign.heart_rate, ' bpm')}</p>
                </div>
              )}
              {vitalSign.temperature && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperature</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatValue(vitalSign.temperature, '°C')}</p>
                </div>
              )}
              {vitalSign.oxygen_saturation && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Oxygen Saturation</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatValue(vitalSign.oxygen_saturation, '%')}</p>
                </div>
              )}
              {vitalSign.respiratory_rate && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Respiratory Rate</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatValue(vitalSign.respiratory_rate, ' /min')}</p>
                </div>
              )}
              {vitalSign.blood_glucose && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Glucose</label>
                  <p className="text-gray-900 dark:text-gray-100">{formatValue(vitalSign.blood_glucose, ' mg/dL')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {vitalSign.notes && (
          <div>
            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Notes</h3>
            <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {vitalSign.notes}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Created: {formatDate(vitalSign.created_at)}</p>
          {vitalSign.updated_at && <p>Updated: {formatDate(vitalSign.updated_at)}</p>}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Vital Sign Reading"
        message="Are you sure you want to delete this vital sign reading? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        busy={deleteMutation.isPending}
      />
    </>
  )
}