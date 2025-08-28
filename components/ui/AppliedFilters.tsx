'use client'

import React from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface AppliedFiltersProps {
  filters: Record<string, any>
  onRemove: (key: string) => void
  onClear: () => void
  formatLabel?: (key: string, value: any) => string
  className?: string
}

export default function AppliedFilters({
  filters,
  onRemove,
  onClear,
  formatLabel,
  className = '',
}: AppliedFiltersProps) {
  // Don't render if no filters
  const filterEntries = Object.entries(filters).filter(([_, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).some(k => value[k])
    }
    return value !== '' && value !== null && value !== undefined
  })

  if (filterEntries.length === 0) {
    return null
  }

  const defaultFormatLabel = (key: string, value: any): string => {
    // Convert key from snake_case to Title Case
    const label = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Format value
    let formattedValue = value
    if (Array.isArray(value)) {
      formattedValue = value.join(', ')
    } else if (typeof value === 'object' && value !== null) {
      if (value.from && value.to) {
        formattedValue = `${value.from} to ${value.to}`
      } else if (value.from) {
        formattedValue = `From ${value.from}`
      } else if (value.to) {
        formattedValue = `Until ${value.to}`
      } else {
        formattedValue = JSON.stringify(value)
      }
    } else if (typeof value === 'boolean') {
      formattedValue = value ? 'Yes' : 'No'
    }

    return `${label}: ${formattedValue}`
  }

  const getChipColorClass = (key: string) => {
    // Medical-specific color coding
    if (key.includes('severity')) {
      const value = filters[key]?.toLowerCase()
      if (value === 'mild') return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
      if (value === 'moderate') return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      if (value === 'severe') return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
    }
    
    if (key.includes('status')) {
      const value = filters[key]?.toLowerCase()
      if (value === 'active') return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      if (value === 'resolved') return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
    }

    // Default color
    return 'bg-primary-light text-primary border-blue-200 hover:bg-blue-100'
  }

  return (
    <div className={clsx(
      'flex items-center gap-2 py-2 px-4',
      'bg-gray-50 border-b border-gray-200',
      'animate-slide-up',
      className
    )}>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Active filters:</span>
        
        {filterEntries.map(([key, value]) => (
          <div
            key={key}
            className={clsx(
              'inline-flex items-center gap-1',
              'px-3 py-1.5 rounded-full',
              'border text-sm font-medium',
              'transition-all duration-200',
              'animate-fade-in',
              getChipColorClass(key)
            )}
          >
            <span>
              {formatLabel ? formatLabel(key, value) : defaultFormatLabel(key, value)}
            </span>
            <button
              onClick={() => onRemove(key)}
              className={clsx(
                'ml-1 p-0.5 rounded-full',
                'hover:bg-black/10 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
              aria-label={`Remove ${key} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Clear all button */}
      <button
        onClick={onClear}
        className={clsx(
          'ml-auto text-sm text-gray-600',
          'hover:text-gray-900 transition-colors',
          'focus:outline-none focus:underline'
        )}
      >
        Clear all
      </button>
    </div>
  )
}