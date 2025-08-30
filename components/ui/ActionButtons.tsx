'use client'

import { useState } from 'react'
import { Check, Plus, Download, X, ChevronDown } from 'lucide-react'

interface ActionButtonsProps {
  selectMode: boolean
  selectedCount: number
  allSelected: boolean
  onSelectToggle: () => void
  onSelectAll: () => void
  onAdd?: () => void
  onExport?: (format: 'csv' | 'pdf') => void
  onDelete?: () => void
}

export default function ActionButtons({
  selectMode,
  selectedCount,
  allSelected,
  onSelectToggle,
  onSelectAll,
  onAdd,
  onExport,
  onDelete
}: ActionButtonsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  if (selectMode) {
    return (
      <div className="flex items-center justify-between w-full">
        {/* Left: Checkbox + Cancel */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAll}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            <input
              type="checkbox"
              checked={allSelected}
              readOnly
              className="h-4 w-4 text-blue-500 rounded"
            />
          </button>
          <button
            onClick={onSelectToggle}
            className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Cancel</span>
          </button>
        </div>
        
        {/* Right: Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3">
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
                <span className="text-sm">Delete</span>
              </button>
            )}
            {onExport && (
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-sm">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32">
                    <button
                      onClick={() => {
                        onExport('csv')
                        setShowExportMenu(false)
                      }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => {
                        onExport('pdf')
                        setShowExportMenu(false)
                      }}
                      className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                    >
                      PDF
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Normal mode
  return (
    <div className="flex items-center justify-between w-full">
      <button
        onClick={onSelectToggle}
        className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
      >
        <Check className="w-5 h-5" />
        <span className="text-sm">Select</span>
      </button>
      
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 p-2 text-green-600 hover:bg-green-50 rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm">Add new</span>
        </button>
      )}
    </div>
  )
}