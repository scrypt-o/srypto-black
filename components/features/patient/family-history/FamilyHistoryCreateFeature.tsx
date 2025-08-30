'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, LayoutGrid, List } from 'lucide-react'
import type { FamilyHistoryFormData } from '@/schemas/family-history'
import { familyHistoryFormSchema, RelationshipEnum } from '@/schemas/family-history'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateFamilyHistory } from '@/hooks/usePatientFamilyHistory'
import { useToast } from '@/components/patterns/Toast'

export default function FamilyHistoryCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateFamilyHistory()
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')

  const form = useForm<FamilyHistoryFormData>({
    resolver: zodResolver(familyHistoryFormSchema),
    defaultValues: {
      relative: '',
      condition: '',
      relationship: '' as FamilyHistoryFormData['relationship'],
      age_at_onset: undefined,
      notes: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: FamilyHistoryFormData) => {
    if (!data.condition?.trim() || !data.relationship) {
      toast?.push({ type: 'error', message: 'Please fill in required fields' })
      return
    }
    
    const normalized = {
      relative: data.relative?.trim() || undefined,
      condition: data.condition.trim(),
      relationship: data.relationship,
      age_at_onset: data.age_at_onset || undefined,
      notes: data.notes?.trim() || undefined,
    }
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Family history record added successfully' })
        router.push('/patient/medhist/family-history')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create family history record' })
    })
  }

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Family History Record
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
              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                <span className="text-sm">Create</span>
              </button>
              <button 
                onClick={() => router.push('/patient/medhist/family-history')}
                className="text-gray-600 hover:text-gray-800 text-sm px-2"
              >
                Cancel
              </button>
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Relative Name:</label>
                <input
                  {...register('relative')}
                  placeholder="Enter relative name (optional)"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Medical Condition<span className="text-red-500">*</span>:</label>
                <input
                  {...register('condition')}
                  placeholder="Enter medical condition"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.condition ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Relationship<span className="text-red-500">*</span>:</label>
                <select
                  {...register('relationship')}
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.relationship ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(relationship => (
                    <option key={relationship} value={relationship}>
                      {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Age at Onset:</label>
                <input
                  {...register('age_at_onset', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="150"
                  placeholder="Age when condition started"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Additional Notes:</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="Additional details about the condition..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
          ) : (
            // STACKED VIEW: Field name on top, field below, tooltip below
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Relative Name</label>
                <input
                  {...register('relative')}
                  placeholder="Enter relative name (optional)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Name of family member (for identification)</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Medical Condition <span className="text-red-500">*</span></label>
                <input
                  {...register('condition')}
                  placeholder="Enter medical condition"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.condition ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">The medical condition or disease</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Relationship <span className="text-red-500">*</span></label>
                <select
                  {...register('relationship')}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.relationship ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(relationship => (
                    <option key={relationship} value={relationship}>
                      {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Family relationship (affects genetic risk assessment)</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Age at Onset</label>
                <input
                  {...register('age_at_onset', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="150"
                  placeholder="Age when condition started"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Age when the condition was first diagnosed or appeared</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Additional Notes</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="Additional details about the condition..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Any additional information about the condition or treatment</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}