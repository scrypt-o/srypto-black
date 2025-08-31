'use client'

import * as React from 'react'
import { useState } from 'react'
import clsx from 'clsx'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Edit3,
  Eye,
  Save,
  X,
  ZoomIn,
  Move,
  RotateCw,
  AlertCircle,
  FileImage,
  Clock,
  User,
  Pill,
  Brain,
  ShieldAlert
} from 'lucide-react'

/** Types */
interface PrescriptionWorkflow {
  workflow_id: string
  patient: {
    name: string
    surname: string
    id_number: string
    medical_aid: string
    medical_aid_number: string
    allergies: string[]
    chronic_conditions: string[]
    age: number
    gender: string
  }
  prescriber: {
    name: string
    practice_number: string
    phone?: string
  }
  prescription: {
    date: string
    diagnosis?: string
    image_url: string
    ai_confidence: number
    scan_quality: number
  }
  medications: Medication[]
  ai_sentry: {
    contraindications: string[]
    drug_interactions: string[]
    warnings: string[]
    confidence_flags: string[]
  }
  workflow_status: string
  created_at: string
}

interface Medication {
  id: string
  name: string
  strength: string
  dosage_form: string
  quantity: number
  days_supply: number
  instructions: string
  generic_available: boolean
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
  confidence: number
  warnings: string[]
  notes?: string
}

/** Mock Data */
const mockWorkflowData: PrescriptionWorkflow = {
  workflow_id: 'wf-2025-001',
  patient: {
    name: 'Jane',
    surname: 'Smith',
    id_number: '8205050088083',
    medical_aid: 'Discovery Health Medical Scheme',
    medical_aid_number: 'DH1234567890',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronic_conditions: ['Hypertension', 'Type 2 Diabetes'],
    age: 42,
    gender: 'Female'
  },
  prescriber: {
    name: 'Dr. Sarah Adams',
    practice_number: 'PR12345',
    phone: '+27-11-123-4567'
  },
  prescription: {
    date: '2025-08-31',
    diagnosis: 'Hyperlipidemia, Hypertension management',
    image_url: '/mock-prescription.jpg',
    ai_confidence: 92,
    scan_quality: 87
  },
  medications: [
    {
      id: 'med-1',
      name: 'Atorvastatin',
      strength: '20mg',
      dosage_form: 'Tablet',
      quantity: 28,
      days_supply: 28,
      instructions: 'Take 1 tablet daily with evening meal',
      generic_available: true,
      stock_status: 'in_stock',
      confidence: 95,
      warnings: [],
      notes: ''
    },
    {
      id: 'med-2', 
      name: 'Metformin',
      strength: '500mg',
      dosage_form: 'Tablet',
      quantity: 56,
      days_supply: 28,
      instructions: 'Take 1 tablet twice daily with meals',
      generic_available: true,
      stock_status: 'in_stock',
      confidence: 92,
      warnings: [],
      notes: ''
    },
    {
      id: 'med-3',
      name: 'Lisinopril',
      strength: '10mg', 
      dosage_form: 'Tablet',
      quantity: 14,
      days_supply: 14,
      instructions: 'Take 1 tablet daily in the morning',
      generic_available: false,
      stock_status: 'low_stock',
      confidence: 88,
      warnings: ['Monitor blood pressure'],
      notes: ''
    }
  ],
  ai_sentry: {
    contraindications: ['Patient has diabetes - monitor Lisinopril dosage'],
    drug_interactions: ['No significant interactions detected'],
    warnings: ['Verify patient allergy status before dispensing'],
    confidence_flags: ['Low stock warning on Lisinopril', 'Generic substitution available for Atorvastatin']
  },
  workflow_status: 'reviewing',
  created_at: '2025-08-31T08:30:00Z'
}

/** Components */
interface PharmacyValidationWorkstationProps {
  workflowId: string
  data?: PrescriptionWorkflow
}

