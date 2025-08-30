'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, LayoutGrid, List } from 'lucide-react'
import type { DependentFormData } from '@/schemas/dependents'
import { dependentFormSchema, RelationshipEnum, TitleEnum } from '@/schemas/dependents'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateDependent } from '@/hooks/usePatientDependents'
import { useToast } from '@/components/patterns/Toast'

export default function DependentCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateDependent()
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')

  const form = useForm<DependentFormData>({
    resolver: zodResolver(dependentFormSchema),
    defaultValues: {
      full_name: '',
      relationship: '' as DependentFormData['relationship'],
      date_of_birth: '',
      id_number: '',
      medical_aid_number: '',
      title: '' as DependentFormData['title'],
      first_name: '',
      middle_name: '',
      last_name: '',
      passport_number: '',
      citizenship: '',
      use_profile_info: false,
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: DependentFormData) => {
    if (!data.full_name?.trim()) {
      toast?.push({ type: 'error', message: 'Please fill in the full name field' })
      return
    }
    
    const normalized = {
      full_name: data.full_name.trim(),
      relationship: data.relationship || undefined,
      date_of_birth: data.date_of_birth?.trim() || undefined,
      id_number: data.id_number?.trim() || undefined,
      medical_aid_number: data.medical_aid_number?.trim() || undefined,
      title: data.title || undefined,
      first_name: data.first_name?.trim() || undefined,
      middle_name: data.middle_name?.trim() || undefined,
      last_name: data.last_name?.trim() || undefined,
      passport_number: data.passport_number?.trim() || undefined,
      citizenship: data.citizenship?.trim() || undefined,
      use_profile_info: data.use_profile_info || false,
    }
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Dependent added successfully' })
        router.push('/patient/persinfo/dependents')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create dependent' })
    })
  }

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Dependent
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
                onClick={() => router.push('/patient/persinfo/dependents')}
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Full Name<span className="text-red-500">*</span>:</label>
                <input
                  {...register('full_name')}
                  placeholder="Enter full name"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.full_name ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Relationship:</label>
                <select
                  {...register('relationship')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(rel => (
                    <option key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Date of Birth:</label>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Title:</label>
                <select
                  {...register('title')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select title</option>
                  {TitleEnum.options.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">First Name:</label>
                <input
                  {...register('first_name')}
                  placeholder="Enter first name"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Last Name:</label>
                <input
                  {...register('last_name')}
                  placeholder="Enter last name"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">ID Number:</label>
                <input
                  {...register('id_number')}
                  placeholder="Enter ID number"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Medical Aid:</label>
                <input
                  {...register('medical_aid_number')}
                  placeholder="Enter medical aid number"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Citizenship:</label>
                <input
                  {...register('citizenship')}
                  placeholder="Enter citizenship"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
            </div>
          ) : (
            // STACKED VIEW: Field name on top, field below, tooltip below
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  {...register('full_name')}
                  placeholder="Enter full name"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.full_name ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Complete name as it appears on documents</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Relationship</label>
                <select
                  {...register('relationship')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(rel => (
                    <option key={rel} value={rel}>{rel.charAt(0).toUpperCase() + rel.slice(1)}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Relationship to patient</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Date of Birth</label>
                <input
                  {...register('date_of_birth')}
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Date of birth</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">First Name</label>
                <input
                  {...register('first_name')}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Given name</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Last Name</label>
                <input
                  {...register('last_name')}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Family name</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">ID Number</label>
                <input
                  {...register('id_number')}
                  placeholder="Enter ID number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">National ID or identification number</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Medical Aid Number</label>
                <input
                  {...register('medical_aid_number')}
                  placeholder="Enter medical aid number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Health insurance member number</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Citizenship</label>
                <input
                  {...register('citizenship')}
                  placeholder="Enter citizenship"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Country of citizenship</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}