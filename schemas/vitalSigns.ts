import { z } from 'zod'

// Enum values for vital sign status (for UI categorization)
export const VitalStatusEnum = z.enum(['normal', 'elevated', 'high', 'low', 'critical'])

// Enum for measurement context
export const MeasurementContextEnum = z.enum(['routine', 'pre_medication', 'post_medication', 'pre_exercise', 'post_exercise', 'emergency', 'other'])

// Complete database row - all columns from patient__vitality__vital_signs table
export const VitalSignRowSchema = z.object({
  vital_sign_id: z.string().uuid(),
  user_id: z.string().uuid(),
  measurement_date: z.string().nullable(), // Date as ISO string
  systolic_bp: z.number().nullable(),
  diastolic_bp: z.number().nullable(),
  heart_rate: z.number().nullable(),
  temperature: z.number().nullable(),
  oxygen_saturation: z.number().nullable(),
  respiratory_rate: z.number().nullable(),
  blood_glucose: z.number().nullable(),
  cholesterol_total: z.number().nullable(),
  hdl_cholesterol: z.number().nullable(),
  ldl_cholesterol: z.number().nullable(),
  triglycerides: z.number().nullable(),
  measurement_device: z.string().nullable(),
  measurement_context: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(), // Timestamp as ISO string
  updated_at: z.string(), // Timestamp as ISO string
  is_active: z.boolean().nullable().default(true),
})

// Input for creating a new vital sign reading (exclude auto-generated fields)
export const VitalSignCreateInputSchema = z.object({
  measurement_date: z.string().optional(), // Date as YYYY-MM-DD
  systolic_bp: z.number().positive().max(300).optional(),
  diastolic_bp: z.number().positive().max(200).optional(),
  heart_rate: z.number().positive().max(300).optional(),
  temperature: z.number().min(30).max(50).optional(), // Celsius, reasonable human range
  oxygen_saturation: z.number().min(0).max(100).optional(),
  respiratory_rate: z.number().positive().max(60).optional(),
  blood_glucose: z.number().positive().max(1000).optional(), // mg/dL
  cholesterol_total: z.number().positive().max(1000).optional(), // mg/dL
  hdl_cholesterol: z.number().positive().max(200).optional(), // mg/dL
  ldl_cholesterol: z.number().positive().max(500).optional(), // mg/dL
  triglycerides: z.number().positive().max(2000).optional(), // mg/dL
  measurement_device: z.string().max(200).optional(),
  measurement_context: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

// Input for updating an existing vital sign reading
export const VitalSignUpdateInputSchema = z.object({
  measurement_date: z.string().optional(), // Date as YYYY-MM-DD
  systolic_bp: z.number().positive().max(300).optional(),
  diastolic_bp: z.number().positive().max(200).optional(),
  heart_rate: z.number().positive().max(300).optional(),
  temperature: z.number().min(30).max(50).optional(),
  oxygen_saturation: z.number().min(0).max(100).optional(),
  respiratory_rate: z.number().positive().max(60).optional(),
  blood_glucose: z.number().positive().max(1000).optional(),
  cholesterol_total: z.number().positive().max(1000).optional(),
  hdl_cholesterol: z.number().positive().max(200).optional(),
  ldl_cholesterol: z.number().positive().max(500).optional(),
  triglycerides: z.number().positive().max(2000).optional(),
  measurement_device: z.string().max(200).optional(),
  measurement_context: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

// Query parameters for list endpoint
export const VitalSignListQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  measurement_context: z.string().optional(),
  date_from: z.string().optional(), // Date filter
  date_to: z.string().optional(), // Date filter
})

// Response shape for list endpoint
export const VitalSignListResponseSchema = z.object({
  data: z.array(VitalSignRowSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

// Form schema for UI forms (same as create but with form-specific validation)
export const vitalSignFormSchema = z.object({
  measurement_date: z.string().optional(), // Date as YYYY-MM-DD
  systolic_bp: z.string().optional(), // String for form input, will be converted to number
  diastolic_bp: z.string().optional(),
  heart_rate: z.string().optional(),
  temperature: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  respiratory_rate: z.string().optional(),
  blood_glucose: z.string().optional(),
  cholesterol_total: z.string().optional(),
  hdl_cholesterol: z.string().optional(),
  ldl_cholesterol: z.string().optional(),
  triglycerides: z.string().optional(),
  measurement_device: z.string().max(200).optional(),
  measurement_context: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
})

// Type exports for use in TypeScript
export type VitalSignRow = z.infer<typeof VitalSignRowSchema>
export type VitalSignCreateInput = z.infer<typeof VitalSignCreateInputSchema>
export type VitalSignUpdateInput = z.infer<typeof VitalSignUpdateInputSchema>
export type VitalSignListQuery = z.infer<typeof VitalSignListQuerySchema>
export type VitalSignListResponse = z.infer<typeof VitalSignListResponseSchema>
export type VitalStatus = z.infer<typeof VitalStatusEnum>
export type MeasurementContext = z.infer<typeof MeasurementContextEnum>
export type VitalSignFormData = z.infer<typeof vitalSignFormSchema>

// Interface for list feature configuration
export interface VitalSignItem {
  id: string
  title: string
  letter: string
  severity: 'normal' | 'mild' | 'severe' | 'critical'
  thirdColumn: string | null
  data: VitalSignRow
}

// Helper functions for status categorization
export const categorizeBloodPressure = (systolic?: number, diastolic?: number): VitalStatus => {
  if (!systolic || !diastolic) return 'normal'
  
  if (systolic >= 180 || diastolic >= 120) return 'critical'
  if (systolic >= 140 || diastolic >= 90) return 'high'
  if (systolic >= 120 || diastolic >= 80) return 'elevated'
  return 'normal'
}

export const categorizeHeartRate = (heartRate?: number): VitalStatus => {
  if (!heartRate) return 'normal'
  
  if (heartRate < 40 || heartRate > 150) return 'critical'
  if (heartRate < 50 || heartRate > 120) return 'high'
  if (heartRate < 60 || heartRate > 100) return 'elevated'
  return 'normal'
}

export const categorizeTemperature = (temperature?: number): VitalStatus => {
  if (!temperature) return 'normal'
  
  if (temperature < 35 || temperature > 40) return 'critical'
  if (temperature < 36 || temperature > 38.5) return 'high'
  if (temperature > 37.5) return 'elevated'
  return 'normal'
}

export const categorizeOxygenSaturation = (oxygenSat?: number): VitalStatus => {
  if (!oxygenSat) return 'normal'
  
  if (oxygenSat < 85) return 'critical'
  if (oxygenSat < 90) return 'high'
  if (oxygenSat < 95) return 'elevated'
  return 'normal'
}

// Helper function to determine overall vital sign status
export const getOverallVitalStatus = (row: VitalSignRow): VitalStatus => {
  const statuses = [
    categorizeBloodPressure(row.systolic_bp || undefined, row.diastolic_bp || undefined),
    categorizeHeartRate(row.heart_rate || undefined),
    categorizeTemperature(row.temperature || undefined),
    categorizeOxygenSaturation(row.oxygen_saturation || undefined),
  ]
  
  // Return the most severe status
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('high')) return 'high'
  if (statuses.includes('elevated')) return 'elevated'
  return 'normal'
}