export default function PharmacyValidationWorkstation({ 
  workflowId,
  data = mockWorkflowData 
}: PharmacyValidationWorkstationProps) {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<string | null>(null)
  const [medicationNotes, setMedicationNotes] = useState<Record<string, string>>({})

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800 border-green-200'
    if (confidence >= 70) return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <div className="w-3 h-3 bg-green-500 rounded-full" />
      case 'low_stock': return <div className="w-3 h-3 bg-amber-500 rounded-full" />
      case 'out_of_stock': return <div className="w-3 h-3 bg-red-500 rounded-full" />
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const handleMedicationEdit = (medId: string, field: string, value: any) => {
    // Update medication data
    console.log('Update medication', medId, field, value)
  }

  const handleSaveValidation = () => {
    // Save validation and proceed to next step
    console.log('Save validation for workflow:', workflowId)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Prescription Validation - {workflowId}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(data.created_at).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {data.patient.name} {data.patient.surname}
            </span>
            <span className={clsx(
              'px-2 py-1 rounded text-xs font-medium',
              data.workflow_status === 'reviewing' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
            )}>
              {data.workflow_status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx(
            'px-3 py-1 rounded text-sm font-medium border',
            getConfidenceColor(data.prescription.ai_confidence)
          )}>
            AI: {data.prescription.ai_confidence}%
          </span>
          <button 
            onClick={handleSaveValidation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Validate & Continue
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Section - Patient & Prescription Info */}
        <div className="grid grid-cols-4 gap-6">
          
          {/* Patient Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              PATIENT DETAILS
            </h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {data.patient.name} {data.patient.surname}</div>
              <div><span className="font-medium">ID:</span> {data.patient.id_number}</div>
              <div><span className="font-medium">Age/Gender:</span> {data.patient.age}Y {data.patient.gender}</div>
              <div><span className="font-medium">Medical Aid:</span> {data.patient.medical_aid}</div>
              <div><span className="font-medium">Number:</span> {data.patient.medical_aid_number}</div>
              
              {data.patient.allergies.length > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="font-medium text-red-600">Allergies:</span>
                  <ul className="mt-1 text-red-600">
                    {data.patient.allergies.map((allergy, idx) => (
                      <li key={idx} className="text-xs">• {allergy}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.patient.chronic_conditions.length > 0 && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="font-medium text-amber-600">Chronic:</span>
                  <ul className="mt-1 text-amber-600">
                    {data.patient.chronic_conditions.map((condition, idx) => (
                      <li key={idx} className="text-xs">• {condition}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Script Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              SCRIPT INFORMATION
            </h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Prescriber:</span> {data.prescriber.name}</div>
              <div><span className="font-medium">Practice:</span> {data.prescriber.practice_number}</div>
              <div><span className="font-medium">Phone:</span> {data.prescriber.phone || 'Not provided'}</div>
              <div><span className="font-medium">Date:</span> {data.prescription.date}</div>
              <div><span className="font-medium">Diagnosis:</span> {data.prescription.diagnosis || 'Not specified'}</div>
              
              <div className="pt-2 border-t border-green-200">
                <button
                  onClick={() => setImageModalOpen(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FileImage className="w-4 h-4" />
                  View Prescription Image
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              ADDITIONAL INFO
            </h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Scan Quality:</span> {data.prescription.scan_quality}%</div>
              <div><span className="font-medium">Total Items:</span> {data.medications.length}</div>
              <div><span className="font-medium">Processing Time:</span> 2.3 min</div>
              
              <div className="pt-2 border-t border-purple-200">
                <div className="text-xs text-gray-600">
                  <div>Created: {new Date(data.created_at).toLocaleTimeString()}</div>
                  <div>Workflow: {workflowId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Sentry */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI SENTRY
            </h3>
            <div className="space-y-3 text-sm">
              
              {data.ai_sentry.contraindications.length > 0 && (
                <div>
                  <div className="font-medium text-red-700 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Contraindications:
                  </div>
                  <ul className="mt-1 text-red-600 text-xs space-y-1">
                    {data.ai_sentry.contraindications.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.ai_sentry.warnings.length > 0 && (
                <div>
                  <div className="font-medium text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Warnings:
                  </div>
                  <ul className="mt-1 text-amber-600 text-xs space-y-1">
                    {data.ai_sentry.warnings.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {data.ai_sentry.confidence_flags.length > 0 && (
                <div>
                  <div className="font-medium text-blue-700 text-xs">Flags:</div>
                  <ul className="mt-1 text-blue-600 text-xs space-y-1">
                    {data.ai_sentry.confidence_flags.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Medications Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="w-5 h-5" />
              MEDICATIONS ({data.medications.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-sm font-medium text-gray-700">
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Medication</th>
                  <th className="px-4 py-3">Strength</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Instructions</th>
                  <th className="px-4 py-3">Generic</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.medications.map((medication, index) => (
                  <tr key={medication.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStockStatusIcon(medication.stock_status)}
                        <span className="text-xs text-gray-600">
                          {medication.stock_status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{medication.name}</div>
                      <div className="text-sm text-gray-500">{medication.dosage_form}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{medication.strength}</td>
                    <td className="px-4 py-3">
                      {editingMedication === medication.id ? (
                        <input
                          type="number"
                          value={medication.quantity}
                          onChange={(e) => handleMedicationEdit(medication.id, 'quantity', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm">{medication.quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{medication.days_supply}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm max-w-xs truncate" title={medication.instructions}>
                        {medication.instructions}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {medication.generic_available ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex items-center px-2 py-1 rounded text-xs font-medium border',
                        getConfidenceColor(medication.confidence)
                      )}>
                        {medication.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingMedication(
                            editingMedication === medication.id ? null : medication.id
                          )}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedMedication(medication)}
                          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Medication Detail Modal */}
      {selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Medication Details - {selectedMedication.name}
              </h3>
              <button
                onClick={() => setSelectedMedication(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={selectedMedication.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength
                  </label>
                  <input
                    type="text"
                    value={selectedMedication.strength}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={selectedMedication.instructions}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacist Notes
                </label>
                <textarea
                  value={medicationNotes[selectedMedication.id] || ''}
                  onChange={(e) => setMedicationNotes(prev => ({
                    ...prev,
                    [selectedMedication.id]: e.target.value
                  }))}
                  placeholder="Add notes about this medication..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {selectedMedication.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <h4 className="font-medium text-amber-800 mb-2">Warnings</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    {selectedMedication.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedMedication(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save medication changes
                  setSelectedMedication(null)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-gray-900 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-semibold">Prescription Image - {workflowId}</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white hover:bg-gray-700 rounded">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:bg-gray-700 rounded">
                  <Move className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:bg-gray-700 rounded">
                  <RotateCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="p-2 text-white hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-gray-100 flex items-center justify-center min-h-[500px]">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="w-96 h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                  <div className="text-center text-gray-500">
                    <FileImage className="w-12 h-12 mx-auto mb-2" />
                    <div>Prescription Image</div>
                    <div className="text-sm">{workflowId}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}