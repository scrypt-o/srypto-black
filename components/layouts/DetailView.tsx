'use client'

import * as React from 'react'
import { useState } from 'react'
import * as Icons from 'lucide-react'
import clsx from 'clsx'

export interface DetailField {
  id: string
  label: string
  value: string | number | boolean | Date | null
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'boolean'
  options?: { label: string; value: string }[]
  required?: boolean
  readonly?: boolean
  placeholder?: string
}

export interface DetailSection {
  title?: string
  fields: DetailField[]
}

export interface DetailViewProps {
  title: string
  pageTitle: string
  sections: DetailSection[]
  mode?: 'view' | 'edit'
  onSave?: (data: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  onBack?: () => void
  onEdit?: () => void
  loading?: boolean
  error?: string
}

export default function DetailView({
  title,
  pageTitle,
  sections,
  mode: initialMode = 'view',
  onSave,
  onCancel,
  onBack,
  onEdit,
  loading,
  error
}: DetailViewProps) {
  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    // Initialize form data from sections
    const initialData: Record<string, any> = {}
    sections.forEach(section => {
      section.fields.forEach(field => {
        initialData[field.id] = field.value
      })
    })
    setFormData(initialData)
  }, [sections])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSave = async () => {
    if (onSave) {
      setSaving(true)
      try {
        await onSave(formData)
        setMode('view')
      } catch (err) {
        console.error('Save failed:', err)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleEdit = () => {
    setMode('edit')
    onEdit?.()
  }

  const handleCancel = () => {
    setMode('view')
    // Reset form data
    const initialData: Record<string, any> = {}
    sections.forEach(section => {
      section.fields.forEach(field => {
        initialData[field.id] = field.value
      })
    })
    setFormData(initialData)
    onCancel?.()
  }

  const renderField = (field: DetailField) => {
    const value = formData[field.id] ?? field.value
    const isReadonly = mode === 'view' || field.readonly

    if (isReadonly) {
      // View mode - display as text
      let displayValue = value
      if (field.type === 'boolean') {
        displayValue = value ? 'Yes' : 'No'
      } else if (field.type === 'date' && value) {
        displayValue = new Date(value).toLocaleDateString()
      } else if (field.type === 'select' && field.options) {
        const option = field.options.find(opt => opt.value === value)
        displayValue = option?.label || value
      }

      return (
        <div className="py-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <div className="text-gray-900">
            {displayValue || '-'}
          </div>
        </div>
      )
    }

    // Edit mode - render input
    switch (field.type) {
      case 'textarea':
        return (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )

      case 'select':
        return (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'date':
        return (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )

      case 'number':
        return (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )

      case 'boolean':
        return (
          <div className="py-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="h-4 w-4 text-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          </div>
        )

      default:
        return (
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Edit"
                >
                  <Icons.Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Back"
                >
                  <Icons.ArrowLeft className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm">
          {/* Title */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Sections */}
          <div className="p-6 space-y-6">
            {sections.map((section, index) => (
              <div key={index}>
                {section.title && (
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {section.title}
                  </h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(field => (
                    <div key={field.id} className={
                      field.type === 'textarea' ? 'md:col-span-2' : ''
                    }>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}