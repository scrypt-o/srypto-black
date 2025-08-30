'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import type { ImmunizationFormData } from '@/schemas/immunizations'
import { immunizationFormSchema } from '@/schemas/immunizations'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateImmunization } from '@/hooks/usePatientImmunizations'
import { useToast } from '@/components/patterns/Toast'

export default function ImmunizationCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateImmunization()

  const form = useForm<ImmunizationFormData>({
    resolver: zodResolver(immunizationFormSchema),
    defaultValues: {
      vaccine_name: '',
      vaccine_code: '',
      date_given: '',
      provider_name: '',
      batch_number: '',
      site: undefined,
      route: undefined,
      notes: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: ImmunizationFormData) => {
    if (!data.vaccine_name?.trim()) {
      toast?.push({ type: 'error', message: 'Please enter vaccine name' })
      return
    }
    
    const normalized = {
      vaccine_name: data.vaccine_name.trim(),
      vaccine_code: data.vaccine_code?.trim() || undefined,
      date_given: data.date_given?.trim() || undefined,
      provider_name: data.provider_name?.trim() || undefined,
      batch_number: data.batch_number?.trim() || undefined,
      site: data.site || undefined,
      route: data.route || undefined,
      notes: data.notes?.trim() || undefined,
    }
    
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Immunization added successfully' })
        router.push('/patient/medhist/immunizations')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create immunization' })
    })
  }

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Immunization
          </h1>
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              <span className="text-sm">Create</span>
            </button>
            <button 
              onClick={() => router.push('/patient/medhist/immunizations')}
              className="text-gray-600 hover:text-gray-800 text-sm px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="pb-24">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">
              Vaccine Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('vaccine_name')}
              placeholder="Enter vaccine name"
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.vaccine_name ? 'bg-red-50 border-red-300' : ''}`}
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Name of the vaccine administered</p>
          </div>

          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Vaccine Code</label>
            <input
              {...register('vaccine_code')}
              placeholder="Enter vaccine code"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Vaccine identification code</p>
          </div>

          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Date Given</label>
            <input
              {...register('date_given')}
              type="date"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">When the vaccine was administered</p>
          </div>

          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Healthcare Provider</label>
            <input
              {...register('provider_name')}
              placeholder="Enter provider name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Name of administering healthcare provider</p>
          </div>

          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Batch Number</label>
            <input
              {...register('batch_number')}
              placeholder="Enter batch/lot number"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Vaccine batch or lot number for tracking</p>
          </div>

          <div>
            <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Additional notes"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
            />
            <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Any additional notes about the immunization</p>
          </div>
        </form>
      </div>
    </>
  )
}