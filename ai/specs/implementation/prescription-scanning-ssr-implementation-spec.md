# Prescription Scanning SSR Implementation Specification

**Feature**: `patient__presc__scanning`  
**Date**: 2025-08-28  
**Status**: Implementation Ready  
**Domain**: Patient  
**Group**: Prescriptions (presc)  
**Item**: Scanning  
**Legacy Reference**: `/_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/`

---

## Strategic Approach: Legacy Pattern Adaptation

This specification leverages the **proven working implementation** from the legacy codebase while adapting it to our current Next.js 15 SSR architecture and facade pattern requirements.

### What We're Keeping (Proven Patterns)
- **OpenAI Vision Integration**: Function calling approach that worked perfectly
- **Service Layer Architecture**: `ScanningAnalysisService` and `ScanningStorageService` patterns
- **Camera Hook System**: `useCamera`, `useImageCapture`, `useFileUpload` implementations
- **Two-Phase Workflow**: Analyze → Review → Save fraud prevention model
- **Database Schema**: Current `patient__presc__prescriptions` table (no changes needed)

### What We're Fixing (Architecture Violations)
- **Next.js 15 Compliance**: Async params handling
- **SSR Integration**: Server component wrappers
- **Facade Pattern**: Replace TanStack Query with facade pattern
- **API Design**: Separate analyze/save endpoints
- **Session Recovery**: Browser refresh handling

---

## File Structure & Implementation Plan

### Legacy Code References (Copy & Adapt)
```
LEGACY SOURCE: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/

📋 PROVEN COMPONENTS TO PORT:
├── components/features/scanning/ScanCapture.tsx           → Port with Next.js 15 fixes
├── services/scanning-analysis.ts                        → Port with new API endpoints  
├── services/scanning-storage.ts                         → Port with facade compliance
├── components/templates/CameraCaptureTemplate.tsx       → Check if exists in current app
└── hooks/useCamera.ts, useImageCapture.ts              → Check if exists, adapt to facade
```

### NEW: SSR Implementation Structure
```
app/patient/presc/scanning/
├── page.tsx                           # NEW: Server component wrapper
└── ScanningClient.tsx                 # NEW: Client component (ports legacy ScanCapture)

app/api/patient/presc/scanning/
├── analyze/
│   └── route.ts                       # NEW: Analysis-only endpoint
└── route.ts                          # NEW: Save-only endpoint (GET for history)

lib/services/prescription/
├── scanning-analysis-service.ts       # PORT: From legacy with OpenAI integration
├── scanning-storage-service.ts        # PORT: From legacy with Supabase integration
└── medical-validation-service.ts      # NEW: Medical validation layer

lib/query/patient/presc/
└── scanning.ts                       # NEW: Facade pattern hooks

schemas/patient/presc/
└── scanning.ts                       # NEW: Zod schemas (based on working legacy data structure)

components/features/patient/presc/
├── PrescScanCapture.tsx              # PORT: Legacy ScanCapture with SSR adaptations
├── PrescScanResults.tsx              # PORT: From legacy analysis display
└── PrescScanHistory.tsx              # NEW: History list using ListView pattern

hooks/camera/
├── useCamera.ts                      # PORT: From legacy (check if exists)
├── useImageCapture.ts                # PORT: From legacy (check if exists)  
└── useFileUpload.ts                  # PORT: From legacy (check if exists)
```

---

## Database Integration (No Changes Needed)

### Existing Table: `patient__presc__prescriptions`
**Status**: ✅ PERFECT - All required fields present

**Key Fields for Scanning:**
```sql
-- Core identification
prescription_id UUID PRIMARY KEY
user_id UUID → auth.users(id)

-- Image storage  
image_url TEXT                        -- Prescription scan image path
extracted_text TEXT                   -- Raw OCR text

-- AI extracted patient data
patient_name TEXT
patient_surname TEXT

-- AI extracted doctor data  
dr_name TEXT
dr_surname TEXT
practice_number TEXT

-- AI extracted prescription details
prescription_date DATE
condition_diagnosed TEXT
medications_prescribed JSONB          -- Array of medication objects

-- AI confidence and quality scoring
scan_confidence NUMERIC(5,4)          -- 0.0-1.0 range
ai_confidence_score NUMERIC(5,2)      -- 0-100 range  
scan_quality_score NUMERIC(4,2)       -- 0-100 range
ai_warnings TEXT[]                    -- Processing warnings array

-- AI medical intelligence
inferred_diagnoses JSONB              -- Top 3 diagnoses with confidence
inferred_contraindications TEXT       -- Safety warnings

-- Status management
status TEXT                          -- 'processing', 'completed', 'error', 'pending_review'
submission_status TEXT               -- Pharmacy workflow status
is_active BOOLEAN DEFAULT true       -- Soft delete

-- Audit trail
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
ai_verified_at TIMESTAMPTZ
```

### View Definition (User-Scoped Reads)
```sql
-- v_patient__presc__prescriptions  
CREATE VIEW v_patient__presc__prescriptions AS
SELECT *
FROM patient__presc__prescriptions  
WHERE user_id = auth.uid() 
  AND is_active = true
ORDER BY created_at DESC;
```

---

## API Endpoints Design (Corrected from Legacy)

### 1. Analyze Prescription Image
`POST /api/patient/presc/scanning/analyze`

**Purpose**: Upload image and analyze with AI (no database save)

**Request Body:**
```typescript
{
  file: string,           // Base64 encoded image (legacy pattern that worked)
  fileName: string,       // E.g., "prescription_1693234567890.jpg"  
  fileType: 'image/jpeg' | 'image/png'
}
```

**Response (AI Success):**
```typescript
{
  success: true,
  isPrescription: true,
  data: {
    // Patient information
    patientName: string,
    patientSurname?: string,
    
    // Doctor information
    doctorName: string,
    doctorSurname?: string,
    practiceNumber?: string,
    
    // Prescription details
    issueDate: string,           // YYYY-MM-DD format
    diagnosis?: string,
    
    // Medications array
    medications: Array<{
      name: string,
      dosage: string,
      strength?: string,
      frequency: string,
      timesPerDay?: string,
      duration: string,
      instructions?: string,
      repeats?: number,
      confidence?: number        // Per-medication confidence
    }>,
    
    // AI scoring
    overallConfidence: number,   // 0-100
    scanQuality: number,         // 0-100
    aiWarnings?: string[]
  },
  uploadedPath: string,          // Storage path for save operation
  sessionId: string              // Session recovery identifier
}
```

