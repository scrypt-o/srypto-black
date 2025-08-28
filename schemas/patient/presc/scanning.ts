import { z } from 'zod'

// Basic file upload validation - good security without over-restriction
export const PrescScanningAnalyzeInput = z.object({
  file: z.string()
    .min(1, 'Image file is required')
    .max(15000000, 'File too large (max 10MB)'), // ~10MB base64 limit
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name too long')
    .regex(/\.(jpg|jpeg|png)$/i, 'Must be JPG or PNG format'),
  fileType: z.enum(['image/jpeg', 'image/png'], {
    errorMap: () => ({ message: 'Only JPEG and PNG images allowed' })
  })
})

// Medication structure from AI analysis
export const MedicationSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
  repeats: z.number().optional(),
  confidence: z.number().min(0).max(100).optional()
})

// AI Analysis result - successful prescription
export const SuccessfulAnalysisResult = z.object({
  isPrescription: z.literal(true),
  confidence: z.number().min(0).max(100).default(85),
  scanQuality: z.number().min(0).max(100).default(90),
  patientName: z.string(),
  patientSurname: z.string(),
  doctorName: z.string(),
  practiceNumber: z.string().optional(),
  prescriptionDate: z.string().optional(), // YYYY-MM-DD format
  diagnosis: z.string().optional(),
  medications: z.array(MedicationSchema).default([]),
  aiWarnings: z.array(z.string()).default([]),
  uploadedPath: z.string(),
  sessionId: z.string()
})

// AI Analysis result - not a prescription
export const FailedAnalysisResult = z.object({
  isPrescription: z.literal(false),
  reason: z.string(),
  detectedType: z.string().optional(),
  uploadedPath: z.string(),
  sessionId: z.string()
})

// Combined analysis result
export const PrescScanningAnalysisResult = z.union([
  SuccessfulAnalysisResult,
  FailedAnalysisResult
])

// Save prescription input
export const PrescScanningSaveInput = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  uploadedPath: z.string().min(1, 'Upload path required'),
  analysisResult: SuccessfulAnalysisResult, // Only successful results can be saved
  userConfirmed: z.boolean().default(true)
})

// Prescription list query
export const PrescScanningListQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().default('')
})

// Prescription list response
export const PrescScanningListResponse = z.object({
  items: z.array(z.object({
    prescription_id: z.string(),
    patient_name: z.string(),
    patient_surname: z.string(),
    dr_name: z.string(),
    condition_diagnosed: z.string().nullable(),
    image_url: z.string(),
    created_at: z.string(),
    ai_confidence_score: z.number().nullable()
  })),
  total: z.number(),
  page: z.number(),
  pageSize: z.number()
})

// Session data structure for recovery
export const ScanningSession = z.object({
  sessionId: z.string(),
  userId: z.string(),
  status: z.enum(['created', 'uploading', 'analyzing', 'analyzed', 'saving', 'completed', 'error']),
  uploadedPath: z.string().optional(),
  analysisResult: PrescScanningAnalysisResult.optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  expiresAt: z.string(),
  retryCount: z.number().default(0)
})

// Export types
export type PrescScanningAnalyzeInput = z.infer<typeof PrescScanningAnalyzeInput>
export type Medication = z.infer<typeof MedicationSchema>
export type SuccessfulAnalysisResult = z.infer<typeof SuccessfulAnalysisResult>
export type FailedAnalysisResult = z.infer<typeof FailedAnalysisResult>
export type PrescScanningAnalysisResult = z.infer<typeof PrescScanningAnalysisResult>
export type PrescScanningSaveInput = z.infer<typeof PrescScanningSaveInput>
export type PrescScanningListQuery = z.infer<typeof PrescScanningListQuery>
export type PrescScanningListResponse = z.infer<typeof PrescScanningListResponse>
export type ScanningSession = z.infer<typeof ScanningSession>

// Basic validation helpers
export const validateImageFile = (file: string): boolean => {
  try {
    // Check if it's valid base64 with image header
    return /^data:image\/(jpeg|jpg|png);base64,/.test(file)
  } catch {
    return false
  }
}

export const extractFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || 'jpg'
}