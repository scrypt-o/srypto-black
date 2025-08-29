# Prescription Scanning System - Comprehensive Specification

**Feature**: `patient__presc__scanning`  
**Date**: 2025-08-26  
**Status**: Specification  
**Domain**: Patient  
**Group**: Prescriptions (presc)  
**Item**: Scanning  

---

## Table of Contents
1. [Overview](#overview)
2. [User Journey](#user-journey)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Zod Schemas](#zod-schemas)
7. [Hooks (TanStack Query)](#hooks-tanstack-query)
8. [Components & Pages](#components--pages)
9. [Security & Validation](#security--validation)
10. [Testing Requirements](#testing-requirements)
11. [Configuration](#configuration)
12. [Implementation Checklist](#implementation-checklist)

---

## Overview

### Purpose
The Prescription Scanning System allows patients to digitize paper prescriptions using device camera or file upload, leveraging AI-powered OCR for data extraction and secure storage.

### Key Features
- Real-time camera capture with CameraCaptureTemplate
- File upload fallback for accessibility
- OpenAI Vision API integration for prescription analysis
- Two-stage processing (analyze → save) with user confirmation
- Fraud prevention (no manual editing allowed)
- Secure image storage with Row Level Security
- Prescription history management

### Business Rules
1. **No Editing Policy**: Extracted data cannot be manually edited (prevents prescription fraud)
2. **Two Valid AI Outcomes**: Success or "Not Successful" (both are valid, not errors)
3. **User Confirmation Required**: Analysis results must be reviewed before saving
4. **Security First**: All operations require authentication and user scoping
5. **Audit Trail**: All scanning attempts are logged for compliance

---

## User Journey

### Navigation Flow
```
Home → Prescriptions Tile → Prescriptions Overview → Scan Script
Alternative: Sidebar → Prescriptions → Scan Prescription
```

### Complete Workflow

#### Step 1: Navigation
- User navigates to `/patient/presc/scanning`
- Camera permission requested (if first time)

#### Step 2: Image Capture
**Path A: Camera Allowed**
- Live camera preview displayed
- User captures prescription image
- Camera stream stopped

**Path B: Camera Denied/Unavailable**
- File upload interface shown
- User selects image file
- File validated and loaded

#### Step 3: Image Preview
- Captured/uploaded image displayed
- User options:
  - **Submit for Processing**: Continue to AI analysis
  - **Retake/Re-select**: Start over

#### Step 4: AI Processing
- Loading state: "Analyzing prescription..."
- Image uploaded to secure storage
- OpenAI Vision API processes image
- Results returned to user interface

#### Step 5: Results Display
**Outcome A: AI Success**
- Structured prescription data displayed:
  - Patient information (name, surname)
  - Doctor information (name, practice number)
  - Prescription date and diagnosis
  - Medications with dosage, frequency, duration
- User options: **Save** or **Re-scan**

**Outcome B: AI Not Successful**
- "Could not read your scan" message
- Full AI response shown for transparency
- User options: **Scan Again** or **Cancel**

#### Step 6: Final Action
- **If Save**: Data stored to database → Redirect to prescription list
- **If Re-scan**: Return to camera/upload interface
- **If Cancel**: Return to prescriptions overview

---

## Technical Architecture

### Three-Layer Naming Convention
- **URL**: `/patient/presc/scanning`
- **Database Table**: `patient__presc__prescriptions` (existing)
- **Database View**: `v_patient__presc__prescriptions`
- **API Routes**: `/api/patient/presc/scanning`
- **Zod Schemas**: `PrescScanningCreateInput`, `PrescScanningAnalysisResult`
- **Hooks**: `usePatientPrescScanning`
- **Components**: `PatientPrescScanning.tsx`

### File Structure
```
app/
├── (authenticated)/
│   └── patient/
│       └── presc/
│           └── scanning/
│               └── page.tsx
├── api/
│   └── patient/
│       └── presc/
│           └── scanning/
│               ├── route.ts (analyze)
│               └── [id]/
│                   └── route.ts (CRUD operations)

components/
├── features/
│   └── patient/
│       └── presc/
│           ├── PrescScanCapture.tsx
│           ├── PrescScanResults.tsx
│           └── PrescScanHistory.tsx
└── templates/
    └── CameraCaptureTemplate.tsx (reusable)

schemas/
└── patient/
    └── presc/
        └── scanning.ts

hooks/
└── patient/
    └── presc/
        └── usePatientPrescScanning.ts

lib/
├── services/
│   └── medical-analysis-service.ts
└── configs/
    ├── camera-ui-config.ts
    └── medical-analysis-config.ts
```

---

## Database Schema

### Existing Table: `patient__presc__prescriptions`
The prescription scanning feature utilizes the existing prescriptions table with AI-specific fields:

**Key Fields for Scanning:**
- `prescription_id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY → auth.users)
- `image_url` (TEXT) - Prescription scan image path
- `extracted_text` (TEXT) - Raw OCR text
- `patient_name`, `patient_surname` (TEXT) - AI extracted
- `dr_name`, `dr_surname`, `practice_number` (TEXT) - AI extracted
- `prescription_date` (DATE) - AI extracted
- `condition_diagnosed` (TEXT) - AI extracted
- `medications_prescribed` (JSONB) - AI extracted medications array
- `scan_confidence` (NUMERIC) - AI confidence score (0.0-1.0)
- `ai_confidence_score` (NUMERIC) - Overall confidence (0-100)
- `scan_quality_score` (NUMERIC) - Image quality assessment
- `ai_warnings` (TEXT[]) - Processing warnings
- `status` (TEXT) - Processing status
- `is_active` (BOOLEAN) - Soft delete flag

### View Definition
```sql
-- v_patient__presc__prescriptions
CREATE VIEW v_patient__presc__prescriptions AS
SELECT *
FROM patient__presc__prescriptions
WHERE user_id = auth.uid() 
  AND is_active = true
ORDER BY created_at DESC;
```

### Medication JSONB Structure
```json
{
  "name": "Paracetamol",
  "dosage": "500mg",
  "strength": "500mg", 
  "frequency": "3 times daily",
  "timesPerDay": "3",
  "duration": "5 days",
  "instructions": "Take with food",
  "repeats": 2,
  "confidence": 95
}
```

---

## API Endpoints

### 1. Analyze Prescription
`POST /api/patient/presc/scanning`

**Purpose**: Upload image and analyze with AI (save=false)

**Request:**
```typescript
{
  file: string, // base64 encoded image
  fileName: string,
  fileType: string,
  save: false
}
```

**Response (Success):**
```typescript
{
  isPrescription: true,
  patientName: string,
  patientSurname: string,
  doctorName: string,
  practiceNumber?: string,
  prescriptionDate?: string,
  diagnosis?: string,
  medications: Medication[],
  uploadedPath: string,
  scanConfidence: number,
  aiConfidenceScore: number,
  scanQualityScore: number,
  aiWarnings?: string[]
}
```

**Response (Not Successful):**
```typescript
{
  isPrescription: false,
  reason: string,
  uploadedPath: string,
  fullResponse: string
}
```

### 2. Save Prescription
`POST /api/patient/presc/scanning`

**Purpose**: Save analyzed prescription to database (save=true)

**Request:**
```typescript
{
  uploadedPath: string,
  save: true,
  analysisResult: AnalysisResult
}
```

**Response:**
```typescript
{
  prescription: {
    prescription_id: string,
    created_at: string,
    status: "completed"
  }
}
```

### 3. Get Scanning History
`GET /api/patient/presc/scanning`

**Purpose**: Retrieve user's prescription scans

**Query Parameters:**
- `page?: number` (default: 1)
- `pageSize?: number` (default: 20)
- `search?: string`

**Response:**
```typescript
{
  items: PrescriptionScan[],
  total: number,
  page: number,
  pageSize: number
}
```

### 4. Storage Upload
`POST /api/storage/upload`

**Purpose**: Upload prescription image to secure storage

**Request:**
```typescript
{
  file: string, // base64
  fileName: string,
  fileType: string,
  bucket: "prescription-images"
}
```

**Response:**
```typescript
{
  data: {
    path: string,
    url: string,
    fileName: string,
    fileSize: number,
    fileType: string
  }
}
```

---

## Zod Schemas

### File: `/schemas/patient/presc/scanning.ts`

```typescript
import { z } from 'zod'

// Base prescription scan data
export const PrescScanningRow = z.object({
  prescription_id: z.string().uuid(),
  user_id: z.string().uuid(),
  image_url: z.string().nullable(),
  extracted_text: z.string().nullable(),
  patient_name: z.string().nullable(),
  patient_surname: z.string().nullable(),
  dr_name: z.string().nullable(),
  dr_surname: z.string().nullable(),
  practice_number: z.string().nullable(),
  prescription_date: z.string().date().nullable(),
  condition_diagnosed: z.string().nullable(),
  medications_prescribed: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    strength: z.string().optional(),
    frequency: z.string(),
    timesPerDay: z.string().optional(),
    duration: z.string(),
    instructions: z.string().optional(),
    repeats: z.number().optional(),
    confidence: z.number().min(0).max(100).optional()
  })).nullable(),
  scan_confidence: z.number().min(0).max(1).nullable(),
  ai_confidence_score: z.number().min(0).max(100).nullable(),
  scan_quality_score: z.number().min(0).max(100).nullable(),
  ai_warnings: z.array(z.string()).nullable(),
  status: z.enum(['processing', 'completed', 'error', 'pending_review']).nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string().nullable()
})

// Analysis input
export const PrescScanningAnalyzeInput = z.object({
  file: z.string().min(1, 'Image file is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['image/jpeg', 'image/jpg', 'image/png'], {
    errorMap: () => ({ message: 'Only JPEG and PNG images are allowed' })
  }),
  save: z.boolean().default(false)
})

// Analysis result
export const PrescScanningAnalysisResult = z.object({
  isPrescription: z.boolean(),
  patientName: z.string().optional(),
  patientSurname: z.string().optional(),
  doctorName: z.string().optional(),
  practiceNumber: z.string().optional(),
  prescriptionDate: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    strength: z.string().optional(),
    frequency: z.string(),
    timesPerDay: z.string().optional(),
    duration: z.string(),
    instructions: z.string().optional(),
    repeats: z.number().optional(),
    confidence: z.number().min(0).max(100).optional()
  })).default([]),
  uploadedPath: z.string(),
  scanConfidence: z.number().min(0).max(1).optional(),
  aiConfidenceScore: z.number().min(0).max(100).optional(),
  scanQualityScore: z.number().min(0).max(100).optional(),
  aiWarnings: z.array(z.string()).optional(),
  reason: z.string().optional(), // When isPrescription = false
  fullResponse: z.string().optional() // Raw AI response
})

// Save input
export const PrescScanningSaveInput = z.object({
  uploadedPath: z.string().min(1, 'Uploaded path is required'),
  save: z.literal(true),
  analysisResult: PrescScanningAnalysisResult
})

// List query
export const PrescScanningListQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().default('')
})