**Response (AI Not Successful):**
```typescript
{
  success: true,                 // This is still a successful API call
  isPrescription: false,
  reason: string,               // "Could not read prescription"
  detectedType: string,         // "receipt", "document", "unclear", "dog photo"
  fullResponse: string,         // Complete AI response for transparency
  uploadedPath: string,         // Still uploaded for potential retry
  sessionId: string
}
```

### 2. Save Analyzed Prescription  
`POST /api/patient/presc/scanning`

**Purpose**: Save confirmed analysis results to database

**Request Body:**
```typescript
{
  sessionId: string,                     // Links to analysis session
  uploadedPath: string,                  // Image storage path
  userConfirmed: boolean,               // User reviewed and approved
  analysisResult: {                     // Results from analyze endpoint
    patientName: string,
    patientSurname?: string,
    doctorName: string,
    doctorSurname?: string,
    practiceNumber?: string,
    issueDate: string,
    diagnosis?: string,
    medications: ExtractedMedication[],
    overallConfidence: number,
    scanQuality: number,
    aiWarnings?: string[]
  }
}
```

**Response:**
```typescript
{
  success: true,
  prescription: {
    prescription_id: string,
    created_at: string,
    status: 'completed'
  }
}
```

### 3. Get Scanning History
`GET /api/patient/presc/scanning`

**Purpose**: Retrieve user's prescription scan history

**Query Parameters:**
```typescript
page?: number         // Default: 1
pageSize?: number     // Default: 20  
search?: string       // Search patient name, doctor name, medications
```

**Response:**
```typescript
{
  data: Array<{
    prescription_id: string,
    patient_name: string,
    patient_surname?: string,
    dr_name: string,
    dr_surname?: string,
    image_url: string,              // For thumbnail display
    medications_count: number,       // Count of medications
    ai_confidence_score: number,
    created_at: string
  }>,
  total: number,
  page: number,
  pageSize: number
}
```

---

## Proven Legacy Service Layer (Port Exactly)

### OpenAI Analysis Service (WORKING PATTERN)
```typescript
// lib/services/prescription/scanning-analysis-service.ts
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/services/scanning-analysis.ts

export class PrescriptionScanningService {
  private apiKey = process.env.OPENAI_API_KEY

  /**
   * PROVEN: Function calling approach that worked in legacy
   */
  async analyzePrescriptionImage(imageBase64: string): Promise<AnalysisResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',                    // PROVEN: This model worked well
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,          // PORT: Exact prompt from legacy
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this medical prescription image.',
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        functions: [prescriptionExtractionFunction],    // PORT: Exact function def
        function_call: { name: 'extractPrescriptionData' },
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    const result = await response.json()
    const functionCall = result.choices[0]?.message?.function_call
    
    if (!functionCall) {
      throw new Error('No function call in OpenAI response')
    }

    return JSON.parse(functionCall.arguments)
  }
}

/**
 * PROVEN: Function definition that worked in legacy - PORT EXACTLY
 */
const prescriptionExtractionFunction = {
  name: 'extractPrescriptionData',
  description: 'Extract structured data from a medical prescription',
  parameters: {
    type: 'object',
    properties: {
      isPrescription: { type: 'boolean' },
      patientName: { type: 'string' },
      patientSurname: { type: 'string' },
      doctorName: { type: 'string' },
      doctorSurname: { type: 'string' },
      practiceNumber: { type: 'string' },
      issueDate: { type: 'string', description: 'YYYY-MM-DD format' },
      diagnosis: { type: 'string' },
      medications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            strength: { type: 'string' },
            dosage: { type: 'string' },
            frequency: { type: 'string' },
            timesPerDay: { type: 'string' },
            duration: { type: 'string' },
            instructions: { type: 'string' },
            repeats: { type: 'number' },
          }
        }
      },
      detectedType: { type: 'string' },
      confidence: { type: 'number' }
    },
    required: ['isPrescription'],
  },
}
```

### Storage Service (WORKING PATTERN)
```typescript
// lib/services/prescription/scanning-storage-service.ts  
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/services/scanning-storage.ts

export class ScanningStorageService {
  private bucket = 'prescription-images'
  private maxFileSize = 10 * 1024 * 1024 // 10MB - PROVEN limit

  /**
   * PROVEN: Upload pattern that worked - PORT with minimal changes
   */
  async uploadScanImage(imageData: string, userId: string): Promise<string> {
    // PORT: Exact validation logic from legacy
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    if (buffer.length > this.maxFileSize) {
      throw new Error(`File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`)
    }
    
    // PORT: Exact path generation from legacy
    const timestamp = new Date().toISOString().split('T')[0]
    const fileId = crypto.randomUUID()
    const fileType = this.detectImageType(imageData)
    const extension = fileType.split('/')[1]
    const filePath = `${userId}/${timestamp}/${fileId}.${extension}`
    
    // PORT: Exact Supabase upload pattern
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: false,
        cacheControl: '3600'
      })
      
    if (error) throw new Error(error.message)
    return filePath
  }

  /**
   * PROVEN: Image type detection - PORT exactly
   */
  private detectImageType(base64Data: string): string {
    if (base64Data.startsWith('data:image/jpeg')) return 'image/jpeg'
    if (base64Data.startsWith('data:image/png')) return 'image/png'
    if (base64Data.startsWith('data:image/webp')) return 'image/webp'
    
    // PORT: Exact magic byte detection from legacy
    const data = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(data.substring(0, 12), 'base64')
    
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) return 'image/jpeg'
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png'
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && 
        buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
    
    return 'image/jpeg'
  }
}
```

---

## Facade Pattern Hooks (Adapt Legacy TanStack Patterns)

