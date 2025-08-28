'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  suggestions?: string[]
  showClear?: boolean
  fields?: string[]
  onFocus?: () => void
  onBlur?: () => void
  className?: string
}

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  suggestions = [],
  showClear = true,
  fields = [],
  onFocus,
  onBlur,
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(controlledValue || '')
  const [debouncedValue, setDebouncedValue] = useState(localValue)
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue)
    }
  }, [controlledValue])

  // Debounce the value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, debounceMs])

  // Call onChange when debounced value changes
  useEffect(() => {
    if (onChange && debouncedValue !== controlledValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, controlledValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0)
  }

  const handleClear = useCallback(() => {
    setLocalValue('')
    setDebouncedValue('')
    setShowSuggestions(false)
    if (onChange) {
      onChange('')
    }
  }, [onChange])

  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) onFocus()
    if (localValue.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion)
    setDebouncedValue(suggestion)
    setShowSuggestions(false)
    if (onChange) {
      onChange(suggestion)
    }
  }

  // Build placeholder with field hints
  const enhancedPlaceholder = fields.length > 0
    ? `${placeholder} (${fields.join(', ')})`
    : placeholder

  return (
    <div className={clsx('relative w-full', className)}>
      <div className="relative">
        {/* Search Icon */}
        <Search
          className={clsx(
            'absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors',
            isFocused ? 'text-primary' : 'text-gray-400'
          )}
        />
        
        {/* Input Field */}
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={enhancedPlaceholder}
          className={clsx(
            'w-full pl-10 pr-10 py-2.5',
            'text-gray-900 placeholder-gray-400',
            'bg-white border rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            isFocused ? 'border-primary ring-primary/20' : 'border-gray-200',
            'hover:border-gray-300'
          )}
        />
        
        {/* Clear Button */}
        {showClear && localValue && (
          <button
            type="button"
            onClick={handleClear}
            className={clsx(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'p-1 rounded-full transition-all duration-200',
              'text-gray-400 hover:text-gray-600',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className={clsx(
          'absolute z-10 w-full mt-1',
          'bg-white border border-gray-200 rounded-lg shadow-lg',
          'max-h-60 overflow-auto'
        )}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={clsx(
                'w-full px-4 py-2 text-left text-sm',
                'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                'border-b border-gray-100 last:border-0',
                'transition-colors duration-150'
              )}
            >
              {/* Highlight matching text */}
              {localValue && suggestion.toLowerCase().includes(localValue.toLowerCase()) ? (
                <span>
                  {suggestion.split(new RegExp(`(${localValue})`, 'gi')).map((part, i) =>
                    part.toLowerCase() === localValue.toLowerCase() ? (
                      <mark key={i} className="bg-yellow-100 text-gray-900">
                        {part}
                      </mark>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </span>
              ) : (
                suggestion
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}