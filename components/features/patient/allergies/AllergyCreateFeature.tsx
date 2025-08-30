'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, LayoutGrid, List } from 'lucide-react'
import type { AllergyFormData } from '@/schemas/allergies'
import { allergyFormSchema, AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAllergy } from '@/hooks/usePatientAllergies'
import { useToast } from '@/components/patterns/Toast'

export default function AllergyCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateAllergy()
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: '',
      allergen_type: '' as AllergyFormData['allergen_type'],
      severity: '' as AllergyFormData['severity'],
      reaction: '',
      first_observed: '',
      trigger_factors: '',
      emergency_action_plan: '',
      notes: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: AllergyFormData) => {
    if (!data.allergen?.trim() || !data.allergen_type || !data.severity) {
      toast?.push({ type: 'error', message: 'Please fill in required fields' })
      return
    }
    
    const normalized = {
      allergen: data.allergen.trim(),
      allergen_type: data.allergen_type,
      severity: data.severity,
      reaction: data.reaction?.trim() || undefined,
      first_observed: data.first_observed?.trim() || undefined,
      trigger_factors: data.trigger_factors?.trim() || undefined,
      emergency_action_plan: data.emergency_action_plan?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    }
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Allergy added successfully' })
        router.push('/patient/medhist/allergies')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create allergy' })
    })
  }

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Allergy
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
                onClick={() => router.push('/patient/medhist/allergies')}
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Allergen<span className="text-red-500">*</span>:</label>
                <input
                  {...register('allergen')}
                  placeholder="Enter allergen name"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Type<span className="text-red-500">*</span>:</label>
                <select
                  {...register('allergen_type')}
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen_type ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select type</option>
                  {AllergenTypeEnum.options.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Severity<span className="text-red-500">*</span>:</label>
                <select
                  {...register('severity')}
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.severity ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select severity</option>
                  {SeverityEnum.options.map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Reaction:</label>
                <textarea
                  {...register('reaction')}
                  rows={3}
                  placeholder="Describe symptoms"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">First Observed:</label>
                <input
                  {...register('first_observed')}
                  type="date"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Triggers:</label>
                <textarea
                  {...register('trigger_factors')}
                  rows={3}
                  placeholder="What triggers this"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Emergency:</label>
                <textarea
                  {...register('emergency_action_plan')}
                  rows={3}
                  placeholder="Action plan"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Notes:</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Additional notes"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
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
                  placeholder="Enter allergen name"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">The substance causing the reaction</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Type <span className="text-red-500">*</span></label>
                <select
                  {...register('allergen_type')}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.allergen_type ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select type</option>
                  {AllergenTypeEnum.options.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Category of allergen</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Severity <span className="text-red-500">*</span></label>
                <select
                  {...register('severity')}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.severity ? 'bg-red-50 border-red-300' : ''}`}
                >
                  <option value="">Select severity</option>
                  {SeverityEnum.options.map(severity => (
                    <option key={severity} value={severity}>{severity}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Reaction severity level</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Reaction</label>
                <textarea
                  {...register('reaction')}
                  rows={3}
                  placeholder="Describe symptoms"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Physical symptoms experienced</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">First Observed</label>
                <input
                  {...register('first_observed')}
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">When first noticed</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Trigger Factors</label>
                <textarea
                  {...register('trigger_factors')}
                  rows={3}
                  placeholder="What triggers this"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Conditions that trigger reactions</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Emergency Plan</label>
                <textarea
                  {...register('emergency_action_plan')}
                  rows={3}
                  placeholder="Action plan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Steps for severe reactions</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Additional notes"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Any additional notes</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}