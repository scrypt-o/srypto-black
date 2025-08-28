'use client'

import * as React from 'react'
import { useState, useCallback } from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'

// Types
export interface ListItem {
  id: string
  title: string
  letter?: string  // If not provided, use first letter of title
  severity?: 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'
  thirdColumn?: string | Date
  data?: Record<string, any>
}

export interface ListViewProps<T extends ListItem> {
  items: T[]
  loading?: boolean
  onItemClick?: (item: T) => void
  onEditClick?: (item: T) => void
  onDelete?: (ids: string[]) => void
  onExport?: (ids: string[]) => void
  onSearch?: (query: string) => void
  onFilter?: () => void
  onAdd?: () => void
  searchPlaceholder?: string
  pageTitle?: string
  thirdColumnLabel?: string
}

// Color mapping for severity
const severityColors = {
  critical: 'bg-red-500 text-white',
  severe: 'bg-orange-500 text-white',
  moderate: 'bg-yellow-500 text-white',
  mild: 'bg-blue-500 text-white',
  normal: 'bg-gray-400 text-white'
}

const letterBadgeColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
]

export default function ListView<T extends ListItem>({
  items,
  loading,
  onItemClick,
  onEditClick,
  onDelete,
  onExport,
  onSearch,
  onFilter,
  onAdd,
  searchPlaceholder = 'Search...',
  pageTitle,
  thirdColumnLabel
}: ListViewProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }, [onSearch])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
    }
  }, [items, selectedIds.size])

  const handleDelete = useCallback(() => {
    if (selectedIds.size > 0 && onDelete) {
      onDelete(Array.from(selectedIds))
      setSelectedIds(new Set())
      setSelectMode(false)
    }
  }, [selectedIds, onDelete])

  const handleExport = useCallback((format: 'csv' | 'pdf') => {
    if (selectedIds.size > 0 && onExport) {
      onExport(Array.from(selectedIds))
      setShowExportMenu(false)
      setSelectedIds(new Set())
      setSelectMode(false)
    }
  }, [selectedIds, onExport])

  const formatThirdColumn = (value: string | Date | undefined) => {
    if (!value) return '-'
    if (value instanceof Date) {
      return value.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    return value
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search */}
      <div className="flex flex-col gap-3 p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onFilter}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Filters"
          >
            <Icons.Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectMode(!selectMode)
              setSelectedIds(new Set())
            }}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            {selectMode ? 'Cancel' : 'Select'}
          </button>
          
          {onAdd && (
            <button
              onClick={onAdd}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add new
            </button>
          )}

          {selectMode && selectedIds.size > 0 && (
            <>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete ({selectedIds.size})
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                    >
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {selectMode && (
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              {selectedIds.size === items.length ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No items found
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item, index) => {
              const letter = item.letter || item.title[0]?.toUpperCase() || '?'
              const badgeColor = letterBadgeColors[index % letterBadgeColors.length]
              
              return (
                <div
                  key={item.id}
                  className={clsx(
                    'flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors',
                    'cursor-pointer'
                  )}
                  onClick={() => !selectMode && onItemClick?.(item)}
                >
                  {/* Checkbox (only in select mode) */}
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelect(item.id)
                      }}
                      className="h-4 w-4 text-blue-500 rounded"
                    />
                  )}

                  {/* Letter Badge */}
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-lg',
                    badgeColor
                  )}>
                    {letter}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <span className="font-medium text-gray-900 truncate">
                      {item.title}
                    </span>
                    
                    {item.severity && (
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        severityColors[item.severity]
                      )}>
                        {item.severity}
                      </span>
                    )}
                  </div>

                  {/* Third Column */}
                  <div className="text-sm text-gray-500">
                    {formatThirdColumn(item.thirdColumn)}
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditClick?.(item)
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded"
                  >
                    <Icons.Pencil className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}