### File: `/lib/query/patient/presc/scanning.ts`
```typescript
// NEW: Facade pattern implementation using legacy API patterns

import { useState, useEffect, useCallback } from 'react'

// Internal state management (no TanStack Query in Phase 1)
const queryCache = new Map<string, any>()

/**
 * Analyze prescription hook (adapts legacy usePrescScanningAnalyze)
 */
export function usePrescScanningAnalyze() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = useCallback(async (input: PrescScanningAnalyzeInput) => {
    setIsPending(true)
    setError(null)
    
    try {
      // PORT: Exact API call pattern from legacy
      const response = await fetch('/api/patient/presc/scanning/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const result = await response.json()
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending, error }
}

/**
 * Save prescription hook (adapts legacy usePrescScanningSave)  
 */
export function usePrescScanningSave() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutateAsync = useCallback(async (input: PrescScanningSaveInput) => {
    setIsPending(true)
    setError(null)
    
    try {
      const response = await fetch('/api/patient/presc/scanning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Save failed')
      }
      
      // Invalidate cache for prescription lists
      queryCache.delete('prescription-list')
      queryCache.delete('prescription-history')
      
      return await response.json()
    } catch (err) {
      setError(err as Error) 
      throw err
    } finally {
      setIsPending(false)
    }
  }, [])

  return { mutateAsync, isPending, error }
}

/**
 * Prescription scanning history (new - uses ListView pattern)
 */
export function usePrescScanningHistory(query: PrescScanningListQuery) {
  const [data, setData] = useState<PrescScanningListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const cacheKey = `prescription-history-${JSON.stringify(query)}`
    
    if (queryCache.has(cacheKey)) {
      setData(queryCache.get(cacheKey))
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: query.page.toString(),
          pageSize: query.pageSize.toString(),
          search: query.search
        })
        
        const response = await fetch(`/api/patient/presc/scanning?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to load scanning history')
        }
        
        const result = await response.json()
        queryCache.set(cacheKey, result)
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [query])

  return { data, isLoading, error }
}
```

---

## SSR Component Architecture

### Server Component Wrapper (NEW)
```typescript
// app/patient/presc/scanning/page.tsx
import { requireUser } from '@/lib/auth/require-user'
import PrescScanningClient from './PrescScanningClient'

export default async function PrescriptionScanningPage() {
  // SSR authentication check
  const user = await requireUser()
  
  // Could fetch recent scans server-side for initial state
  // const recentScans = await getRecentScans(user.id)
  
  return (
    <TilePageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Scan Prescription"
    >
      <PrescScanningClient 
        userId={user.id}
        // initialData={recentScans}
      />
    </TilePageLayoutClient>
  )
}
```

### Client Component (PORT Legacy ScanCapture)
```typescript
// app/patient/presc/scanning/PrescScanningClient.tsx
'use client'

// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/components/features/scanning/ScanCapture.tsx

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// PORT: Exact hook imports from legacy
import { useCamera } from '@/hooks/camera/useCamera'
import { useImageCapture } from '@/hooks/camera/useImageCapture'  
import { useFileUpload } from '@/hooks/camera/useFileUpload'

// NEW: Use facade pattern hooks instead of TanStack Query
import { usePrescScanningAnalyze, usePrescScanningSave } from '@/lib/query/patient/presc/scanning'

interface PrescScanningClientProps {
  userId: string
}

