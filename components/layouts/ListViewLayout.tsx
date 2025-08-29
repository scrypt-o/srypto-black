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
  // Configurable UI options
  getThumbnail?: (item: T) => string | React.ReactNode | null
  showAvatar?: boolean
  avatarShape?: 'round' | 'square'
  showChevron?: boolean
  density?: 'compact' | 'comfortable'
  exportEnabled?: boolean
  exportFormats?: Array<'csv' | 'pdf'>
  dateFormat?: 'short' | 'long'
  rightColumns?: Array<{ key: string; label?: string; render?: (item: T) => React.ReactNode; align?: 'left' | 'right'; width?: number }>
  titleWrap?: 'single' | 'wrap'
  showSecondaryLine?: boolean
  showInlineEdit?: boolean
}

// Color mapping for severity
const severityColors = {
  critical: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
  severe: 'bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-200',
  moderate: 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200',
  mild: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
  normal: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200'
}

const letterBadgeStyles = [
  'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200',
  'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 ring-1 ring-purple-200',
  'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 ring-1 ring-pink-200',
  'bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
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
  thirdColumnLabel,
  getThumbnail,
  showAvatar = true,
  avatarShape = 'round',
  showChevron = true,
  density = 'comfortable',
  exportEnabled = true,
  exportFormats = ['csv', 'pdf'],
  dateFormat = 'long',
  rightColumns,
  titleWrap = 'single',
  showSecondaryLine = true,
  showInlineEdit = true
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
      return value.toLocaleDateString('en-US', dateFormat === 'short' 
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' })
    }
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return new Date(value).toLocaleDateString('en-US', dateFormat === 'short' 
        ? { month: 'short', day: 'numeric' }
        : { month: 'short', day: 'numeric', year: 'numeric' })
    }
    return value
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search */}
      <div className="flex flex-col gap-3 p-4 bg-white border-b dark:bg-gray-950 dark:border-white/10">
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

          {selectMode && selectedIds.size > 0 && exportEnabled && (
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
                    {exportFormats.includes('csv') && (
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                      >
                        Export as CSV
                      </button>
                    )}
                    {exportFormats.includes('pdf') && (
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                      >
                        Export as PDF
                      </button>
                    )}
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
              const badgeStyle = letterBadgeStyles[index % letterBadgeStyles.length]
              const padding = density === 'compact' ? 'p-3' : 'p-4'
              const avatarSize = density === 'compact' ? 'w-9 h-9' : 'w-10 h-10'
              
              return (
                <div
                  key={item.id}
                  className={clsx(
                    'flex gap-3 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.995] transition-all',
                    titleWrap === 'wrap' ? 'items-start' : 'items-center',
                    padding,
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

                  {/* Thumbnail or Letter Badge */}
                  {(() => {
                    const thumb = getThumbnail?.(item)
                    if (typeof thumb === 'string' && thumb) {
                      return (
                        <img
                          src={thumb}
                          alt=""
                          className={clsx(avatarSize, avatarShape === 'round' ? 'rounded-full' : 'rounded-lg', 'object-cover shadow-sm')}
                        />
                      )
                    }
                    if (React.isValidElement(thumb)) return thumb
                    if (!showAvatar) return null
                    return (
                      <div className={clsx(
                        avatarSize,
                        avatarShape === 'round' ? 'rounded-full' : 'rounded-lg',
                        'grid place-items-center font-semibold text-sm shadow-sm',
                        badgeStyle
                      )}>
                        {letter}
                      </div>
                    )
                  })()}

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={clsx(
                        'font-medium text-gray-900 dark:text-gray-100',
                        titleWrap === 'wrap' ? 'whitespace-normal break-words' : 'truncate'
                      )}>
                        {item.title}
                      </span>
                      {item.severity && (
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide leading-none',
                          severityColors[item.severity]
                        )}>
                          {item.severity}
                        </span>
                      )}
                    </div>
                    {/* Secondary line: tags and preview if available */}
                    {showSecondaryLine && (
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 min-w-0">
                        {(() => {
                          const anyItem: any = item
                          const tags: React.ReactNode[] = []
                          if (anyItem.allergen_type) {
                            tags.push(
                              <span key="type" className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/10 px-2 py-0.5 text-[11px]">
                                {String(anyItem.allergen_type)}
                              </span>
                            )
                          }
                          if (anyItem.reaction) {
                            tags.push(
                              <span key="reaction" className="truncate max-w-[50%] text-[11px] text-gray-500 dark:text-gray-400">
                                {String(anyItem.reaction)}
                              </span>
                            )
                          }
                          return tags
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Right-side columns or date */}
                  {rightColumns && rightColumns.length > 0 ? (
                    <div className="ml-auto flex items-center gap-4 text-sm text-gray-700 dark:text-gray-200">
                      {rightColumns.map((col) => (
                        <div key={col.key} className={clsx(col.align === 'right' && 'text-right')}>
                          {col.label && <div className="text-[11px] text-gray-400">{col.label}</div>}
                          <div className="truncate">{col.render ? col.render(item) : (item as any)[col.key]}</div>
                        </div>
                      ))}
                      {showChevron && <Icons.ChevronRight className="h-4 w-4 text-gray-300" />}
                    </div>
                  ) : (
                    <div className="ml-auto flex items-center gap-2">
                      {item.thirdColumn ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatThirdColumn(item.thirdColumn)}
                        </div>
                      ) : null}
                      {showChevron && <Icons.ChevronRight className="h-4 w-4 text-gray-300" />}
                    </div>
                  )}

                  {/* Edit Button */}
                  {showInlineEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditClick?.(item)
                    }}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
                  >
                    <Icons.Pencil className="h-4 w-4 text-gray-400" />
                  </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