// List response
export const PrescScanningListResponse = z.object({
  items: z.array(PrescScanningRow),
  total: z.number(),
  page: z.number(),
  pageSize: z.number()
})

// Export types
export type PrescScanningRow = z.infer<typeof PrescScanningRow>
export type PrescScanningAnalyzeInput = z.infer<typeof PrescScanningAnalyzeInput>
export type PrescScanningAnalysisResult = z.infer<typeof PrescScanningAnalysisResult>
export type PrescScanningSaveInput = z.infer<typeof PrescScanningSaveInput>
export type PrescScanningListQuery = z.infer<typeof PrescScanningListQuery>
export type PrescScanningListResponse = z.infer<typeof PrescScanningListResponse>
```

---

## Hooks (TanStack Query)

### File: `/hooks/patient/presc/usePatientPrescScanning.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  PrescScanningAnalyzeInput,
  PrescScanningAnalysisResult,
  PrescScanningSaveInput,
  PrescScanningListQuery,
  PrescScanningListResponse 
} from '@/schemas/patient/presc/scanning'
import { toast } from '@/components/ui/use-toast'

// Query Keys
export const PrescScanningKeys = {
  all: ['patient', 'presc', 'scanning'] as const,
  lists: () => [...PrescScanningKeys.all, 'list'] as const,
  list: (query: PrescScanningListQuery) => [...PrescScanningKeys.lists(), query] as const,
  details: () => [...PrescScanningKeys.all, 'detail'] as const,
  detail: (id: string) => [...PrescScanningKeys.details(), id] as const
}

