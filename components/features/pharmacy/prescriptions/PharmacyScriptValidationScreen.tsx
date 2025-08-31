'use client'

import * as React from 'react'
import { useState } from 'react'
import clsx from 'clsx'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Edit3,
  MessageSquare,
  Save,
  X,
  Send
} from 'lucide-react'

/** Mock Data Types */
type PrescriptionWorkflowData = {
  workflow_id: string
  original_prescription_id: string
  workflow_status: 'submitted' | 'allocated' | 'accepted' | 'reviewing' | 'verified' | 'quoted'
  assigned_pharmacy_id: string
  
  // From original prescription
  patient_name: string
  patient_surname: string
  patient_id: string
  medical_aid: string
  medical_aid_number: string
  
  prescriber_name: string
  prescriber_practice: string
  prescriber_phone?: string
  
  medications: MedicationData[]
  image_url: string
  ai_confidence_score: number
  scan_quality_score: number
  
  created_at: string
  assigned_at: string
}

type MedicationData = {
  name: string
  dosage: string
  quantity: number
  days_supply: number
  instructions: string
  generic_available: boolean
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  confidence: number
}

type ValidationNote = {
  id: string
  field: string
  original_value: string
  corrected_value: string
  note: string
  timestamp: string
}

/** Mock Data */
const mockPrescriptionData: PrescriptionWorkflowData = {
  workflow_id: 'wf-2025-001',
  original_prescription_id: 'SC2025-001',
  workflow_status: 'reviewing',
  assigned_pharmacy_id: 'pharmacy-123',
  
  patient_name: 'Jane',
  patient_surname: 'Smith', 
  patient_id: '8205050088083',
  medical_aid: 'Discovery Health',
  medical_aid_number: '1234567890',
  
  prescriber_name: 'Dr. Adams',
  prescriber_practice: 'PR12345',
  prescriber_phone: '+27-11-123-4567',
  
  medications: [
    {
      name: 'Atorvastatin 20mg',
      dosage: '20mg',
      quantity: 28,
      days_supply: 28,
      instructions: '1 daily after supper',
      generic_available: true,
      stock_status: 'in_stock',
      confidence: 95
    },
    {
      name: 'Metformin 500mg',
      dosage: '500mg', 
      quantity: 56,
      days_supply: 28,
      instructions: '2 daily with meals',
      generic_available: true,
      stock_status: 'in_stock',
      confidence: 92
    },
    {
      name: 'Lisinopril 10mg',
      dosage: '10mg',
      quantity: 14,
      days_supply: 14,
      instructions: '1 daily in morning',
      generic_available: false,
      stock_status: 'low_stock',
      confidence: 88
    }
  ],
  
  image_url: '/mock-prescription-image.jpg',
  ai_confidence_score: 92,
  scan_quality_score: 87,
  
  created_at: '2025-08-31T08:30:00Z',
  assigned_at: '2025-08-31T09:15:00Z'
}

/** Components */
interface PharmacyScriptValidationScreenProps {
  workflowData?: PrescriptionWorkflowData
}

