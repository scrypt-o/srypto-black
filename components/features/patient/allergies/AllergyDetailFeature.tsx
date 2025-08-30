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
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: allergy.allergen || '',
      allergen_type: (allergy.allergen_type || '') as AllergyFormData['allergen_type'],
      severity: (allergy.severity || '') as AllergyFormData['severity'],
      reaction: allergy.reaction || '',
      first_observed: allergy.first_observed || '',
      trigger_factors: allergy.trigger_factors || '',
      emergency_action_plan: allergy.emergency_action_plan || '',
      notes: allergy.notes || '',
    }
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  const onSubmit = (data: AllergyFormData) => {
    const normalized = {
      allergen: data.allergen?.trim() || undefined,
      allergen_type: data.allergen_type || undefined,
      severity: data.severity || undefined,
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
      onError: () => toast?.push({ type: 'error', message: 'Failed to update allergy' })
    })
  }

  const handleDelete = () => setConfirmDelete(true)

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            {allergy.allergen || 'Allergy'}
          </h1>
          <div className="flex items-center justify-between w-full max-w-sm mx-auto">
            {/* Left: Layout toggle */}
            <button
              onClick={() => setLayoutStyle(layoutStyle === 'table' ? 'stacked' : 'table')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title={`Switch to ${layoutStyle === 'table' ? 'stacked' : 'table'} layout`}
            >
              {layoutStyle === 'table' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
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

      {/* Form content with layout options */}
      <div className="pb-24">
        <form onSubmit={handleSubmit(onSubmit)}>
          {layoutStyle === 'table' ? (
            // TABLE VIEW: Excel-like with justified columns
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Allergen<span className="text-red-500">*</span>:</label>
                <input
                  {...register('allergen')}
                  disabled={mode === 'view'}
                  placeholder="Enter allergen name"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Type<span className="text-red-500">*</span>:</label>
                <select
                  {...register('allergen_type')}
                  disabled={mode === 'view'}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select type</option>
                  {Object.values(AllergenTypeEnum.enum).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Severity<span className="text-red-500">*</span>:</label>
                <select
                  {...register('severity')}
                  disabled={mode === 'view'}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select severity</option>
                  {Object.values(SeverityEnum.enum).map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Reaction:</label>
                <textarea
                  {...register('reaction')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Describe symptoms"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">First Observed:</label>
                <input
                  {...register('first_observed')}
                  type="date"
                  disabled={mode === 'view'}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Triggers:</label>
                <textarea
                  {...register('trigger_factors')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="What triggers this"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Emergency:</label>
                <textarea
                  {...register('emergency_action_plan')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Action plan"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Notes:</label>
                <textarea
                  {...register('notes')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Additional notes"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
          ) : (
            // STACKED VIEW: Field name on top, field below, tooltip below
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Allergen <span className="text-red-500">*</span></label>
                <input
                  {...register('allergen')}
                  disabled={mode === 'view'}
                  placeholder="Enter allergen name"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">The substance causing the reaction</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Type <span className="text-red-500">*</span></label>
                <select
                  {...register('allergen_type')}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen_type ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select type</option>
                  {Object.values(AllergenTypeEnum.enum).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Category of allergen</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Severity <span className="text-red-500">*</span></label>
                <select
                  {...register('severity')}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 ${errors.severity ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select severity</option>
                  {Object.values(SeverityEnum.enum).map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Reaction severity level</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Reaction</label>
                <textarea
                  {...register('reaction')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Describe symptoms"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Physical symptoms experienced</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">First Observed</label>
                <input
                  {...register('first_observed')}
                  type="date"
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">When first noticed</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Trigger Factors</label>
                <textarea
                  {...register('trigger_factors')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="What triggers this"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Conditions that trigger reactions</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Emergency Plan</label>
                <textarea
                  {...register('emergency_action_plan')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Action plan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Steps for severe reactions</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  disabled={mode === 'view'}
                  rows={3}
                  placeholder="Additional notes"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Any additional notes</p>
              </div>
            </div>
          )}
        </form>
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
            onError: () => toast?.push({ type: 'error', message: 'Failed to delete allergy' })
          })
        }}
      />
    </>
  )
}