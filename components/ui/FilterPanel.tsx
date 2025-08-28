'use client'

import React, { useState, useEffect } from 'react'
import { X, Filter, Check } from 'lucide-react'
import clsx from 'clsx'

export interface FilterField {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number'
  options?: { value: string; label: string; count?: number }[]
  placeholder?: string
  defaultValue?: any
}

interface FilterPanelProps {
  fields: FilterField[]
  activeFilters: Record<string, any>
  onApply: (filters: Record<string, any>) => void
  onClear: () => void
  isOpen: boolean
  onClose: () => void
  position?: 'sidebar' | 'modal' | 'bottom-sheet'
  className?: string
}

export default function FilterPanel({
  fields,
  activeFilters,
  onApply,
  onClear,
  isOpen,
  onClose,
  position = 'sidebar',
  className = '',
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters)
  const [hasChanges, setHasChanges] = useState(false)

  // Sync with external filter changes
  useEffect(() => {
    setLocalFilters(activeFilters)
  }, [activeFilters])

  // Check if there are changes
  useEffect(() => {
    const changed = JSON.stringify(localFilters) !== JSON.stringify(activeFilters)
    setHasChanges(changed)
  }, [localFilters, activeFilters])

  const handleFieldChange = (key: string, value: any) => {
    setLocalFilters(prev => {
      const updated = { ...prev }
      if (value === '' || value === null || value === undefined) {
        delete updated[key]
      } else {
        updated[key] = value
      }
      return updated
    })
  }

  const handleMultiSelectChange = (key: string, value: string) => {
    setLocalFilters(prev => {
      const current = prev[key] || []
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value]
      
      if (updated.length === 0) {
        const newFilters = { ...prev }
        delete newFilters[key]
        return newFilters
      }
      
      return { ...prev, [key]: updated }
    })
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({})
  }

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).length
  }

  // Position-specific classes
  const positionClasses = {
    sidebar: clsx(
      'fixed right-0 top-0 h-full w-80 z-50',
      'bg-white shadow-xl',
      'transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    ),
    modal: clsx(
      'fixed inset-0 z-50 flex items-center justify-center p-4',
      isOpen ? 'pointer-events-auto' : 'pointer-events-none'
    ),
    'bottom-sheet': clsx(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-white rounded-t-2xl shadow-xl',
      'max-h-[80vh] transform transition-transform duration-300',
      isOpen ? 'translate-y-0' : 'translate-y-full'
    ),
  }

  const renderField = (field: FilterField) => {
    const value = localFilters[field.key]

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={clsx(
              'w-full px-3 py-2 rounded-lg',
              'border border-gray-200 bg-white',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          >
            <option value="">{field.placeholder || 'All'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => {
              const isSelected = (value || []).includes(option.value)
              return (
                <label
                  key={option.value}
                  className={clsx(
                    'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                    'transition-colors duration-150',
                    isSelected ? 'bg-primary-light' : 'hover:bg-gray-50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMultiSelectChange(field.key, option.value)}
                    className="sr-only"
                  />
                  <div className={clsx(
                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                    isSelected 
                      ? 'bg-primary border-primary' 
                      : 'bg-white border-gray-300'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="ml-auto text-xs text-gray-500">
                      {option.count}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={clsx(
              'w-full px-3 py-2 rounded-lg',
              'border border-gray-200 bg-white',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
        )

      case 'daterange':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={value?.from || ''}
              onChange={(e) => handleFieldChange(field.key, {
                ...value,
                from: e.target.value
              })}
              placeholder="From"
              className={clsx(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-200 bg-white',
                'text-sm text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              )}
            />
            <input
              type="date"
              value={value?.to || ''}
              onChange={(e) => handleFieldChange(field.key, {
                ...value,
                to: e.target.value
              })}
              placeholder="To"
              className={clsx(
                'w-full px-3 py-2 rounded-lg',
                'border border-gray-200 bg-white',
                'text-sm text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              )}
            />
          </div>
        )

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={clsx(
              'w-full px-3 py-2 rounded-lg',
              'border border-gray-200 bg-white',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={clsx(
              'w-full px-3 py-2 rounded-lg',
              'border border-gray-200 bg-white',
              'text-sm text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
        )

      default:
        return null
    }
  }

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close filters"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Filter Fields */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {fields.map(field => (
            <div key={field.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className={clsx(
              'flex-1 py-2 px-4 rounded-lg font-medium',
              'border border-gray-200 text-gray-700 bg-white',
              'hover:bg-gray-50 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary'
            )}
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={!hasChanges}
            className={clsx(
              'flex-1 py-2 px-4 rounded-lg font-medium',
              'text-white transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              hasChanges
                ? 'bg-primary hover:bg-primary-hover'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            Apply {hasChanges && getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </button>
        </div>
      </div>
    </>
  )

  if (position === 'modal') {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={onClose}
          />
        )}
        
        {/* Modal */}
        <div className={positionClasses[position]}>
          <div className={clsx(
            'bg-white rounded-lg shadow-xl w-full max-w-md',
            'max-h-[90vh] flex flex-col',
            'transform transition-all duration-300',
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}>
            {content}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && position === 'bottom-sheet' && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div className={clsx(positionClasses[position], 'flex flex-col', className)}>
        {content}
      </div>
    </>
  )
}