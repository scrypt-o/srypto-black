'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Icons from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterField {
  key: string
  label: string
  options: FilterOption[]
  defaultValue?: string
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: Record<string, string>) => void
  onClear: () => void
  title?: string
  fields: FilterField[]
  currentFilters?: Record<string, string>
}

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  title = "Filter Items",
  fields,
  currentFilters = {}
}: FilterModalProps) {
  // Create dynamic schema based on fields
  const filterSchema = z.object(
    fields.reduce((acc, field) => {
      acc[field.key] = z.string().optional()
      return acc
    }, {} as Record<string, z.ZodOptional<z.ZodString>>)
  )

  const { register, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues: currentFilters
  })

  const onSubmit = (data: Record<string, string>) => {
    // Filter out empty values
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && value.trim()) {
        acc[key] = value.trim()
      }
      return acc
    }, {} as Record<string, string>)
    
    onApply(cleanedData)
  }

  const handleClear = () => {
    reset()
    onClear()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 id="filter-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <Icons.X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label 
                htmlFor={field.key}
                className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
              >
                {field.label}
              </label>
              <select 
                id={field.key}
                {...register(field.key)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export type { FilterModalProps, FilterField, FilterOption }