export default function PharmacyScriptValidationScreen({ 
  workflowData = mockPrescriptionData 
}: PharmacyScriptValidationScreenProps) {
  const [imageZoom, setImageZoom] = useState(100)
  const [validationNotes, setValidationNotes] = useState<ValidationNote[]>([])
  const [pharmacyNotes, setPharmacyNotes] = useState('')
  const [currentAction, setCurrentAction] = useState<'reviewing' | 'verified' | 'clarification' | 'reject'>('reviewing')

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50'
    if (confidence >= 70) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-50'
      case 'low_stock': return 'text-amber-600 bg-amber-50'
      case 'out_of_stock': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Prescription Review - Script #{workflowData.original_prescription_id}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                <span>Patient: {workflowData.patient_name} {workflowData.patient_surname}</span>
                <span>•</span>
                <span>Dr: {workflowData.prescriber_name}</span>
                <span>•</span>
                <span>Status: 
                  <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {workflowData.workflow_status}
                  </span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={clsx(
                'px-2 py-1 text-xs font-medium rounded-full',
                getConfidenceColor(workflowData.ai_confidence_score)
              )}>
                AI Confidence: {workflowData.ai_confidence_score}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-120px)]">
        
        {/* Left Panel - Original Image */}
        <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Original Image</h2>
            
            {/* Image Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setImageZoom(Math.min(200, imageZoom + 25))}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setImageZoom(Math.max(50, imageZoom - 25))}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                <Move className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                <RotateCw className="w-4 h-4" />
              </button>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                Zoom: {imageZoom}%
              </span>
            </div>
          </div>
          
          {/* Image Viewer */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8"
              style={{ transform: `scale(${imageZoom / 100})` }}
            >
              <div className="w-96 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  [Mock Prescription Image]<br/>
                  {workflowData.original_prescription_id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Extracted Data */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 overflow-auto">
            
            {/* Patient Information */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">👤 PATIENT INFORMATION</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {workflowData.patient_name} {workflowData.patient_surname}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {workflowData.patient_id}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medical Aid <AlertTriangle className="inline w-4 h-4 text-amber-500 ml-1" />
                  </label>
                  <div className="flex">
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      {workflowData.medical_aid}
                    </div>
                    <button className="px-3 py-2 bg-blue-50 border border-l-0 border-gray-300 rounded-r-md text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-gray-600 dark:text-blue-300">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {workflowData.medical_aid_number}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescriber Information */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">🏥 PRESCRIBER</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dr <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {workflowData.prescriber_name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Practice <CheckCircle className="inline w-4 h-4 text-green-500 ml-1" />
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {workflowData.prescriber_practice}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone <span className="text-gray-400">[Not detected]</span>
                  </label>
                  <div className="flex">
                    <input 
                      type="text"
                      placeholder="Add phone number"
                      className="px-3 py-2 bg-white border border-gray-300 rounded-l-md flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      defaultValue={workflowData.prescriber_phone}
                    />
                    <button className="px-3 py-2 bg-blue-50 border border-l-0 border-gray-300 rounded-r-md text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-gray-600 dark:text-blue-300">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">💊 MEDICATIONS</h3>
              </div>
              
              <div className="space-y-4">
                {workflowData.medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Med {index + 1}: {med.name} 
                          <CheckCircle className="inline w-4 h-4 text-green-500 ml-2" />
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-300">
                          <span>Qty: {med.quantity} <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" /></span>
                          <span>Days: {med.days_supply} <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" /></span>
                          <span className={clsx('px-2 py-1 text-xs rounded-full', getConfidenceColor(med.confidence))}>
                            {med.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Instructions:</span>
                        <div className="text-gray-900 dark:text-white">{med.instructions} <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" /></div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Stock Status:</span>
                        <div className={clsx('inline-flex items-center gap-1 ml-2 px-2 py-1 text-xs rounded-full', getStockStatusColor(med.stock_status))}>
                          {med.stock_status === 'in_stock' && '🟢'}
                          {med.stock_status === 'low_stock' && '🟡'}
                          {med.stock_status === 'out_of_stock' && '🔴'}
                          {med.stock_status.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">Generic Available:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {med.generic_available ? 'Yes' : 'No'} 
                          {med.generic_available && <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs">⚙️</button>}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Communication */}
            <div className="bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">💬 NOTES & COMMUNICATION</h3>
              </div>
              
              <textarea
                placeholder="Add pharmacy notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                value={pharmacyNotes}
                onChange={(e) => setPharmacyNotes(e.target.value)}
              />
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📤 Message to Patient:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option>Select template message...</option>
                  <option>Prescription verified - ready to process</option>
                  <option>Need clarification on medication</option>
                  <option>Alternative medication suggested</option>
                  <option>Prescription cannot be filled</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Action Bar - Sticky Bottom */}
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">
                Save Draft
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentAction('reject')}
                  className="px-4 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-md dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  Reject
                </button>
                <button 
                  onClick={() => setCurrentAction('clarification')}
                  className="px-4 py-2 text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-md dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
                >
                  Request Clarification
                </button>
                <button 
                  onClick={() => setCurrentAction('verified')}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Confirm All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}