export default function PrescScanningClient({ userId }: PrescScanningClientProps) {
  const router = useRouter()
  
  // PORT: Exact state management from legacy ScanCapture.tsx
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)

  // PORT: Exact hook usage from legacy  
  const {
    stream,
    hasPermission,
    error: cameraError,
    errorType,
    isLoading,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    isBackCamera,
    clearError,
    hasFlash,
    isFlashOn,
    toggleFlash,
  } = useCamera()

  const { isCapturing, captureImage, captureFromFile } = useImageCapture()
  
  // NEW: Use facade hooks instead of TanStack
  const analyzeMutation = usePrescScanningAnalyze()
  const saveMutation = usePrescScanningSave()
  
  // PORT: Exact camera initialization from legacy
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  /**
   * PORT: Exact capture logic from legacy lines 82-104
   */
  const handleCapture = async () => {
    if (capturedImage) return
    if (!videoRef.current) return

    const result = await captureImage(videoRef.current, isBackCamera)
    
    if (result.success && result.imageData) {
      setCapturedImage(result.imageData)
      stopCamera()
    }
  }

  /**
   * PORT: Exact processing logic from legacy lines 212-275
   */
  const handleSubmitForProcessing = async () => {
    if (!capturedImage) return
    
    setIsProcessing(true)
    
    try {
      const fileName = `prescription_${Date.now()}.jpg`
      const result = await analyzeMutation.mutateAsync({
        file: capturedImage,
        fileName,
        fileType: 'image/jpeg'
      })
      
      setAnalysisResult(result)
      setUploadedPath(result.uploadedPath)
      setShowAnalysis(true)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * PORT: Exact save logic from legacy lines 166-207
   */
  const handleSave = async () => {
    if (!analysisResult || !uploadedPath) return
    
    try {
      await saveMutation.mutateAsync({
        sessionId: analysisResult.sessionId,
        uploadedPath,
        userConfirmed: true,
        analysisResult: analysisResult.data
      })
      
      router.push('/patient/presc')  // Return to prescriptions overview
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // PORT: Exact reset logic from legacy
  const handleRetake = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setShowAnalysis(false)
    setUploadedPath(null)
    startCamera()
  }

  // PORT: Exact results display from legacy lines 311-402
  if (showAnalysis && analysisResult) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        {/* PORT: Exact unsuccessful scan template */}
        {!analysisResult.isPrescription && (
          <UnsuccessfulScanTemplate
            reason={analysisResult.reason}
            detectedType={analysisResult.detectedType}
            fullResponse={analysisResult.fullResponse}
            onTryAgain={handleRetake}
            onCancel={() => router.push('/patient/presc')}
          />
        )}
        
        {/* PORT: Exact successful scan display */}
        {analysisResult.isPrescription && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">Review Prescription</h2>
            
            <PrescriptionDetailTemplate
              doctorName={analysisResult.data.doctorName}
              patientName={analysisResult.data.patientName}
              issueDate={analysisResult.data.issueDate}
              diagnosis={analysisResult.data.diagnosis}
              medications={analysisResult.data.medications}
              overallConfidence={analysisResult.data.overallConfidence}
            />
            
            {/* PORT: Exact action buttons */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Prescription'}
              </button>
              <button
                onClick={handleRetake}
                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Retake Photo
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // PORT: Exact camera interface from legacy
  return (
    <CameraCaptureTemplate
      videoRef={videoRef}
      previewImage={capturedImage}
      isLoading={isLoading}
      isProcessing={isProcessing}
      error={cameraError}
      permissionStatus={hasPermission ? 'granted' : 'denied'}
      onCapture={handleCapture}
      onCancel={() => router.push('/patient/presc')}
      onSwitchCamera={switchCamera}
      onRetake={handleRetake}
      onFileUpload={async (file) => {
        const result = await captureFromFile(file)
        if (result.success && result.imageData) {
          setCapturedImage(result.imageData)
          stopCamera()
          clearError()
        }
      }}
      onSubmitForProcessing={handleSubmitForProcessing}
      processingMessage={isProcessing ? 'Analyzing prescription with AI...' : undefined}
    />
  )
}
```

---

## Required Components to Port/Create

### 1. Camera Hooks (Check if exists, else port)
```typescript
// hooks/camera/useCamera.ts
// CHECK: Does this exist in current app? If not, PORT from legacy

// hooks/camera/useImageCapture.ts  
// CHECK: Does this exist in current app? If not, PORT from legacy

// hooks/camera/useFileUpload.ts
// CHECK: Does this exist in current app? If not, PORT from legacy
```

### 2. Template Components (Check if exists)
```typescript
// components/templates/CameraCaptureTemplate.tsx
// CHECK: Does this exist in current app? If not, PORT from legacy

// components/templates/UnsuccessfulScanTemplate.tsx  
// CHECK: Does this exist in current app? If not, PORT from legacy

// components/templates/PrescriptionDetailTemplate.tsx
// CHECK: Does this exist in current app? If not, PORT from legacy
```

### 3. Prescription History (NEW - Use ListView)
```typescript
// components/features/patient/presc/PrescScanHistoryFeature.tsx
export default function PrescScanHistoryFeature() {
  const { data: history } = usePrescScanningHistory({ page: 1, pageSize: 20, search: '' })
  
  const items = history?.data.map(item => ({
    id: item.prescription_id,
    title: `${item.patient_name} ${item.patient_surname || ''}`.trim(),
    letter: item.patient_name[0],
    thirdColumn: item.created_at,
    severity: item.ai_confidence_score < 75 ? 'moderate' : undefined,
    data: item
  })) || []

  return (
    <ListView
      items={items}
      onItemClick={(item) => router.push(`/patient/presc/${item.id}`)}
      searchPlaceholder="Search scanned prescriptions..."
      pageTitle="Scanned Prescriptions"
      thirdColumnLabel="Scanned"
      rightColumns={[
        { 
          key: 'medications_count', 
          label: 'Meds', 
          render: item => `${(item.data as any).medications_count || 0} items`
        },
        {
          key: 'ai_confidence_score',
          label: 'AI Score', 
          render: item => `${(item.data as any).ai_confidence_score || 0}%`
        }
      ]}
    />
  )
}
```

---

## Navigation Integration

### Update Patient Home Config
```typescript
// app/patient/config.ts - ADD to prescriptions tile
{
  id: 'prescriptions',
  title: 'Prescriptions',
  description: 'Scan and manage scripts',
  status: { text: 'You have 2 new quotes!', tone: 'info' as const },
  icon: 'FileText',
  href: '/patient/presc',      // Overview page
  variant: 'default' as const,
  color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
}
```

### Prescriptions Overview (NEW)
```typescript
// app/patient/presc/page.tsx
export default async function PrescriptionsPage() {
  const user = await requireUser()
  
  const prescConfig = {
    title: 'Prescriptions',
    tiles: [
      {
        id: 'scan-prescription',
        title: 'Scan Prescription',
        description: 'Digitize paper prescriptions with AI',
        icon: 'ScanLine',
        href: '/patient/presc/scanning',
        accent: 'rose' as const
      },
      {
        id: 'prescription-history', 
        title: 'Your Prescriptions',
        description: 'View scanned prescription history',
        icon: 'FileText',
        href: '/patient/presc/history',
        accent: 'rose' as const
      }
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Prescriptions"
      tileConfig={prescConfig}
    />
  )
}
```

---

## Zod Schemas (Based on Working Legacy Data)

### File: `/schemas/patient/presc/scanning.ts`
```typescript
import { z } from 'zod'

// Based on legacy medication structure that worked
export const ExtractedMedication = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  strength: z.string().optional(),
  frequency: z.string().min(1, 'Frequency is required'),
  timesPerDay: z.string().optional(),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
  repeats: z.number().min(0).optional(),
  confidence: z.number().min(0).max(100).optional()
})

// Analysis input schema
export const PrescScanningAnalyzeInput = z.object({
  file: z.string().min(1, 'Image file is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['image/jpeg', 'image/png'])
})

// Analysis result schema (matches legacy success response)
export const PrescScanningAnalysisResult = z.object({
  success: z.boolean(),
  isPrescription: z.boolean(),
  
  // Success case data (when isPrescription = true)
  data: z.object({
    patientName: z.string(),
    patientSurname: z.string().optional(),
    doctorName: z.string(),
    doctorSurname: z.string().optional(), 
    practiceNumber: z.string().optional(),
    issueDate: z.string(),
    diagnosis: z.string().optional(),
    medications: z.array(ExtractedMedication),
    overallConfidence: z.number().min(0).max(100),
    scanQuality: z.number().min(0).max(100),
    aiWarnings: z.array(z.string()).optional()
  }).optional(),
  
  // Failure case data (when isPrescription = false)  
  reason: z.string().optional(),
  detectedType: z.string().optional(),
  fullResponse: z.string().optional(),
  
  // Common fields
  uploadedPath: z.string(),
  sessionId: z.string()
})

// Save input schema
export const PrescScanningSaveInput = z.object({
  sessionId: z.string().min(1),
  uploadedPath: z.string().min(1),
  userConfirmed: z.boolean(),
  analysisResult: z.object({
    patientName: z.string(),
    patientSurname: z.string().optional(),
    doctorName: z.string(),
    doctorSurname: z.string().optional(),
    practiceNumber: z.string().optional(),
    issueDate: z.string(),
    diagnosis: z.string().optional(),
    medications: z.array(ExtractedMedication),
    overallConfidence: z.number(),
    scanQuality: z.number(),
    aiWarnings: z.array(z.string()).optional()
  })
})

// List query and response schemas
export const PrescScanningListQuery = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().default('')
})

export const PrescScanningListResponse = z.object({
  data: z.array(z.object({
    prescription_id: z.string(),
    patient_name: z.string(),
    patient_surname: z.string().nullable(),
    dr_name: z.string(),
    dr_surname: z.string().nullable(),
    image_url: z.string(),
    medications_count: z.number(),
    ai_confidence_score: z.number(),
    created_at: z.string()
  })),
  total: z.number(),
  page: z.number(),
  pageSize: z.number()
})

// Export TypeScript types
export type ExtractedMedication = z.infer<typeof ExtractedMedication>
export type PrescScanningAnalyzeInput = z.infer<typeof PrescScanningAnalyzeInput>
export type PrescScanningAnalysisResult = z.infer<typeof PrescScanningAnalysisResult>
export type PrescScanningSaveInput = z.infer<typeof PrescScanningSaveInput>
export type PrescScanningListQuery = z.infer<typeof PrescScanningListQuery>
export type PrescScanningListResponse = z.infer<typeof PrescScanningListResponse>
```

---

## Implementation Checklist

### Phase 1: Component Assessment & Porting (Week 1)
- [ ] **Check existing camera hooks**: Verify if `useCamera`, `useImageCapture`, `useFileUpload` exist
- [ ] **Check existing templates**: Verify if `CameraCaptureTemplate`, `UnsuccessfulScanTemplate` exist  
- [ ] **Port missing components**: Copy from legacy exactly if not found
- [ ] **Create Zod schemas**: Based on working legacy data structure
- [ ] **Create facade hooks**: Replace TanStack Query with facade pattern

### Phase 2: API Implementation (Week 1) 
- [ ] **Create analyze endpoint**: `/api/patient/presc/scanning/analyze`
- [ ] **Create save endpoint**: `/api/patient/presc/scanning`
- [ ] **Port OpenAI service**: Exact function calling pattern from legacy
- [ ] **Port storage service**: Exact upload patterns from legacy
- [ ] **Test API endpoints**: Verify with legacy test script

### Phase 3: SSR Integration (Week 2)
- [ ] **Create server wrapper**: `/app/patient/presc/scanning/page.tsx`
- [ ] **Port client component**: Adapt `ScanCapture.tsx` for SSR
- [ ] **Create overview page**: `/app/patient/presc/page.tsx` with tiles
- [ ] **Create history page**: `/app/patient/presc/history/page.tsx` with ListView
- [ ] **Update navigation**: Add to patient home config and sidebar

### Phase 4: Testing & Validation (Week 2)
- [ ] **Test camera workflow**: Permission handling and capture
- [ ] **Test analysis flow**: Upload → OpenAI → Results display
- [ ] **Test save flow**: Database storage and redirection  
- [ ] **Test error scenarios**: Camera denied, AI failures, network issues
- [ ] **Playwright E2E**: Complete workflow on https://qa.scrypto.online

---

## Critical Success Factors

### 1. **Leverage Legacy Strengths**
- Port the working OpenAI function calling setup exactly
- Keep the proven two-phase workflow (analyze → save)
- Maintain the fraud prevention model (no manual editing)
- Use the same storage and security patterns

### 2. **Fix Architecture Issues** 
- Next.js 15 compliance with async params
- SSR-first rendering with proper server components
- Facade pattern compliance for query management
- Proper REST endpoint separation

### 3. **Maintain Medical Grade Security**
- Row Level Security for all database access
- Private storage with signed URLs  
- User-scoped operations only
- Audit trail for compliance

---

## Testing Strategy

### Legacy Evidence (They Got This Right)
- Test screenshots show working camera interface
- OpenAI integration test script proves API works
- Database schema supports all required fields
- User workflow was intuitive and complete

### Required Testing
```bash
# Test the working legacy API patterns
node /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/test_prescription_api.js

# Test current database schema compatibility
SELECT * FROM patient__presc__prescriptions LIMIT 1;

# Verify storage bucket exists
# Check Supabase console for 'prescription-images' bucket
```

---

## CRITICAL GAPS IDENTIFIED & SOLUTIONS

### Session Management Implementation (MISSING FROM SPEC)
```typescript
// lib/services/prescription/session-service.ts
interface ScanningSession {
  sessionId: string
  userId: string
  status: 'uploading' | 'analyzing' | 'analyzed' | 'saving' | 'completed' | 'failed'
  uploadedPath?: string
  analysisResult?: AnalysisResult
  createdAt: string
  expiresAt: string        // 2 hour timeout
  retryCount: number
  costAccumulated: number  // Track OpenAI costs per session
}

export class ScanningSessionService {
  // Store in Redis or database table for persistence
  async createSession(userId: string): Promise<string>
  async getSession(sessionId: string): Promise<ScanningSession | null>
  async updateSession(sessionId: string, updates: Partial<ScanningSession>): Promise<void>
  async cleanupExpiredSessions(): Promise<void>
}
```

### Medical Validation Rules (DETAILED IMPLEMENTATION)
```typescript
// lib/services/prescription/medical-validation-service.ts
export class MedicalValidationService {
  // Dosage limit tables - CRITICAL for patient safety
  private readonly DOSAGE_LIMITS = {
    'paracetamol': { max_daily: 4000, units: 'mg', warning_threshold: 3000 },
    'ibuprofen': { max_daily: 2400, units: 'mg', warning_threshold: 1800 },
    'aspirin': { max_daily: 4000, units: 'mg', contraindications: ['age_under_16'] },
    'codeine': { max_daily: 240, units: 'mg', controlled_substance: true }
  }

  validateDosage(medication: string, dosage: string): ValidationResult {
    const limits = this.DOSAGE_LIMITS[medication.toLowerCase()]
    if (!limits) return { valid: true, warnings: [`Unknown medication: ${medication}`] }
    
    const extractedAmount = this.extractDosageAmount(dosage)
    if (extractedAmount > limits.max_daily) {
      return { 
        valid: false, 
        errors: [`Dangerous dosage detected: ${dosage} exceeds safe limit of ${limits.max_daily}${limits.units}`] 
      }
    }
    
    return { valid: true }
  }

  checkPrescriptionAge(issueDate: string): ValidationResult {
    const days = this.daysSince(issueDate)
    if (days > 180) {
      return { valid: false, errors: ['Prescription is over 6 months old'] }
    }
    if (days > 90) {
      return { valid: true, warnings: ['Prescription is over 3 months old'] }
    }
    return { valid: true }
  }

  detectDuplicatePrescription(medications: Medication[], userId: string): Promise<boolean> {
    // Check database for recent prescriptions with same medications
    // Return true if duplicate found within last 30 days
  }
}
```

### OpenAI Cost Control System (CRITICAL FOR PRODUCTION)
```typescript
// lib/services/prescription/cost-control-service.ts
export class OpenAICostControlService {
  private readonly USER_DAILY_LIMIT = 50    // Max $50 per user per day
  private readonly GLOBAL_HOURLY_LIMIT = 1000  // Max $1000 per hour globally

  async checkCostLimits(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const userDailyCost = await this.getUserDailyCost(userId)
    const globalHourlyCost = await this.getGlobalHourlyCost()
    
    if (userDailyCost > this.USER_DAILY_LIMIT) {
      return { allowed: false, reason: 'Daily cost limit exceeded' }
    }
    
    if (globalHourlyCost > this.GLOBAL_HOURLY_LIMIT) {
      return { allowed: false, reason: 'System busy, try again later' }
    }
    
    return { allowed: true }
  }

  async trackOpenAICost(userId: string, tokensUsed: number, model: string): Promise<void> {
    const cost = this.calculateCost(tokensUsed, model)
    await this.recordCost(userId, cost, { tokens: tokensUsed, model })
  }
}
```

---

## COMPREHENSIVE AUTOMATIC TEST SUITES

### Prescription Scanning Automatic Tests

#### 1. Generative Medical Data Testing
```typescript
// tests/automatic/prescription-scanning/generative-tests.spec.ts
import { test, expect } from '@playwright/test'
import { generateMedicalTestCases, generateDangerousScenarios } from './test-generators'

test.describe('Prescription Scanning - Generative Tests', () => {
  const testCases = generateMedicalTestCases(1000) // Generate 1000 test cases
  
  testCases.forEach((testCase, index) => {
    test(`Generated prescription test ${index + 1}: ${testCase.type}`, async ({ page }) => {
      await page.goto('/patient/presc/scanning')
      
      // Upload generated test image
      await page.setInputFiles('[data-testid="file-input"]', testCase.imageFile)
      await page.click('[data-testid="submit-processing"]')
      
      // Verify expected behavior based on test case type
      if (testCase.shouldSucceed) {
        await expect(page.locator('[data-testid="analysis-success"]')).toBeVisible()
        await expect(page.locator('[data-testid="confidence-score"]')).toContainText(
          new RegExp(`[${testCase.expectedConfidenceRange}]`)
        )
      } else {
        await expect(page.locator('[data-testid="analysis-failure"]')).toBeVisible()
        await expect(page.locator('[data-testid="failure-reason"]')).toContainText(testCase.expectedReason)
      }
    })
  })
})

// Test generator functions
function generateMedicalTestCases(count: number) {
  const cases = []
  for (let i = 0; i < count; i++) {
    cases.push({
      type: randomChoice(['clear_prescription', 'blurry_prescription', 'non_prescription', 'dangerous_dosage']),
      imageFile: generateTestImage(type),
      shouldSucceed: type !== 'non_prescription',
      expectedConfidenceRange: getExpectedConfidence(type),
      expectedReason: type === 'non_prescription' ? 'Not a prescription' : null
    })
  }
  return cases
}
```

#### 2. Session Recovery Chaos Testing
```typescript
// tests/automatic/prescription-scanning/chaos-tests.spec.ts
test.describe('Prescription Scanning - Chaos Engineering', () => {
  test('Session recovery under random interruptions', async ({ page }) => {
    const interruptionPoints = [
      'after_upload_before_analysis',
      'during_openai_processing', 
      'after_analysis_before_save',
      'during_database_save'
    ]
    
    for (const point of interruptionPoints) {
      await page.goto('/patient/presc/scanning')
      await uploadTestPrescription(page)
      
      // Interrupt at specific point
      await interruptAt(point, page)
      
      // Refresh browser
      await page.reload()
      
      // Verify session recovery
      await expect(page.locator('[data-testid="session-recovered"]')).toBeVisible()
      await expect(page.locator('[data-testid="resume-analysis"]')).toBeEnabled()
      
      // Complete the workflow
      await page.click('[data-testid="resume-analysis"]')
      await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible()
    }
  })
})
```

#### 3. Security Penetration Testing
```typescript
// tests/automatic/prescription-scanning/security-tests.spec.ts
test.describe('Prescription Scanning - Security Tests', () => {
  test('Cannot access other users prescription data', async ({ page, context }) => {
    // Login as user 1
    await loginAs(page, 'user1@test.com', 'password')
    await uploadAndAnalyzePrescription(page)
    const prescriptionId = await page.getAttribute('[data-testid="prescription-id"]', 'value')
    
    // Login as user 2 in new context
    const page2 = await context.newPage()
    await loginAs(page2, 'user2@test.com', 'password')
    
    // Attempt to access user 1's prescription
    await page2.goto(`/patient/presc/${prescriptionId}`)
    await expect(page2.locator('text=Unauthorized')).toBeVisible()
  })

  test('File upload security - reject malicious files', async ({ page }) => {
    const maliciousFiles = [
      'executable.exe.jpg',    // Executable disguised as image
      'script.js',             // JavaScript file
      'oversized-10gb.jpg',    // Extremely large file
      'corrupted-header.jpg'   // Corrupted image header
    ]
    
    for (const fileName of maliciousFiles) {
      await page.goto('/patient/presc/scanning')
      await page.setInputFiles('[data-testid="file-input"]', `tests/malicious/${fileName}`)
      await expect(page.locator('[data-testid="upload-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid file')
    }
  })
})
```

#### 4. Medical Validation Automatic Testing
```typescript
// tests/automatic/prescription-scanning/medical-validation-tests.spec.ts
test.describe('Prescription Scanning - Medical Safety Tests', () => {
  test('Dangerous dosage detection', async ({ page }) => {
    const dangerousScenarios = [
      { medication: 'paracetamol', dosage: '10000mg', expectedError: 'Exceeds safe daily limit' },
      { medication: 'aspirin', dosage: '5000mg', patientAge: 12, expectedError: 'Not suitable for children' },
      { medication: 'warfarin', dosage: '20mg', expectedWarning: 'Blood thinner - monitor carefully' }
    ]
    
    for (const scenario of dangerousScenarios) {
      // Generate mock AI response with dangerous dosage
      await page.route('/api/patient/presc/scanning/analyze', route => {
        route.fulfill({
          json: {
            success: true,
            isPrescription: true,
            data: {
              medications: [{ name: scenario.medication, dosage: scenario.dosage }],
              // ... other prescription data
            }
          }
        })
      })
      
      await page.goto('/patient/presc/scanning')
      await uploadTestImage(page)
      await page.click('[data-testid="submit-processing"]')
      
      // Verify validation catches the dangerous dosage
      if (scenario.expectedError) {
        await expect(page.locator('[data-testid="validation-error"]')).toContainText(scenario.expectedError)
        await expect(page.locator('[data-testid="save-button"]')).toBeDisabled()
      } else if (scenario.expectedWarning) {
        await expect(page.locator('[data-testid="validation-warning"]')).toContainText(scenario.expectedWarning)
        await expect(page.locator('[data-testid="save-button"]')).toBeEnabled()
      }
    }
  })
})
```

### Location Services Automatic Tests

#### 1. Geographic Edge Case Testing
```typescript
// tests/automatic/location-services/geographic-tests.spec.ts
test.describe('Location Services - Geographic Tests', () => {
  test('Location search across South African regions', async ({ page }) => {
    const locationTests = [
      { name: 'Cape Town CBD', lat: -33.9249, lng: 18.4241, expectedResults: '>100' },
      { name: 'Johannesburg CBD', lat: -26.2041, lng: 28.0473, expectedResults: '>150' },
      { name: 'Rural Northern Cape', lat: -28.7282, lng: 24.7499, expectedResults: '<10' },
      { name: 'Border with Botswana', lat: -25.8627, lng: 25.6437, expectedResults: '<5' }
    ]
    
    for (const location of locationTests) {
      // Mock geolocation to specific coordinates
      await page.addInitScript(coords => {
        Object.defineProperty(navigator, 'geolocation', {
          value: {
            getCurrentPosition: (success) => success({
              coords: { latitude: coords.lat, longitude: coords.lng }
            })
          }
        })
      }, location)
      
      await page.goto('/patient/location/find-pharmacies')
      await page.waitForSelector('[data-testid="search-results"]')
      
      const resultCount = await page.locator('[data-testid="result-item"]').count()
      
      // Verify result count matches expectations for the region
      if (location.expectedResults.startsWith('>')) {
        const minResults = parseInt(location.expectedResults.substring(1))
        expect(resultCount).toBeGreaterThan(minResults)
      } else if (location.expectedResults.startsWith('<')) {
        const maxResults = parseInt(location.expectedResults.substring(1))
        expect(resultCount).toBeLessThan(maxResults)
      }
    }
  })
})
```

#### 2. Google Maps API Resilience Testing
```typescript
// tests/automatic/location-services/api-resilience-tests.spec.ts
test.describe('Location Services - API Resilience', () => {
  test('Graceful degradation when Google Maps API fails', async ({ page }) => {
    const failureScenarios = [
      { type: 'invalid_api_key', mockResponse: { error: 'API_KEY_INVALID' } },
      { type: 'quota_exceeded', mockResponse: { error: 'OVER_QUERY_LIMIT' } },
      { type: 'network_timeout', delay: 30000 },
      { type: 'malformed_response', mockResponse: { invalid: 'json' } }
    ]
    
    for (const scenario of failureScenarios) {
      // Mock Google Maps API to return error
      await page.route('**/maps.googleapis.com/**', route => {
        if (scenario.delay) {
          // Simulate timeout
          setTimeout(() => route.abort(), scenario.delay)
        } else {
          route.fulfill({
            status: 400,
            body: JSON.stringify(scenario.mockResponse)
          })
        }
      })
      
      await page.goto('/patient/location/find-pharmacies/map')
      
      // Verify fallback behavior
      await expect(page.locator('[data-testid="maps-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="fallback-list-view"]')).toBeVisible()
      await expect(page.locator('[data-testid="retry-maps"]')).toBeEnabled()
      
      // Test that basic functionality still works without maps
      await page.click('[data-testid="search-input"]')
      await page.fill('[data-testid="search-input"]', 'pharmacy')
      await page.press('[data-testid="search-input"]', 'Enter')
      await expect(page.locator('[data-testid="text-search-results"]')).toBeVisible()
    }
  })
})
```

#### 3. Privacy and Family Tracking Tests
```typescript
// tests/automatic/location-services/privacy-tests.spec.ts
test.describe('Location Services - Privacy Tests', () => {
  test('Family location sharing consent workflow', async ({ page, context }) => {
    // Test user (parent)
    await loginAs(page, 'parent@test.com', 'password')
    await page.goto('/patient/location/find-loved-ones')
    
    // Invite family member
    await page.click('[data-testid="invite-family"]')
    await page.fill('[data-testid="family-email"]', 'child@test.com')
    await page.click('[data-testid="send-invite"]')
    
    // Family member (child) receives invitation
    const childPage = await context.newPage()
    await loginAs(childPage, 'child@test.com', 'password')
    await childPage.goto('/patient/location/invitations')
    
    // Test consent scenarios
    const consentScenarios = ['accept', 'decline', 'accept_then_revoke']
    
    for (const scenario of consentScenarios) {
      if (scenario === 'accept' || scenario === 'accept_then_revoke') {
        await childPage.click('[data-testid="accept-sharing"]')
        await expect(page.locator('[data-testid="family-member-active"]')).toBeVisible()
        
        if (scenario === 'accept_then_revoke') {
          await childPage.click('[data-testid="revoke-sharing"]')
          await expect(page.locator('[data-testid="family-member-inactive"]')).toBeVisible()
        }
      } else {
        await childPage.click('[data-testid="decline-sharing"]')
        await expect(page.locator('[data-testid="invitation-declined"]')).toBeVisible()
      }
    }
  })
})
```

#### 4. Performance and Load Testing
```typescript
// tests/automatic/location-services/performance-tests.spec.ts
test.describe('Location Services - Performance Tests', () => {
  test('Map performance with large result sets', async ({ page }) => {
    // Mock API to return 500+ pharmacy results
    await page.route('/api/patient/location/pharmacies', route => {
      const mockPharmacies = Array.from({ length: 500 }, (_, i) => ({
        pharmacy_id: `pharmacy_${i}`,
        name: `Test Pharmacy ${i}`,
        latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
        longitude: 28.0473 + (Math.random() - 0.5) * 0.1,
        chain_name: ['Clicks', 'Dis-Chem', 'Pick n Pay'][i % 3]
      }))
      
      route.fulfill({ json: { data: mockPharmacies } })
    })
    
    await page.goto('/patient/location/find-pharmacies/map')
    
    // Measure performance metrics
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="map-loaded"]')
    const loadTime = Date.now() - startTime
    
    // Verify performance requirements
    expect(loadTime).toBeLessThan(5000) // Map should load within 5 seconds
    
    // Test interaction performance
    const searchStart = Date.now()
    await page.fill('[data-testid="search-input"]', 'clicks')
    await page.waitForSelector('[data-testid="filtered-results"]')
    const searchTime = Date.now() - searchStart
    
    expect(searchTime).toBeLessThan(1000) // Search should complete within 1 second
  })
})
```

### 5. Medical Compliance Automatic Testing
```typescript
// tests/automatic/shared/compliance-tests.spec.ts
test.describe('Medical Compliance - Automated Auditing', () => {
  test('Audit trail completeness', async ({ page }) => {
    await page.goto('/patient/presc/scanning')
    await uploadTestPrescription(page)
    await analyzeAndSave(page)
    
    // Verify audit trail was created
    const auditResponse = await page.request.get('/api/admin/audit-log', {
      headers: { 'Authorization': 'Bearer admin_token' }
    })
    const auditData = await auditResponse.json()
    
    // Check required audit fields
    const latestAudit = auditData.data[0]
    expect(latestAudit).toMatchObject({
      action_type: 'prescription_scan_save',
      user_id: expect.any(String),
      ai_confidence: expect.any(Number),
      processing_time_ms: expect.any(Number),
      outcome: 'success'
    })
  })

  test('Data retention policy compliance', async ({ page }) => {
    // Test that old prescription images are automatically cleaned up
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 91) // 91 days ago
    
    // Create old prescription record
    await createOldPrescriptionRecord(oldDate)
    
    // Run cleanup job
    await page.request.post('/api/admin/cleanup-old-data')
    
    // Verify old images are deleted but prescription data remains
    const prescriptions = await getAllPrescriptions()
    const oldPrescription = prescriptions.find(p => p.created_at < oldDate)
    
    expect(oldPrescription.image_url).toBeNull() // Image deleted
    expect(oldPrescription.medications_prescribed).toBeTruthy() // Data preserved
  })
})
```

### 6. Cost Control and Monitoring Tests  
```typescript
// tests/automatic/prescription-scanning/cost-control-tests.spec.ts
test.describe('Prescription Scanning - Cost Control', () => {
  test('OpenAI cost limits prevent abuse', async ({ page }) => {
    // Simulate user hitting daily cost limit
    await simulateHighAPIUsage('user@test.com', 55) // $55 in API costs
    
    await page.goto('/patient/presc/scanning')
    await uploadTestPrescription(page)
    await page.click('[data-testid="submit-processing"]')
    
    // Should be rejected due to cost limits
    await expect(page.locator('[data-testid="cost-limit-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('daily limit')
  })

  test('Global rate limiting protects system', async ({ browser }) => {
    // Create 10 concurrent users
    const pages = await Promise.all(
      Array.from({ length: 10 }, () => browser.newPage())
    )
    
    // All try to analyze prescriptions simultaneously
    const analysisPromises = pages.map(async (page, index) => {
      await loginAs(page, `user${index}@test.com`, 'password')
      await page.goto('/patient/presc/scanning')
      await uploadTestPrescription(page)
      return page.click('[data-testid="submit-processing"]')
    })
    
    await Promise.all(analysisPromises)
    
    // Some should succeed, some should be rate limited
    const successCount = await countSuccessfulAnalyses(pages)
    const rateLimitCount = await countRateLimitedAnalyses(pages)
    
    expect(successCount).toBeLessThan(10) // Not all should succeed
    expect(rateLimitCount).toBeGreaterThan(0) // Some should be rate limited
  })
})
```

### 7. Continuous Integration Test Pipeline
```yaml
# .github/workflows/medical-features-tests.yml
name: Medical Features Automated Testing

on: [push, pull_request, schedule]

jobs:
  prescription-scanning-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Prescription Scanning Tests
        run: |
          npm run test:prescription-scanning:generative
          npm run test:prescription-scanning:chaos  
          npm run test:prescription-scanning:security
          npm run test:prescription-scanning:medical-validation
          
  location-services-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Location Services Tests
        run: |
          npm run test:location:geographic-edge-cases
          npm run test:location:api-resilience
          npm run test:location:privacy-compliance
          npm run test:location:performance-load
          
  medical-compliance-audit:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' # Weekly compliance check
    steps:
      - uses: actions/checkout@v4
      - name: Run Medical Compliance Audit
        run: |
          npm run test:compliance:audit-trail
          npm run test:compliance:data-retention
          npm run test:compliance:privacy-controls
```

---

**ENHANCED SPECIFICATIONS STATUS:**

Both specifications have been thoroughly reviewed and enhanced with:
- **Critical gap analysis**: Session management, medical validation, cost controls
- **Comprehensive automatic test suites**: 6 categories of automated tests per feature
- **Medical compliance testing**: Automated auditing for regulatory requirements
- **Security penetration testing**: Automated attempts to break authentication and data access
- **Performance load testing**: Automated stress testing with realistic usage patterns

The automatic test cases are designed to run continuously and catch issues that manual testing would miss, which is essential for medical software where failures could impact patient safety.