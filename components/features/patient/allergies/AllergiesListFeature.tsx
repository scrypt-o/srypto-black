'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ListView, { ListItem } from '@/components/layouts/ListViewLayout'
import { useDeleteAllergy } from '@/hooks/usePatientAllergies'
import type { AllergyRow, Severity } from '@/schemas/allergies'

interface AllergyItem extends ListItem {
  allergy_id: string
  allergen: string
  allergen_type: string | null
  reaction: string | null
  created_at: string
}

interface AllergiesListIslandProps {
  initialData: AllergyRow[]
  total: number
  initialState: Record<string, any>
}

// Map database severity to UI severity levels with proper life_threatening support
const mapSeverity = (severity: Severity | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!severity) return 'normal'
  
  const severityMap: Record<Severity, 'critical' | 'severe' | 'moderate' | 'mild'> = {
    'life_threatening': 'critical',
    'severe': 'severe',
    'moderate': 'moderate',
    'mild': 'mild'
  }
  
  return severityMap[severity] || 'normal'
}

export default function AllergiesListIsland({
  initialData,
  total,
  initialState
}: AllergiesListIslandProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deleteAllergy = useDeleteAllergy()
  
  // Convert initial data to list items
  const [items, setItems] = useState<AllergyItem[]>(
    initialData.map(item => ({
      id: item.allergy_id,
      allergy_id: item.allergy_id,
      title: item.allergen || 'Unknown',
      letter: item.allergen?.[0]?.toUpperCase() || '?',
      severity: mapSeverity(item.severity),
      allergen: item.allergen || '',
      allergen_type: item.allergen_type,
      reaction: item.reaction,
      created_at: item.created_at,
      thirdColumn: item.created_at,
      data: item
    }))
  )
  
  const [loading, setLoading] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Update items when initialData changes (from server refresh)
  useEffect(() => {
    setItems(
      initialData.map(item => ({
        id: item.allergy_id,
        allergy_id: item.allergy_id,
        title: item.allergen || 'Unknown',
        letter: item.allergen?.[0]?.toUpperCase() || '?',
        severity: mapSeverity(item.severity),
        allergen: item.allergen || '',
        allergen_type: item.allergen_type,
        reaction: item.reaction,
        created_at: item.created_at,
        thirdColumn: item.created_at,
        data: item
      }))
    )
  }, [initialData])

  // Navigation handlers
  const handleItemClick = useCallback((item: AllergyItem) => {
    router.push(`/patient/medhist/allergies/${item.allergy_id}`)
  }, [router])

  const handleEditClick = useCallback((item: AllergyItem) => {
    router.push(`/patient/medhist/allergies/${item.allergy_id}?mode=edit`)
  }, [router])

  const handleAdd = useCallback(() => {
    router.push('/patient/medhist/allergies/new')
  }, [router])

  // Delete handler using API hook
  const handleDelete = useCallback(async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} allergy record(s)?`)) {
      return
    }
    
    setLoading(true)
    
    try {
      // Delete each item using the API hook
      for (const id of ids) {
        await deleteAllergy.mutateAsync(id)
      }
      
      // Optimistically remove deleted items from list
      setItems(prev => prev.filter(item => !ids.includes(item.id)))
      
      // Refresh the page to get updated data from server
      router.refresh()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete some items. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [deleteAllergy, router])

  // Export handler
  const handleExport = useCallback((ids: string[]) => {
    const selectedItems = items.filter(item => ids.includes(item.id))
    
    const csv = [
      ['Allergen', 'Severity', 'Type', 'Reaction', 'Date Added'],
      ...selectedItems.map(item => [
        item.allergen,
        (item.data?.severity as string | undefined) || '',
        item.allergen_type || '',
        item.reaction || '',
        new Date(item.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `allergies-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [items])

  // URL-driven search handler
  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('search', query)
    } else {
      params.delete('search')
    }
    // Reset to first page when searching
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  // Filter handler
  const handleFilter = useCallback(() => {
    setShowFilterModal(true)
  }, [])

  // Apply filters via URL
  const applyFilters = useCallback((filters: { severity?: string; allergen_type?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update severity filter
    if (filters.severity) {
      params.set('severity', filters.severity)
    } else {
      params.delete('severity')
    }
    
    // Update allergen_type filter
    if (filters.allergen_type) {
      params.set('allergen_type', filters.allergen_type)
    } else {
      params.delete('allergen_type')
    }
    
    // Reset to first page when filtering
    params.set('page', '1')
    router.push(`?${params.toString()}`)
    setShowFilterModal(false)
  }, [router, searchParams])

  return (
    <>
      <ListView<AllergyItem>
        items={items}
        loading={loading || deleteAllergy.isPending}
        onItemClick={handleItemClick}
        onEditClick={handleEditClick}
        onDelete={handleDelete}
        onExport={handleExport}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
        searchPlaceholder="Search allergies..."
        pageTitle="Allergies"
        thirdColumnLabel="Date Added"
      />
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Filter Allergies</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={searchParams.get('severity') || ''}
                  id="severity-filter"
                >
                  <option value="">All</option>
                  <option value="life_threatening">Life Threatening</option>
                  <option value="severe">Severe</option>
                  <option value="moderate">Moderate</option>
                  <option value="mild">Mild</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={searchParams.get('allergen_type') || ''}
                  id="type-filter"
                >
                  <option value="">All</option>
                  <option value="food">Food</option>
                  <option value="medication">Medication</option>
                  <option value="environmental">Environmental</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const severityEl = document.getElementById('severity-filter') as HTMLSelectElement
                  const typeEl = document.getElementById('type-filter') as HTMLSelectElement
                  const f: { severity?: string; allergen_type?: string } = {}
                  if (severityEl.value) f.severity = severityEl.value
                  if (typeEl.value) f.allergen_type = typeEl.value
                  applyFilters(f)
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export type { AllergiesListIslandProps }
