'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import DetailViewLayout from '@/components/layouts/DetailViewLayout'
import { allergyFormSchema, type AllergyFormData, AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAllergy } from '@/hooks/usePatientAllergies'
import { useToast } from '@/components/patterns/Toast'

export default function AllergyCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateAllergy()
  const [apiError, setApiError] = React.useState<string | null>(null)

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: '',
      allergen_type: 'other',
      severity: 'moderate',
      reaction: '',
      first_observed: '',
      trigger_factors: '',
      emergency_action_plan: '',
      notes: '',
    },
    mode: 'onChange'
  })
  const { handleSubmit, register } = form

  const onSubmit = (data: AllergyFormData) => {
    setApiError(null)
    const payload = {
      ...data,
      reaction: data.reaction || undefined,
      first_observed: data.first_observed || undefined,
      trigger_factors: data.trigger_factors || undefined,
      emergency_action_plan: data.emergency_action_plan || undefined,
      notes: data.notes || undefined,
    }
    void createMutation.mutate(payload, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Allergy added successfully' })
        router.push('/patient/medhist/allergies')
      },
      onError: () => setApiError('Failed to save allergy')
    })
  }

  const sections = [
    {
      id: 'main',
      title: 'Allergy Details',
      content: (
        <div className="grid gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Allergen *</span>
            <input {...register('allergen')} placeholder="e.g., Peanuts, Penicillin, Pollen" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
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
            <input {...register('reaction')} placeholder="e.g., Hives, swelling, difficulty breathing" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">First Observed</span>
            <input {...register('first_observed')} type="date" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
        </div>
      ),
    },
    {
      id: 'additional',
      title: 'Additional Information',
      description: 'Optional details about the allergy',
      content: (
        <div className="grid gap-4">
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Trigger Factors</span>
            <textarea {...register('trigger_factors')} rows={3} placeholder="Describe what triggers the allergic reaction" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Emergency Action Plan</span>
            <textarea {...register('emergency_action_plan')} rows={3} placeholder="Steps to take in case of exposure" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">Notes</span>
            <textarea {...register('notes')} rows={3} placeholder="Any additional notes" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900 dark:border-white/10" />
          </label>
        </div>
      ),
    },
  ]

  return (
    <>
      <DetailViewLayout
        title="Add New Allergy"
        subtitle="Record a new allergy for your medical history"
        mode="create"
        formId="new-allergy-form"
        loading={createMutation.isPending}
        {...(apiError ? { errors: [{ field: 'api', message: apiError }] } : {})}
        sections={sections}
        stickyActions
        onBack={() => router.push('/patient/medhist/allergies')}
        onCancel={() => { router.push('/patient/medhist/allergies') }}
        style="glass"
      />
      <form id="new-allergy-form" onSubmit={handleSubmit(onSubmit)} className="hidden" />
    </>
  )
}
