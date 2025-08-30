'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, LayoutGrid, List } from 'lucide-react'
import type { VitalSignFormData } from '@/schemas/vitalSigns'
import { vitalSignFormSchema, MeasurementContextEnum } from '@/schemas/vitalSigns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateVitalSign } from '@/hooks/usePatientVitalSigns'
import { useToast } from '@/components/patterns/Toast'

export default function VitalSignCreateFeature() {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateVitalSign()
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>('stacked')

  const form = useForm<VitalSignFormData>({
    resolver: zodResolver(vitalSignFormSchema),
    defaultValues: {
      measurement_date: new Date().toISOString().split('T')[0], // Today's date
      systolic_bp: '',
      diastolic_bp: '',
      heart_rate: '',
      temperature: '',
      oxygen_saturation: '',
      respiratory_rate: '',
      blood_glucose: '',
      cholesterol_total: '',
      hdl_cholesterol: '',
      ldl_cholesterol: '',
      triglycerides: '',
      measurement_device: '',
      measurement_context: '',
      notes: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = (data: VitalSignFormData) => {
    const getNum = (str: string | undefined) => {
      if (!str || str.trim() === '') return undefined
      const num = parseFloat(str.trim())
      return isNaN(num) ? undefined : num
    }
    
    const normalized = {
      measurement_date: data.measurement_date?.trim() || undefined,
      systolic_bp: getNum(data.systolic_bp),
      diastolic_bp: getNum(data.diastolic_bp),
      heart_rate: getNum(data.heart_rate),
      temperature: getNum(data.temperature),
      oxygen_saturation: getNum(data.oxygen_saturation),
      respiratory_rate: getNum(data.respiratory_rate),
      blood_glucose: getNum(data.blood_glucose),
      cholesterol_total: getNum(data.cholesterol_total),
      hdl_cholesterol: getNum(data.hdl_cholesterol),
      ldl_cholesterol: getNum(data.ldl_cholesterol),
      triglycerides: getNum(data.triglycerides),
      measurement_device: data.measurement_device?.trim() || undefined,
      measurement_context: data.measurement_context?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    }
    
    void createMutation.mutate(normalized, {
      onSuccess: () => {
        toast?.push({ type: 'success', message: 'Vital sign reading added successfully' })
        router.push('/patient/vitality/vital-signs')
      },
      onError: () => toast?.push({ type: 'error', message: 'Failed to create vital sign reading' })
    })
  }

  return (
    <>
      {/* Clean sticky header with bigger blue title */}
      <div className="sticky top-0 z-30 bg-white/75 backdrop-blur-lg dark:bg-gray-900/75 border-b border-gray-200 dark:border-white/10 py-4 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
            Add New Vital Sign Reading
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
                onClick={() => router.push('/patient/vitality/vital-signs')}
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
          {layoutStyle === 'stacked' ? (
            // STACKED VIEW: Field name on top, field below, tooltip below
            <div className="space-y-8">
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Measurement Date</label>
                <input
                  {...register('measurement_date')}
                  type="date"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">When this reading was taken</p>
              </div>
              
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Blood Pressure</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    {...register('systolic_bp')}
                    placeholder="Systolic (top)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                  <input
                    {...register('diastolic_bp')}
                    placeholder="Diastolic (bottom)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                </div>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Blood pressure reading in mmHg</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Heart Rate</label>
                  <input
                    {...register('heart_rate')}
                    placeholder="72"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                  <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Beats per minute</p>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Temperature</label>
                  <input
                    {...register('temperature')}
                    placeholder="36.8"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                  <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Body temperature in °C</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">O₂ Saturation</label>
                  <input
                    {...register('oxygen_saturation')}
                    placeholder="98"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                  <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Oxygen saturation (%)</p>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Respiratory Rate</label>
                  <input
                    {...register('respiratory_rate')}
                    placeholder="16"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                  />
                  <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Breaths per minute</p>
                </div>
              </div>
              
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Blood Glucose</label>
                <input
                  {...register('blood_glucose')}
                  placeholder="95"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Blood sugar level in mg/dL</p>
              </div>
              
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Measurement Device</label>
                <input
                  {...register('measurement_device')}
                  placeholder="Digital blood pressure monitor"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Device used for measurement</p>
              </div>
              
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Context</label>
                <select
                  {...register('measurement_context')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                >
                  <option value="">Select context</option>
                  {MeasurementContextEnum.options.map(context => (
                    <option key={context} value={context}>{context.replace('_', ' ')}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">When/why measurement was taken</p>
              </div>
              
              <div>
                <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Additional notes about this reading"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-white/10"
                />
                <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">Any additional observations</p>
              </div>
            </div>
          ) : (
            // TABLE VIEW would go here - omitted for brevity
            <div className="text-center py-8">
              <p>Table view would be implemented here</p>
            </div>
          )}
        </form>
      </div>
    </>
  )
}