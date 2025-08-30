'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Check, X, LayoutGrid, List } from 'lucide-react'
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
  const [viewType, setViewType] = React.useState<'modern' | 'detailed'>('modern')
  const [apiError, setApiError] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: allergy.allergen || '',
      allergen_type: allergy.allergen_type || '',
      severity: allergy.severity || '',
      reaction: allergy.reaction || '',
      first_observed: allergy.first_observed || '',
      trigger_factors: allergy.trigger_factors || '',
      emergency_action_plan: allergy.emergency_action_plan || '',
      notes: allergy.notes || '',
    }
  })

  const { register, handleSubmit, reset } = form

  const onSubmit = (data: AllergyFormData) => {
    setApiError(null)
    const normalized = {
      allergen: data.allergen?.trim() || undefined,
      allergen_type: data.allergen_type?.trim() || undefined,
      severity: data.severity?.trim() || undefined,
      reaction: data.reaction?.trim() || undefined,
      first_observed: data.first_observed?.trim() || undefined,
      trigger_factors: data.trigger_factors?.trim() || undefined,
      emergency_action_plan: data.emergency_action_plan?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
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

  return (
    <>
      {/* Clean sticky header */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            {allergy.allergen || 'Allergy'}
          </h1>
          <div className="flex items-center justify-between w-full max-w-xs mx-auto">
            {/* Left: View toggle */}
            <button
              onClick={() => setViewType(viewType === 'modern' ? 'detailed' : 'modern')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title={`Switch to ${viewType === 'modern' ? 'detailed' : 'modern'} view`}
            >
              {viewType === 'modern' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {mode === 'view' ? (
                <button 
                  onClick={() => { setMode('edit'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                  <span className="text-sm">Edit</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleSubmit(onSubmit)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                    <span className="text-sm">Save</span>
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                    <span className="text-sm">Delete</span>
                  </button>
                  <button 
                    onClick={() => { setMode('view'); reset() }}
                    className="text-gray-600 hover:text-gray-800 text-sm px-2"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form content with proper spacing */}
      <div className="space-y-6 pb-24">
        {viewType === 'modern' ? (
          // Modern 2-column grid
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left column */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allergen *</label>
              <input
                {...register('allergen')}
                disabled={mode === 'view'}
                placeholder="Enter allergen name"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">The substance causing the reaction</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reaction</label>
              <textarea
                {...register('reaction')}
                disabled={mode === 'view'}
                rows={3}
                placeholder="Describe reaction symptoms"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">Physical symptoms experienced</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type *</label>
              <select
                {...register('allergen_type')}
                disabled={mode === 'view'}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              >
                <option value="">Select type</option>
                {Object.values(AllergenTypeEnum.enum).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Category of allergen</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Trigger Factors</label>
              <textarea
                {...register('trigger_factors')}
                disabled={mode === 'view'}
                rows={3}
                placeholder="What triggers this allergy"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">Conditions that trigger reactions</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity *</label>
              <select
                {...register('severity')}
                disabled={mode === 'view'}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              >
                <option value="">Select severity</option>
                {Object.values(SeverityEnum.enum).map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Reaction severity level</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Plan</label>
              <textarea
                {...register('emergency_action_plan')}
                disabled={mode === 'view'}
                rows={3}
                placeholder="Emergency action plan"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">Steps for severe reactions</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Observed</label>
              <input
                {...register('first_observed')}
                type="date"
                disabled={mode === 'view'}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">When first noticed</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <textarea
                {...register('notes')}
                disabled={mode === 'view'}
                rows={3}
                placeholder="Additional notes"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
              />
              <p className="text-xs text-gray-500 mt-1">Any additional notes</p>
            </div>
          </div>
        </form>
        ) : (
          // Detailed sectioned view
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-900 dark:border-white/10">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allergen</p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                    {allergy.allergen || '-'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                      {allergy.allergen_type || '-'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Severity</p>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                      {allergy.severity || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 dark:bg-gray-900 dark:border-white/10">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Information</h2>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reaction</p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                    {allergy.reaction || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trigger Factors</p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                    {allergy.trigger_factors || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Emergency Action Plan</p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                    {allergy.emergency_action_plan || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800 dark:border-white/10">
                    {allergy.notes || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
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
            onError: () => setApiError('Failed to delete allergy')
          })
        }}
      />
    </>
  )
}