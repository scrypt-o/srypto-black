'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import type { AllergyRow, AllergyFormData } from '@/schemas/allergies'
import { allergyFormSchema, AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateAllergy, useDeleteAllergy } from '@/hooks/usePatientAllergies'
import { useToast } from '@/components/patterns/Toast'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'
import { formatDate } from '@/lib/utils/date'

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
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Allergen</p>
            <p className="text-sm font-medium">{allergy.allergen || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm font-medium">{allergy.allergen_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Severity</p>
              <p className="text-sm font-medium">{allergy.severity || '-'}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'details',
      title: 'Reaction Details',
      content: (
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reaction</p>
            <p className="text-sm">{allergy.reaction || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">First Observed</p>
            <p className="text-sm">{formatDate(allergy.first_observed)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Trigger Factors</p>
            <p className="text-sm">{allergy.trigger_factors || '-'}</p>
          </div>
        </div>
      )
    },
    {
      id: 'emergency',
      title: 'Emergency Information',
      content: (
        <div className="grid gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Action Plan</p>
            <p className="text-sm">{allergy.emergency_action_plan || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Additional Notes</p>
            <p className="text-sm">{allergy.notes || '-'}</p>
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
      <DetailViewLayout
        title={allergy.allergen || 'Allergy'}
        subtitle={mode === 'edit' ? 'Update allergy information' : 'View allergy details'}
        mode={mode === 'edit' ? 'edit' : 'view'}
        formId="allergy-form"
        loading={updateMutation.isPending || deleteMutation.isPending}
        {...(apiError ? { errors: [{ field: 'api', message: apiError }] } : {})}
        sections={sections}
        stickyActions
        onBack={() => router.push('/patient/medhist/allergies')}
        onCancel={() => { setMode('view'); reset() }}
        {...(mode === 'view' ? { onSaveClick: () => setMode('edit') } : {})}
        onDelete={handleDelete}
        showDelete={mode === 'edit'}
        primaryActionLabel={mode === 'view' ? 'Edit' : 'Save Changes'}
        style="glass"
      />
      <form id="allergy-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
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
