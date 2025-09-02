'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Key, Zap, Brain, AlertCircle } from 'lucide-react'

interface AISettingsDetailFeatureProps {
  aiConfig: any
  error: any
}

export default function AISettingsDetailFeature({ aiConfig, error }: AISettingsDetailFeatureProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ai_model_provider: aiConfig?.ai_model_provider || 'openai',
    ai_model: aiConfig?.ai_model || 'gpt-4o',
    ai_api_key: aiConfig?.ai_api_key || '',
    ai_temperature: aiConfig?.ai_temperature || 0.1,
    ai_system_instructions: aiConfig?.ai_system_instructions || 'You are a medical prescription analyzer. Extract structured data from prescription images with high accuracy.',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    
    try {
      const response = await fetch('/api/patient/settings/ai', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_type: 'prescription_analysis',
          ...formData
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save AI settings')
      }
      
      router.refresh()
      
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          AI Configuration
        </h1>
        <p className="text-gray-600 mt-1">
          Configure your personal AI settings for prescription scanning
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={formData.ai_model_provider}
              onChange={(e) => setFormData({...formData, ai_model_provider: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="openai">OpenAI (GPT models)</option>
              <option value="anthropic">Anthropic (Claude models)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose your preferred AI service provider</p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={formData.ai_model}
              onChange={(e) => setFormData({...formData, ai_model: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="gpt-4o">GPT-4O (Recommended)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Specific AI model for prescription analysis</p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Key className="w-4 h-4" />
              API Key
            </label>
            <input
              type="password"
              value={formData.ai_api_key}
              onChange={(e) => setFormData({...formData, ai_api_key: e.target.value})}
              placeholder="sk-proj-..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Your personal OpenAI API key for prescription scanning</p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Analysis Temperature: {formData.ai_temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.ai_temperature}
              onChange={(e) => setFormData({...formData, ai_temperature: parseFloat(e.target.value)})}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Lower values = more consistent results (0.1 recommended for medical)</p>
          </div>

          {/* System Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Instructions
            </label>
            <textarea
              value={formData.ai_system_instructions}
              onChange={(e) => setFormData({...formData, ai_system_instructions: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Custom instructions for AI prescription analysis..."
            />
            <p className="text-xs text-gray-500 mt-1">Custom instructions for AI prescription analysis</p>
          </div>
        </div>

        {/* Error Display */}
        {saveError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{saveError}</span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      </div>

      {/* Usage Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">API Key Security</p>
            <p>Your API key is encrypted and stored securely. Only you can access your AI settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}