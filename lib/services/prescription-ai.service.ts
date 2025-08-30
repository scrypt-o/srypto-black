/**
 * Modern Prescription AI Service - Using Vercel AI SDK
 * Clean implementation for prescription data extraction
 */

import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { getServiceRoleClient } from '@/lib/supabase-server'
import { z } from 'zod'

// Prescription analysis schema (clean and focused)
const PrescriptionSchema = z.object({
  isPrescription: z.boolean(),
  patientName: z.string().optional(),
  patientSurname: z.string().optional(), 
  doctorName: z.string().optional(),
  doctorSurname: z.string().optional(),
  practiceNumber: z.string().optional(),
  issueDate: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional()
  })).optional(),
  overallConfidence: z.number().min(0).max(100),
  scanQuality: z.number().min(0).max(100),
  aiWarnings: z.array(z.string()).optional()
})

interface PrescriptionAnalysisRequest {
  imageBase64: string
  fileName: string
  userId: string
  sessionId: string
}

export class ModernPrescriptionAIService {
  private openai: any
  
  constructor() {
    // OpenAI client will be initialized with user-specific config
    this.openai = null
  }

  // Fetch AI configuration from Supabase ai_setup table
  private async getAIConfig(userId: string) {
    try {
      const supabase = getServiceRoleClient()
      
      const { data, error } = await supabase
        .from('ai_setup')
        .select('*')
        .eq('user_id', userId)
        .eq('ai_type', 'prescription_analysis')
        .eq('is_active', true)
        .single()

      if (error || !data) {
        // Fallback to environment variables
        return {
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4o',
          temperature: 0.1,
          maxTokens: 2000,
          systemInstructions: 'You are a medical prescription analyzer. Extract structured data from prescription images with high accuracy.'
        }
      }

      return {
        apiKey: data.ai_api_key || process.env.OPENAI_API_KEY,
        model: data.ai_model || 'gpt-4o',
        temperature: data.ai_temperature || 0.1,
        maxTokens: data.ai_max_tokens || 2000,
        systemInstructions: data.ai_system_instructions || 'You are a medical prescription analyzer. Extract structured data from prescription images with high accuracy.',
        configuration: data.configuration || {}
      }

    } catch (error) {
      console.error('Error fetching AI config:', error)
      // Fallback to defaults
      return {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o',
        temperature: 0.1,
        maxTokens: 2000,
        systemInstructions: 'You are a medical prescription analyzer. Extract structured data from prescription images with high accuracy.'
      }
    }
  }

  async analyzePrescription(request: PrescriptionAnalysisRequest) {
    const startTime = Date.now()
    
    try {
      // Get user-specific AI configuration from database
      const config = await this.getAIConfig(request.userId)
      
      if (!config.apiKey) {
        throw new Error('OpenAI API key not configured for user')
      }

      console.log('🤖 [PRESCRIPTION_AI] Starting analysis with user config:', {
        model: config.model,
        temperature: config.temperature
      })
      
      // Initialize OpenAI client with user-specific API key
      const openaiClient = createOpenAI({
        apiKey: config.apiKey,
      })
      const model = openaiClient(config.model)
      
      const result = await generateObject({
        model,
        schema: PrescriptionSchema,
        messages: [
          {
            role: 'system',
            content: config.systemInstructions
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this medical prescription image and extract structured data.'
              },
              {
                type: 'image',
                image: request.imageBase64
              }
            ]
          }
        ],
        temperature: config.temperature
      })

      const processingTime = Date.now() - startTime
      const cost = this.calculateCost(result.usage)

      // Upload image for storage
      const uploadedPath = await this.uploadPrescriptionImage(request)

      // Log successful analysis
      await this.logAIInteraction({
        userId: request.userId,
        sessionId: request.sessionId,
        requestData: { 
          imageProvided: true, 
          fileName: request.fileName,
          imageSize: request.imageBase64.length 
        },
        responseData: result.object,
        processingTime,
        success: true,
        cost
      })

