'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, LayoutGrid, List } from 'lucide-react'
import type { EmergencyContactFormData } from '@/schemas/emergencyContacts'
import { emergencyContactFormSchema, RelationshipEnum } from '@/schemas/emergencyContacts'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateEmergencyContact } from '@/hooks/usePatientEmergencyContacts'
import { useToast } from '@/components/patterns/Toast'

export default function EmergencyContactCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateEmergencyContact()
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')

  const form = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactFormSchema),
    defaultValues: {
      name: '',
      relationship: undefined,
      phone: '',
      email: '',
      is_primary: false,
      address: '',
      alternative_phone: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: EmergencyContactFormData) => {
    if (!data.name?.trim()) {
      toast?.push({ type: 'error', message: 'Contact name is required' })
      return
    }
    
    if (!data.phone?.trim() && !data.email?.trim()) {
      toast?.push({ type: 'error', message: 'At least one contact method (phone or email) is required' })
      return
    }
    
    const normalized = {
      name: data.name.trim(),
      relationship: data.relationship || undefined,
      phone: data.phone?.trim() || undefined,
      email: data.email?.trim() || undefined,
      is_primary: data.is_primary || false,
      address: data.address?.trim() || undefined,
      alternative_phone: data.alternative_phone?.trim() || undefined,
    }
    
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Emergency contact added successfully' })
        router.push('/patient/persinfo/emergency-contacts')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create emergency contact' })
    })
  }

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Emergency Contact
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
                onClick={() => router.push('/patient/persinfo/emergency-contacts')}
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Contact Name<span className="text-red-500">*</span>:</label>
                <input
                  {...register('name')}
                  placeholder="Enter contact name"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.name ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Relationship:</label>
                <select
                  {...register('relationship')}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Primary Phone:</label>
                <input
                  {...register('phone')}
                  placeholder="Enter phone number"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.phone ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Alt Phone:</label>
                <input
                  {...register('alternative_phone')}
                  placeholder="Alternative phone number"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Email:</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter email address"
                  className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.email ? 'bg-red-50 border-red-300' : ''}`}
                />
              </div>
              <div className="flex items-start gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0 pt-2">Address:</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="Enter physical address"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">Primary Contact:</label>
                <label className="flex items-center">
                  <input
                    {...register('is_primary')}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Designate as primary emergency contact</span>
                </label>
              </div>
            </div>
          ) : (
            // STACKED VIEW: Field name on top, field below, tooltip below
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Contact Name <span className="text-red-500">*</span></label>
                <input
                  {...register('name')}
                  placeholder="Enter contact name"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.name ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Full name of emergency contact</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Relationship</label>
                <select
                  {...register('relationship')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select relationship</option>
                  {RelationshipEnum.options.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Relationship to patient</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Primary Phone</label>
                <input
                  {...register('phone')}
                  placeholder="Enter phone number"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.phone ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Primary phone number</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Alternative Phone</label>
                <input
                  {...register('alternative_phone')}
                  placeholder="Alternative phone number"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Secondary phone number</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10 ${errors.email ? 'bg-red-50 border-red-300' : ''}`}
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Contact email address</p>
              </div>
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Physical Address</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="Enter physical address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Complete physical address</p>
              </div>
              <div>
                <div className="flex items-center">
                  <input
                    {...register('is_primary')}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-base font-bold text-blue-600 dark:text-blue-400">Primary Contact</label>
                </div>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Designate as primary emergency contact</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}