// Analyze prescription (save=false)
export function usePrescScanningAnalyze() {
  return useMutation({
    mutationFn: async (input: PrescScanningAnalyzeInput): Promise<PrescScanningAnalysisResult> => {
      const response = await fetch('/api/patient/presc/scanning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }
      
      return response.json()
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}

// Save prescription (save=true)
export function usePrescScanningSave() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: PrescScanningSaveInput) => {
      const response = await fetch('/api/patient/presc/scanning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Save failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate prescription lists
      queryClient.invalidateQueries({ queryKey: PrescScanningKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['patient', 'presc', 'prescriptions'] })
      
      toast({
        title: 'Prescription Saved',
        description: 'Your prescription has been successfully saved.'
      })
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })
}

// Get scanning history
export function usePrescScanningList(query: PrescScanningListQuery) {
  return useQuery({
    queryKey: PrescScanningKeys.list(query),
    queryFn: async (): Promise<PrescScanningListResponse> => {
      const params = new URLSearchParams({
        page: query.page.toString(),
        pageSize: query.pageSize.toString(),
        search: query.search
      })
      
      const response = await fetch(`/api/patient/presc/scanning?${params}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load scanning history')
      }
      
      return response.json()
    }
  })
}

// Get single prescription scan
export function usePrescScanningById(id: string) {
  return useQuery({
    queryKey: PrescScanningKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/presc/scanning/${id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to load prescription')
      }
      
      return response.json()
    },
    enabled: !!id
  })
}
```

---

## Components & Pages

### Main Page: `/app/(authenticated)/patient/presc/scanning/page.tsx`

```typescript
import { PatientPrescScanning } from '@/components/features/patient/presc/PrescScanCapture'

export default function PrescriptionScanningPage() {
  return <PatientPrescScanning />
}
```

### Main Component: `/components/features/patient/presc/PrescScanCapture.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CameraCaptureTemplate } from '@/components/templates/CameraCaptureTemplate'
import { PrescScanResults } from './PrescScanResults'
import { usePrescScanningAnalyze, usePrescScanningSave } from '@/hooks/patient/presc/usePatientPrescScanning'
import { PrescScanningAnalysisResult } from '@/schemas/patient/presc/scanning'

export function PatientPrescScanning() {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<PrescScanningAnalysisResult | null>(null)
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  
  const analyzeMutation = usePrescScanningAnalyze()
  const saveMutation = usePrescScanningSave()
  
  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }
  
  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setCapturedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSubmitForProcessing = async () => {
    if (!capturedImage) return
    
    try {
      const fileName = `prescription_${Date.now()}.jpg`
      const result = await analyzeMutation.mutateAsync({
        file: capturedImage,
        fileName,
        fileType: 'image/jpeg',
        save: false
      })
      
      setAnalysisResult(result)
      setUploadedPath(result.uploadedPath)
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }
  
  const handleSave = async () => {
    if (!analysisResult || !uploadedPath) return
    
    try {
      await saveMutation.mutateAsync({
        uploadedPath,
        save: true,
        analysisResult
      })
      
      router.push('/patient/presc/prescriptions')
    } catch (error) {
      console.error('Save failed:', error)
    }
  }
  
  const handleReset = () => {
    setCapturedImage(null)
    setAnalysisResult(null)
    setUploadedPath(null)
  }
  
  // Show results if analysis is complete
  if (analysisResult) {
    return (
      <PrescScanResults
        result={analysisResult}
        capturedImage={capturedImage}
        onSave={handleSave}
        onRescan={handleReset}
        isLoading={saveMutation.isPending}
      />
    )
  }
  
  // Show camera/upload interface
  return (
    <CameraCaptureTemplate
      previewImage={capturedImage}
      isLoading={analyzeMutation.isPending}
      processingMessage={analyzeMutation.isPending ? 'Analyzing prescription...' : undefined}
      onCapture={handleCapture}
      onFileUpload={handleFileUpload}
      onSubmitForProcessing={handleSubmitForProcessing}
      onRetake={handleReset}
      onCancel={() => router.push('/patient/presc/prescriptions')}
    />
  )
}
```

---

## Security & Validation

### Authentication & Authorization
- All API routes require `await requireUser()`
- Database queries filtered by `user_id = auth.uid()`
- Row Level Security policies on all tables
- Image storage in user-scoped paths

### Input Validation
- Zod schemas validate all inputs
- File type restrictions (JPEG/PNG only)
- File size limits (10MB maximum)
- Base64 encoding validation

### Data Protection
- Images stored with signed URLs (1 hour expiry)
- No direct storage URLs exposed
- All image access authenticated
- PHI (Protected Health Information) compliance

### Fraud Prevention
- No manual editing of extracted data
- All changes require new scan
- Audit trail of all scanning attempts
- Confidence scoring for quality assurance

---

## Testing Requirements

### Playwright E2E Tests
File: `/tests/patient/presc/prescription-scanning.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { login } from '../helpers/auth'

test.describe('Prescription Scanning', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 't@t.com', 't12345')
    await page.goto('/patient/presc/scanning')
  })
  
  test('Camera capture workflow', async ({ page }) => {
    // Test camera permission and capture
    await expect(page.locator('[data-testid="camera-preview"]')).toBeVisible()
    await page.click('[data-testid="capture-button"]')
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible()
    
    // Submit for processing
    await page.click('[data-testid="submit-processing"]')
    await expect(page.locator('text=Analyzing prescription')).toBeVisible()
    
    // Verify results or error handling
    await page.waitForSelector('[data-testid="analysis-results"], [data-testid="analysis-error"]')
  })
  
  test('File upload fallback', async ({ page }) => {
    // Test file upload when camera unavailable
    await page.setInputFiles('[data-testid="file-input"]', 'test-prescription.jpg')
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible()
  })
  
  test('AI success flow', async ({ page }) => {
    // Mock successful AI analysis
    // Test save functionality
    // Verify redirect to prescriptions list
  })
  
  test('AI failure flow', async ({ page }) => {
    // Mock AI failure
    // Test error display
    // Test retry functionality
  })
})
```

### Unit Tests
- Zod schema validation
- API route handlers
- Hook behavior
- Error handling

### Screenshots Required
- Camera interface (desktop/mobile)
- File upload interface
- Analysis loading state
- Success results display
- Error states
- Saved prescription in list

Save to: `/ai/testing/screenshots/prescription-scanning/`

---

## Configuration

### Camera Configuration: `/lib/configs/camera-ui-config.ts`
```typescript
export const CAMERA_UI_CONFIG = {
  defaultCamera: 'environment', // rear camera
  constraints: {
    video: {
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  },
  captureSettings: {
    format: 'image/jpeg',
    quality: 0.9
  },
  documentGuide: {
    borderColor: '#ffffff',
    borderWidth: 2,
    opacity: 0.8
  }
}
```

### Medical Analysis Configuration: `/lib/configs/medical-analysis-config.ts`
```typescript
export const MEDICAL_ANALYSIS_CONFIG = {
  prescriptionAnalysis: {
    systemPrompt: `Analyze this prescription image and extract structured data.
    
Return JSON with:
- isPrescription: boolean
- patientName: string
- patientSurname: string
- doctorName: string
- practiceNumber: string (if visible)
- prescriptionDate: string (YYYY-MM-DD format)
- diagnosis: string
- medications: array of objects with name, dosage, frequency, duration, instructions
- scanConfidence: number (0.0-1.0)
- aiWarnings: array of strings for any concerns

If not a prescription or unreadable, set isPrescription: false with reason.`,
    model: 'gpt-4-vision-preview',
    temperature: 0.1,
    maxTokens: 1000,
    confidenceThreshold: 0.7,
    qualityThreshold: 75
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Database schema validation (`patient__presc__prescriptions` exists)
- [ ] Zod schemas created and exported
- [ ] API routes implemented (analyze, save, list)
- [ ] OpenAI Vision service integration
- [ ] Storage upload functionality

### Phase 2: User Interface
- [ ] CameraCaptureTemplate component
- [ ] PrescScanCapture main component
- [ ] PrescScanResults component
- [ ] Page routing configured
- [ ] Navigation integration

### Phase 3: Hooks & State Management
- [ ] TanStack Query hooks implemented
- [ ] Error handling and toasts
- [ ] Query key management
- [ ] Cache invalidation

### Phase 4: Security & Validation
- [ ] RLS policies verified
- [ ] Input validation comprehensive
- [ ] Authentication on all routes
- [ ] Storage security configured

### Phase 5: Testing & Documentation
- [ ] Playwright E2E tests
- [ ] Unit test coverage
- [ ] Screenshot documentation
- [ ] API documentation updated

### Phase 6: Configuration & Deployment
- [ ] Environment variables configured
- [ ] AI model parameters tuned
- [ ] Camera settings optimized
- [ ] Performance monitoring

---

## Success Criteria

The prescription scanning feature is complete when:

1. ✅ Users can capture or upload prescription images
2. ✅ AI successfully extracts structured prescription data
3. ✅ Two-stage process (analyze → review → save) works flawlessly
4. ✅ Failed analyses are handled gracefully with user transparency
5. ✅ No editing allowed policy is enforced
6. ✅ All operations are secure and user-scoped
7. ✅ Prescription history is accessible and searchable
8. ✅ Mobile and desktop interfaces work seamlessly
9. ✅ Complete test coverage with Playwright
10. ✅ Performance meets medical-grade standards

---

**FINAL NOTE**: This specification follows Scrypto's SSOT principles with three-layer naming, CRUD-first API design, comprehensive Zod validation, and security-first implementation. The prescription scanning feature integrates seamlessly with existing architecture while maintaining medical-grade security and fraud prevention standards.