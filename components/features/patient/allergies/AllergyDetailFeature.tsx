'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Check, X } from 'lucide-react'
import type { AllergyRow, AllergyFormData } from '@/schemas/allergies'
import { allergyFormSchema, AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateAllergy, useDeleteAllergy } from '@/hooks/usePatientAllergies'
import { useToast } from '@/components/patterns/Toast'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'

export type AllergyDetailFeatureProps = {
  allergy: AllergyRow
}

export default function AllergyDetailFeature({ allergy }: AllergyDetailFeatureProps) {
  const router = useRouter()
  const toast = useToast()
  const updateMutation = useUpdateAllergy()
  const deleteMutation = useDeleteAllergy()
  const [mode, setMode] = React.useState<'view' | 'edit'>('view')
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: allergy.allergen || '',
      allergen_type: (allergy.allergen_type || 'other') as unknown as AllergyFormData['allergen_type'],
      severity: (allergy.severity || 'moderate') as unknown as AllergyFormData['severity'],
      reaction: allergy.reaction || '',
      first_observed: allergy.first_observed || '',
      trigger_factors: allergy.trigger_factors || '',
      emergency_action_plan: allergy.emergency_action_plan || '',
      notes: allergy.notes || '',
    }
  })
  const { handleSubmit, register, reset } = form

  const onSubmit = (data: AllergyFormData) => {
    setApiError(null)
    const normalized = {
      ...data,
      reaction: data.reaction || undefined,
      first_observed: data.first_observed || undefined,
      trigger_factors: data.trigger_factors || undefined,
      emergency_action_plan: data.emergency_action_plan || undefined,
      notes: data.notes || undefined,
    }
    void updateMutation.mutate({ id: allergy.allergy_id, data: normalized }, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Allergy updated successfully' })
        setMode('view')
        router.refresh()
      },
      onError: () => setApiError('Failed to update allergy')
    })
  }

  const handleDelete = () => setConfirmDelete(true)

  const sections = mode === 'view' ? [
    {
      id: 'basic',
      title: 'Basic Information',
      content: (
        <div className="grid gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allergen</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium dark:bg-gray-900 dark:border-white/10">{allergy.allergen || '-'}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
              <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium dark:bg-gray-900 dark:border-white/10">{allergy.allergen_type || '-'}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Severity</p>
              <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium dark:bg-gray-900 dark:border-white/10">{allergy.severity || '-'}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'details',
      title: 'Reaction Details',
      content: (
        <div className="grid gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reaction</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm dark:bg-gray-900 dark:border-white/10">{allergy.reaction || '-'}</div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">First Observed</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm dark:bg-gray-900 dark:border-white/10">{formatDate(allergy.first_observed)}</div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trigger Factors</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm dark:bg-gray-900 dark:border-white/10">{allergy.trigger_factors || '-'}</div>
          </div>
        </div>
      )
    },
    {
      id: 'emergency',
      title: 'Emergency Information',
      content: (
        <div className="grid gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emergency Action Plan</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm dark:bg-gray-900 dark:border-white/10">{allergy.emergency_action_plan || '-'}</div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Additional Notes</p>
            <div className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm dark:bg-gray-900 dark:border-white/10">{allergy.notes || '-'}</div>
          </div>
        </div>
      )
    }
  ] : [
    {
      id: 'form',
      title: 'Edit Allergy',
      content: (
        <div className="grid gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Allergen *</span>
            <input {...register('allergen')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">Type *</span>
              <select {...register('allergen_type')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10">
                {Object.values(AllergenTypeEnum.enum).map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">Severity *</span>
              <select {...register('severity')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10">
                {Object.values(SeverityEnum.enum).map(severity => (
                  <option key={severity} value={severity}>{severity.replace('_',' ').replace(/^./, s=>s.toUpperCase())}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Reaction</span>
            <input {...register('reaction')} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">First Observed</span>
            <input {...register('first_observed')} type="date" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Trigger Factors</span>
            <textarea {...register('trigger_factors')} rows={3} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Emergency Action Plan</span>
            <textarea {...register('emergency_action_plan')} rows={3} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Notes</span>
            <textarea {...register('notes')} rows={3} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
        </div>
      )
    }
  ]

  return (
    <>
      {/* Sticky header with item name and actions */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-gray-900/80 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {allergy.allergen || 'Allergy'}
          </h1>
          <div className="flex items-center gap-3">
            {mode === 'view' ? (
              <>
                <button 
                  onClick={() => { setMode('edit'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateMutation.isPending}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { setMode('view'); reset() }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Allergen *
                </label>
                <input
                  {...register('allergen')}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 dark:disabled:bg-gray-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type *
                  </label>
                  <select
                    {...register('allergen_type')}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 dark:disabled:bg-gray-800"
                  >
                    <option value="">Select type</option>
                    {Object.values(AllergenTypeEnum.enum).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity *
                  </label>
                  <select
                    {...register('severity')}
                    disabled={mode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 dark:disabled:bg-gray-800"
                  >
                    <option value="">Select severity</option>
                    {Object.values(SeverityEnum.enum).map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional fields */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reaction
                </label>
                <textarea
                  {...register('reaction')}
                  disabled={mode === 'view'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  disabled={mode === 'view'}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this allergy?"
        message="This moves the record to the recycle bin."
        variant="danger"
        busy={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteMutation.mutate(allergy.allergy_id, {
            onSuccess: () => {
              setConfirmDelete(false)
              toast?.push({ type: 'success', message: 'Allergy deleted successfully' })
              router.push('/patient/medhist/allergies')
            },
            onError: () => toast?.push({ type: 'error', message: 'Failed to delete allergy' })
          })
        }}
        confirmLabel="Delete"
      />
    </>
  )
}
