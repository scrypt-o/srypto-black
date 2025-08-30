'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Check, X, LayoutGrid, List } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/patterns/Toast'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'
import { z } from 'zod'
import { FieldValues } from 'react-hook-form'

// Field definition for forms
export interface DetailField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date'
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
}

// Generic configuration interface for detail views
export interface DetailFeatureConfig<TRow = any, TFormData extends FieldValues = any> {
  // Entity identification
  entityName: string
  entityNamePlural: string
  
  // Routing
  listPath: string
  
  // Form handling
  formSchema: z.ZodSchema<TFormData>
  transformRowToFormData: (row: TRow) => TFormData
  transformFormDataToApiInput: (formData: TFormData) => any
  
  // Field definitions
  fields: DetailField[]
  
  // Hooks
  hooks: {
    useUpdate: () => {
      mutateAsync: (data: { id: string; data: TFormData }) => Promise<TRow>
      isPending: boolean
    }
    useDelete: () => {
      mutateAsync: (id: string) => Promise<void>
      isPending: boolean
    }
  }
  
  // UI customization
  enableLayoutToggle?: boolean
  defaultLayout?: 'table' | 'stacked'
}

interface GenericDetailFeatureProps<TRow = any, TFormData extends FieldValues = any> {
  data: TRow
  config: DetailFeatureConfig<TRow, TFormData>
}

export default function GenericDetailFeature<TRow extends { [key: string]: any } = any, TFormData extends FieldValues = any>({
  data,
  config
}: GenericDetailFeatureProps<TRow, TFormData>) {
  const router = useRouter()
  const toast = useToast()
  const updateMutation = config.hooks.useUpdate()
  const deleteMutation = config.hooks.useDelete()
  const [mode, setMode] = React.useState<'view' | 'edit'>('view')
  const [layoutStyle, setLayoutStyle] = React.useState<'table' | 'stacked'>(config.defaultLayout || 'stacked')
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(config.formSchema),
    defaultValues: config.transformRowToFormData(data) as any
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  const onSubmit = async (formData: any) => {
    try {
      const idField = Object.keys(data).find(key => key.endsWith('_id'))
      if (!idField) throw new Error('No ID field found')
      
      // Use domain-specific transformation logic from config
      const normalizedData = config.transformFormDataToApiInput(formData)
      
      await updateMutation.mutateAsync({
        id: data[idField] as string,
        data: normalizedData
      })
      
      setMode('view')
      toast.push({ 
        type: 'success', 
        title: 'Updated', 
        message: `${config.entityName} updated successfully` 
      })
      router.refresh()
    } catch (error) {
      console.error('Update failed:', error)
      toast.push({ 
        type: 'error', 
        title: 'Update failed', 
        message: `Failed to update ${config.entityName}. Please try again.` 
      })
    }
  }

  const handleDelete = () => {
    setConfirmDelete(true)
  }

  const confirmDeleteAction = async () => {
    try {
      const idField = Object.keys(data).find(key => key.endsWith('_id'))
      if (!idField) throw new Error('No ID field found')
      
      await deleteMutation.mutateAsync(data[idField] as string)
      
      toast.push({ 
        type: 'success', 
        title: 'Deleted', 
        message: `${config.entityName} deleted successfully` 
      })
      router.push(config.listPath)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.push({ 
        type: 'error', 
        title: 'Delete failed', 
        message: `Failed to delete ${config.entityName}. Please try again.` 
      })
    } finally {
      setConfirmDelete(false)
    }
  }

  const renderField = (field: DetailField) => {
    const hasError = errors[field.key]
    const errorClass = hasError ? 'bg-red-50 border-red-300' : ''
    const commonClasses = `px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:border-white/10 ${errorClass}`

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.key as any)}
            disabled={mode === 'view'}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            className={`w-full ${commonClasses}`}
          />
        )
      case 'select':
        return (
          <select
            {...register(field.key as any)}
            disabled={mode === 'view'}
            className={`w-full ${commonClasses}`}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case 'date':
        return (
          <input
            {...register(field.key as any)}
            type="date"
            disabled={mode === 'view'}
            className={`w-full ${commonClasses}`}
          />
        )
      default:
        return (
          <input
            {...register(field.key as any)}
            disabled={mode === 'view'}
            placeholder={field.placeholder}
            className={`w-full ${commonClasses}`}
          />
        )
    }
  }

  return (
    <>
      {/* Header with actions */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {mode === 'edit' ? `Edit ${config.entityName}` : `Viewing ${config.entityName}`}
            </h1>
            
            {config.enableLayoutToggle && (
              <button
                onClick={() => setLayoutStyle(layoutStyle === 'table' ? 'stacked' : 'table')}
                className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {layoutStyle === 'table' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  setMode('edit')
                }}
                className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-5 h-5" />
                <span className="text-sm">Edit</span>
              </button>
            ) : (
              <>
                <button 
                  type="submit"
                  form="detail-form"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Save</span>
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                  <span className="text-sm">Delete</span>
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setMode('view')
                    reset()
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm px-2"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="p-4 pb-24">
        <form id="detail-form" onSubmit={handleSubmit(onSubmit)}>
          {layoutStyle === 'table' ? (
            // TABLE VIEW: Label on left, field on right
            <div className="space-y-6">
              {config.fields.map(field => (
                <div key={field.key} className="flex items-center gap-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 flex-shrink-0">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}:
                  </label>
                  <div className="flex-1">
                    {renderField(field)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // STACKED VIEW: Label on top, field below, description below
            <div className="space-y-8">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-base font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-[11px] text-blue-400 dark:text-blue-300 mt-0.5 ml-4">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete this ${config.entityName}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        busy={deleteMutation.isPending}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

export type { GenericDetailFeatureProps }