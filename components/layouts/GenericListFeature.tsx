'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ListViewLayout, { ListItem } from '@/components/layouts/ListViewLayout'
import ConfirmDialog from '@/components/patterns/ConfirmDialog'
import FilterModal, { type FilterField } from '@/components/patterns/FilterModal'
import { useToast } from '@/components/patterns/Toast'

// Generic configuration interface that any domain can implement
export interface ListFeatureConfig<TRow = any, TItem extends ListItem = ListItem> {
  // Entity identification
  entityName: string           // 'allergy', 'condition', etc.
  entityNamePlural: string     // 'allergies', 'conditions', etc. (REQUIRED)
  
  // Routing
  basePath: string            // '/patient/medhist/allergies'
  
  // Data transformation
  transformRowToItem: (row: TRow) => TItem
  severityMapping?: (severity: any) => 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'
  
  // Filtering
  filterFields: FilterField[]
  
  // Hooks (from usePatient{Entity} files)
  hooks: {
    useDelete: () => {
      mutateAsync: (id: string) => Promise<void>
      isPending: boolean
    }
  }
  
  // Display customization
  allowDelete?: boolean
  searchPlaceholder?: string
  pageTitle?: string
  thirdColumnLabel?: string
  exportFilename?: (date: string) => string
  exportHeaders?: string[]
  exportRowMapper?: (item: TItem) => string[]
}

interface GenericListFeatureProps<TRow = any, TItem extends ListItem = ListItem> {
  initialData: TRow[]
  total: number
  initialState: {
    page: number
    pageSize: number
    search?: string
    sort_by: string
    sort_dir: string
    [key: string]: any  // Additional filter fields
  }
  config: ListFeatureConfig<TRow, TItem>
}

export default function GenericListFeature<TRow = any, TItem extends ListItem = ListItem>({
  initialData,
  total: _total,
  initialState: _initialState,
  config
}: GenericListFeatureProps<TRow, TItem>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deleteHook = config.hooks.useDelete()
  const toast = useToast()
  
  // Convert initial data to list items using config transformation
  const [items, setItems] = useState<TItem[]>(
    initialData.map(config.transformRowToItem)
  )
  
  const [loading, setLoading] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Update items when initialData changes (from server refresh)
  useEffect(() => {
    setItems(initialData.map(config.transformRowToItem))
  }, [initialData, config.transformRowToItem])

  // Navigation handlers
  const handleItemClick = useCallback((item: TItem) => {
    router.push(`${config.basePath}/${item.id}`)
  }, [router, config.basePath])

  const handleEditClick = useCallback((item: TItem) => {
    router.push(`${config.basePath}/${item.id}?mode=edit`)
  }, [router, config.basePath])

  const handleAdd = useCallback(() => {
    router.push(`${config.basePath}/new`)
  }, [router, config.basePath])

  // Delete handler using configured hook
  const handleDelete = useCallback((ids: string[]) => {
    setPendingDeleteIds(ids)
    setConfirmOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    const ids = pendingDeleteIds ?? []
    if (!ids.length) {
      setConfirmOpen(false)
      return
    }
    setLoading(true)
    try {
      for (const id of ids) {
        await deleteHook.mutateAsync(id!)
      }
      setItems(prev => prev.filter(item => !ids.includes(item.id)))
      router.refresh()
      toast.push({ 
        type: 'success', 
        title: 'Deleted', 
        message: `${ids.length} ${ids.length === 1 ? config.entityName : config.entityNamePlural} removed` 
      })
    } catch (error) {
      console.error('Delete failed:', error)
      toast.push({ 
        type: 'error', 
        title: 'Delete failed', 
        message: `Some ${config.entityNamePlural} could not be deleted. Please try again.` 
      })
    } finally {
      setLoading(false)
      setConfirmOpen(false)
      setPendingDeleteIds(null)
    }
  }, [deleteHook, pendingDeleteIds, router, toast, config.entityName, config.entityNamePlural])

  // Export handler using config
  const handleExport = useCallback((ids: string[]) => {
    const selectedItems = items.filter(item => ids.includes(item.id))
    
    const headers = config.exportHeaders || ['Name', 'Type', 'Date Added']
    const rows = selectedItems.map(item => 
      config.exportRowMapper ? 
        config.exportRowMapper(item) : 
        [item.title, item.severity || '', new Date(item.data?.created_at || '').toLocaleDateString()]
    )
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().split('T')[0]
    // @ts-ignore - entityNamePlural is required in interface, TypeScript being pedantic
    a.download = config.exportFilename?.(dateStr) ?? (config.entityNamePlural + '-' + dateStr + '.csv')
    a.click()
    window.URL.revokeObjectURL(url)
  }, [items, config])

  // URL-driven search handler
  const handleSearch = useCallback((query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.push(`?${params.toString()}`)
    }, 300)
  }, [router, searchParams])

  // Filter handler
  const handleFilter = useCallback(() => {
    setShowFilterModal(true)
  }, [])

  // Apply filters via URL
  const applyFilters = useCallback((filters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update all filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.set('page', '1')
    router.push(`?${params.toString()}`)
    setShowFilterModal(false)
  }, [router, searchParams])

  // Clear all filters
  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    config.filterFields.forEach(field => {
      params.delete(field.key)
    })
    params.set('page', '1')
    router.push(`?${params.toString()}`)
    setShowFilterModal(false)
  }, [router, searchParams, config.filterFields])

  // Build current filters for modal
  const currentFilters = config.filterFields.reduce((acc, field) => {
    const value = searchParams.get(field.key)
    if (value) acc[field.key] = value
    return acc
  }, {} as Record<string, string>)

  return (
    <>
      <ListViewLayout<TItem>
        items={items}
        loading={loading || deleteHook.isPending}
        onItemClick={handleItemClick}
        onEditClick={handleEditClick}
        onDelete={config.allowDelete === false ? undefined : handleDelete}
        onExport={handleExport}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
        searchPlaceholder={config.searchPlaceholder || `Search ${config.entityNamePlural}...`}
        pageTitle={config.pageTitle || config.entityNamePlural}
        thirdColumnLabel={config.thirdColumnLabel || "Date Added"}
        density="comfortable"
        avatarShape="round"
        showChevron
        exportEnabled
        exportFormats={["csv"]}
        dateFormat="short"
        titleWrap="wrap"
        showSecondaryLine={false}
        showInlineEdit={false}
      />
      
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete selected ${config.entityNamePlural}?`}
        message={pendingDeleteIds && pendingDeleteIds.length > 1 ? 
          `You are about to delete ${pendingDeleteIds.length} records.` : 
          'This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        busy={loading}
        onConfirm={confirmDelete}
        onCancel={() => { 
          if (!loading) { 
            setConfirmOpen(false) 
            setPendingDeleteIds(null) 
          } 
        }}
      />
      
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        onClear={clearFilters}
        title={`Filter ${config.entityNamePlural}`}
        fields={config.filterFields}
        currentFilters={currentFilters}
      />
    </>
  )
}

export type { GenericListFeatureProps }
