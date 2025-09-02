import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/api-helpers'
import { getServerClient } from '@/lib/supabase-server'
import { z } from 'zod'

const AISettingsSchema = z.object({
  ai_type: z.string().default('prescription_analysis'),
  ai_model_provider: z.enum(['openai', 'anthropic']),
  ai_model: z.string().min(1),
  ai_api_key: z.string().regex(/^sk-[a-zA-Z0-9-_]+$/, 'Invalid API key format'),
  ai_temperature: z.number().min(0).max(2).optional(),
  ai_system_instructions: z.string().max(2000).optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const csrf = verifyCsrf(request)
    if (csrf) return csrf
    
    const supabase = await getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await request.json()
    const validatedData = AISettingsSchema.parse(raw)

    // Upsert AI configuration for user
    const { data, error } = await supabase
      .from('ai_setup')
      .upsert({
        ...validatedData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save AI settings:', error)
      return NextResponse.json({ error: 'Failed to save AI settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: error.errors 
      }, { status: 422 })
    }
    
    console.error('AI settings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}