      console.log(`✅ [PRESCRIPTION_AI] Analysis completed in ${processingTime}ms`)
      
      return {
        success: true,
        isPrescription: result.object.isPrescription,
        data: result.object.isPrescription ? result.object : undefined,
        reason: !result.object.isPrescription ? 'Could not identify as prescription' : undefined,
        uploadedPath,
        sessionId: request.sessionId,
        cost,
        usage: result.usage
      }

    } catch (error) {
      const processingTime = Date.now() - startTime

      // Log failed analysis
      await this.logAIInteraction({
        userId: request.userId,
        sessionId: request.sessionId,
        requestData: { imageProvided: true, fileName: request.fileName },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        cost: 0
      })

      console.error('❌ [PRESCRIPTION_AI] Analysis failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
        processingTime
      }
    }
  }

  private calculateCost(usage: any): number {
    if (!usage) return 0
    
    // GPT-4o pricing  
    const inputCost = (usage.promptTokens || 0) * 0.005 / 1000
    const outputCost = (usage.completionTokens || 0) * 0.015 / 1000
    
    return Math.round((inputCost + outputCost) * 10000) / 10000
  }

  private async uploadPrescriptionImage(request: PrescriptionAnalysisRequest): Promise<string> {
    try {
      const supabase = getServiceRoleClient()
      
      // Convert base64 to buffer
      const base64Data = request.imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      
      // Create user-specific path
      const timestamp = Date.now()
      const sanitizedFileName = request.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${request.userId}/prescriptions/${timestamp}_${sanitizedFileName}`
      
      // Upload to prescription-images bucket
      const { data, error } = await supabase.storage
        .from('prescription-images')
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        })
      
      if (error) {
        console.error('Image upload failed:', error)
        throw new Error('Failed to upload prescription image')
      }
      
      return data.path
      
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  private async logAIInteraction(data: {
    userId: string
    sessionId: string
    requestData: any
    responseData?: any
    processingTime: number
    success: boolean
    error?: string
    cost: number
  }): Promise<void> {
    try {
      const supabase = getServiceRoleClient()
      
      await supabase
        .from('ai_audit_log')
        .insert({
          user_id: data.userId,
          operation: 'prescription_analysis',
          success: data.success,
          cost_incurred: data.cost,
          metadata: {
            session_id: data.sessionId,
            processing_time: data.processingTime,
            request_data: data.requestData,
            response_data: data.responseData,
            error: data.error,
            timestamp: new Date().toISOString()
          }
        })

    } catch (error) {
      console.error('Error logging AI interaction:', error)
    }
  }

  // Admin functionality for monitoring AI usage
  async getUsageStats(userId?: string, dateRange?: { start: string; end: string }) {
    try {
      const supabase = getServiceRoleClient()
      
      let query = supabase
        .from('ai_audit_log')
        .select('*')
        .eq('operation', 'prescription_analysis')
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
      }

      const { data, error } = await query.limit(1000)

      if (error) throw error

      // Calculate aggregated stats for admin dashboard
      const stats = {
        totalRequests: data?.length || 0,
        successfulRequests: data?.filter(r => r.success).length || 0,
        failedRequests: data?.filter(r => !r.success).length || 0,
        totalCost: data?.reduce((sum, r) => sum + (r.cost_incurred || 0), 0) || 0,
        averageProcessingTime: data?.length 
          ? data.reduce((sum, r) => sum + (r.metadata?.processing_time || 0), 0) / data.length 
          : 0,
        averageConfidence: data?.filter(r => r.success && r.metadata?.response_data?.overallConfidence)
          .reduce((sum, r, _, arr) => sum + (r.metadata.response_data.overallConfidence / arr.length), 0) || 0
      }

      return {
        success: true,
        stats,
        recentRequests: data?.slice(0, 50) // Last 50 requests for admin review
      }

    } catch (error) {
      console.error('Error getting usage stats:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get usage stats'
      }
    }
  }
}