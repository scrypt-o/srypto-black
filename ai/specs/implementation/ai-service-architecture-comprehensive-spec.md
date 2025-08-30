# AI Service Architecture Comprehensive Specification

**Feature**: `ai_service_architecture`  
**Date**: 2025-08-28  
**Status**: Implementation Ready  
**Domain**: Core Infrastructure  
**Purpose**: Multi-provider AI service layer for prescription scanning, chatbot, and medical analysis  
**Legacy Reference**: `/_eve_/projects/ultimate-chat/` (Vercel AI SDK patterns)

---

## Strategic Approach: Ultimate-Chat Proven Patterns + Medical Requirements

This specification leverages the **excellent Vercel AI SDK architecture** from ultimate-chat while adapting it for medical use cases with comprehensive audit trails, cost controls, and multi-provider support.

### What We're Adopting (Proven Excellence)
- **Vercel AI SDK Integration**: `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`
- **Provider Abstraction**: Generic connector supporting multiple AI providers  
- **Streaming Responses**: Real-time AI response streaming with proper error handling
- **Database Integration**: Complete audit trail and usage tracking
- **Cost Monitoring**: Token usage and cost tracking per request

### What We're Adding (Medical Requirements)
- **Medical-Grade Audit**: Complete trail for regulatory compliance
- **Usage Limits**: Per-user daily/monthly limits for cost control
- **Security Hardening**: Encrypted API key storage and access controls
- **Prescription-Specific**: Custom prompts and validation for medical document analysis
- **Multi-Use Cases**: Support chatbot, prescription scanning, and future AI services

---

## Database Schema Design

### Table 1: AI API Keys Management
```sql
-- Secure storage for multiple AI provider API keys
CREATE TABLE ai_api_keys (
    api_key_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_name TEXT NOT NULL,              -- "OpenAI Production", "Anthropic Development"
    provider_name TEXT NOT NULL,             -- "openai", "anthropic", "google", "custom"
    api_key_encrypted TEXT NOT NULL,         -- AES-256 encrypted API key
    api_key_hash TEXT NOT NULL,              -- SHA-256 hash for verification
    base_url TEXT,                           -- Custom API endpoints (for self-hosted)
    
    -- Metadata
    description TEXT,
    environment TEXT DEFAULT 'production',    -- "development", "staging", "production"
    
    -- Access control
    created_by UUID REFERENCES auth.users(id),
    allowed_users JSONB,                     -- Array of user IDs with access
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API keys
CREATE POLICY "Admin users can manage API keys" ON ai_api_keys
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

-- Regular users can view keys they have access to
CREATE POLICY "Users can view accessible API keys" ON ai_api_keys
    FOR SELECT USING (
        allowed_users IS NULL OR 
        auth.uid()::text = ANY(SELECT jsonb_array_elements_text(allowed_users))
    );
```

### Table 2: AI Setup Configuration
```sql
-- Configuration for different AI use cases
CREATE TABLE ai_setup (
    setup_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setup_name TEXT NOT NULL,                -- "Prescription Scanner", "Patient Chatbot", "Medical Assistant"
    setup_type TEXT NOT NULL,                -- "prescription_scanning", "chatbot", "medical_analysis", "custom"
    
    -- Provider configuration
    api_key_id UUID REFERENCES ai_api_keys(api_key_id),
    provider_name TEXT NOT NULL,             -- Derived from linked API key
    model TEXT NOT NULL,                     -- "gpt-4o", "claude-3-5-sonnet", "gemini-pro"
    
    -- Capabilities
    capabilities_enabled JSONB NOT NULL,     -- ["chat", "vision", "image", "function_calling", "custom"]
    
    -- Model parameters
    temperature DECIMAL(3,2) DEFAULT 0.7,
    top_k INTEGER,
    top_p DECIMAL(3,2),
    max_tokens INTEGER DEFAULT 1024,
    frequency_penalty DECIMAL(3,2),
    presence_penalty DECIMAL(3,2),
    
    -- Usage limits (per user)
    max_requests_per_hour INTEGER DEFAULT 100,
    max_requests_per_day INTEGER DEFAULT 500,
    max_cost_per_user_daily DECIMAL(10,2) DEFAULT 50.00,
    max_cost_per_user_monthly DECIMAL(10,2) DEFAULT 500.00,
    
    -- Global limits
    max_global_cost_daily DECIMAL(12,2) DEFAULT 1000.00,
    max_concurrent_requests INTEGER DEFAULT 50,
    
    -- System prompt configuration
    system_prompt TEXT,
    system_prompt_variables JSONB,           -- Variable replacements in prompt
    
    -- Function calling (for prescription scanning)
    functions_enabled BOOLEAN DEFAULT false,
    function_definitions JSONB,              -- OpenAI function definitions
    
    -- Retry and timeout configuration  
    max_retries INTEGER DEFAULT 2,
    timeout_seconds INTEGER DEFAULT 60,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default_for_type BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(setup_type, is_default_for_type) WHERE is_default_for_type = true
);

-- RLS for AI setup
ALTER TABLE ai_setup ENABLE ROW LEVEL SECURITY;

-- Admins can manage all setups
CREATE POLICY "Admin users can manage AI setups" ON ai_setup
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

-- Regular users can view active setups
CREATE POLICY "Users can view active AI setups" ON ai_setup
    FOR SELECT USING (is_active = true);
```

### Table 3: AI History & Audit Trail
```sql
-- Comprehensive logging of all AI interactions
CREATE TABLE ai_history (
    history_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    setup_id UUID REFERENCES ai_setup(setup_id),
    
    -- Request identification
    session_id UUID,                         -- Groups related requests (e.g., prescription analysis session)
    function_name TEXT NOT NULL,             -- "analyze_prescription", "chat_message", "generate_summary"
    request_type TEXT NOT NULL,              -- "vision", "chat", "completion", "function_call"
    
    -- Input data
    input_data JSONB NOT NULL,               -- Complete request payload
    input_token_count INTEGER,
    input_size_bytes INTEGER,                -- For image/file uploads
    
    -- AI provider response
    provider_response JSONB,                 -- Raw AI response
    output_data JSONB,                       -- Processed/structured output
    output_token_count INTEGER,
    
    -- Performance metrics
    processing_time_ms INTEGER NOT NULL,
    queue_time_ms INTEGER,                   -- Time spent waiting in queue
    
    -- Cost tracking
    cost_incurred DECIMAL(10,4),             -- Cost in USD
    cost_breakdown JSONB,                    -- {"input_tokens": 0.02, "output_tokens": 0.03}
    
    -- Quality metrics
    confidence_score DECIMAL(5,2),           -- AI confidence (0-100)
    quality_score DECIMAL(5,2),              -- Output quality assessment
    
    -- Status and errors
    success BOOLEAN NOT NULL,
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Security audit
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB,                       -- Country, region for compliance
    
    -- Medical compliance
    contains_phi BOOLEAN DEFAULT false,       -- Protected Health Information
    retention_category TEXT DEFAULT 'standard', -- "standard", "medical", "sensitive"
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for AI history
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI history
CREATE POLICY "Users can view their own AI history" ON ai_history
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all AI history for auditing
CREATE POLICY "Admins can view all AI history" ON ai_history
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'admin'
    ));

-- Indexes for performance
CREATE INDEX idx_ai_history_user_function ON ai_history(user_id, function_name, created_at DESC);
CREATE INDEX idx_ai_history_setup_id ON ai_history(setup_id, created_at DESC);
CREATE INDEX idx_ai_history_cost_tracking ON ai_history(user_id, created_at DESC) WHERE cost_incurred > 0;
```

### Table 4: Usage Quotas & Monitoring
```sql
-- Daily/monthly usage tracking per user
CREATE TABLE ai_usage_quotas (
    quota_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    setup_id UUID REFERENCES ai_setup(setup_id),
    
    -- Time period
    period_type TEXT NOT NULL,               -- "daily", "monthly", "hourly"
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Usage tracking
    requests_count INTEGER DEFAULT 0,
    tokens_consumed INTEGER DEFAULT 0,
    cost_accumulated DECIMAL(10,2) DEFAULT 0.00,
    
    -- Limits (copied from ai_setup for historical tracking)
    max_requests INTEGER,
    max_cost DECIMAL(10,2),
    
    -- Status
    quota_exceeded BOOLEAN DEFAULT false,
    last_request_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, setup_id, period_type, period_start)
);

-- Automatically clean up old quota records
CREATE INDEX idx_ai_quotas_cleanup ON ai_usage_quotas(period_end) WHERE period_end < NOW() - INTERVAL '90 days';
```

---

## AI Service Layer Architecture

### Core AI Connector (Based on Ultimate-Chat Success)
```typescript
// lib/services/ai/ai-connector.service.ts
import { streamText, generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export class AIConnectorService {
  private providers = new Map<string, any>()
  
  constructor() {
    // Initialize providers with encrypted API keys from database
    this.initializeProviders()
  }
  
  private async initializeProviders() {
    const apiKeys = await this.getDecryptedAPIKeys()
    
    apiKeys.forEach(key => {
      switch (key.provider_name) {
        case 'openai':
          this.providers.set('openai', createOpenAI({ 
            apiKey: key.decrypted_key,
            baseURL: key.base_url 
          }))
          break
        case 'anthropic':
          this.providers.set('anthropic', createAnthropic({ 
            apiKey: key.decrypted_key 
          }))
          break
        case 'google':
          this.providers.set('google', createGoogleGenerativeAI({ 
            apiKey: key.decrypted_key 
          }))
          break
      }
    })
  }
  
  async executeAIFunction(
    setupId: string,
    functionName: string,
    input: any,
    userId: string,
    sessionId?: string
  ): Promise<AIResponse> {
    const startTime = Date.now()
    
    try {
      // 1. Get AI setup configuration
      const setup = await this.getAISetup(setupId)
      
      // 2. Check usage limits
      await this.checkUsageLimits(userId, setupId)
      
      // 3. Get provider and model
      const provider = this.providers.get(setup.provider_name)
      if (!provider) throw new Error(`Provider ${setup.provider_name} not available`)
      
      // 4. Execute AI function based on type
      let result: any
      switch (setup.setup_type) {
        case 'prescription_scanning':
          result = await this.executePrescriptionScanning(provider, setup, input)
          break
        case 'chatbot':
          result = await this.executeChatbot(provider, setup, input)
          break
        case 'medical_analysis':
          result = await this.executeMedicalAnalysis(provider, setup, input)
          break
        default:
          throw new Error(`Unknown setup type: ${setup.setup_type}`)
      }
      
      // 5. Log to AI history
      await this.logAIHistory({
        userId,
        setupId,
        sessionId,
        functionName,
        input,
        output: result,
        success: true,
        processingTime: Date.now() - startTime,
        cost: this.calculateCost(result.usage),
        confidenceScore: result.confidence
      })
      
      return result
      
    } catch (error) {
      // Log error to AI history
      await this.logAIHistory({
        userId,
        setupId,
        sessionId,
        functionName,
        input,
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      })
      
      throw error
    }
  }
  
  private async executePrescriptionScanning(provider: any, setup: AISetup, input: any) {
    // OpenAI Vision API for prescription analysis
    const model = provider(setup.model) // e.g., gpt-4o
    
    const result = await generateObject({
      model,
      prompt: this.buildPrescriptionPrompt(setup.system_prompt, input.imageBase64),
      schema: PrescriptionSchema, // Zod schema for validation
      maxTokens: setup.max_tokens,
      temperature: setup.temperature
    })
    
    return {
      isPrescription: result.object.isPrescription,
      extractedData: result.object.data,
      confidence: result.object.confidence,
      usage: result.usage,
      warnings: result.object.warnings
    }
  }
  
  private async executeChatbot(provider: any, setup: AISetup, input: any) {
    const model = provider(setup.model)
    
    const result = await streamText({
      model,
      messages: input.messages,
      system: setup.system_prompt,
      maxTokens: setup.max_tokens,
      temperature: setup.temperature
    })
    
    return {
      textStream: result.textStream,
      usage: result.usage,
      finishReason: result.finishReason
    }
  }
}
```

### Prescription Scanning AI Service
```typescript
// lib/services/ai/prescription-scanning.service.ts
export class PrescriptionScanningAIService {
  private aiConnector: AIConnectorService
  private setupId: string // "prescription_scanner" setup ID
  
  constructor() {
    this.aiConnector = new AIConnectorService()
    this.setupId = 'prescription_scanner_default' // From ai_setup table
  }
  
  async analyzePrescription(
    imageBase64: string,
    userId: string,
    sessionId?: string
  ): Promise<PrescriptionAnalysisResult> {
    
    const result = await this.aiConnector.executeAIFunction(
      this.setupId,
      'analyze_prescription',
      { 
        imageBase64,
        analysisType: 'full_extraction',
        includeValidation: true
      },
      userId,
      sessionId
    )
    
    // Medical validation layer
    if (result.isPrescription && result.extractedData) {
      const validationResult = await this.validateMedicalData(result.extractedData)
      result.validationWarnings = validationResult.warnings
      result.validationErrors = validationResult.errors
    }
    
    return result
  }
  
  private async validateMedicalData(data: ExtractedPrescriptionData): Promise<ValidationResult> {
    // Check dosage limits
    // Verify prescription age
    // Detect dangerous drug combinations
    // Validate patient name matching
    return { warnings: [], errors: [] }
  }
}
```

### Chatbot AI Service
```typescript
// lib/services/ai/chatbot.service.ts
export class ChatbotAIService {
  private aiConnector: AIConnectorService
  
  async generateResponse(
    messages: ChatMessage[],
    userId: string,
    conversationId?: string
  ): Promise<ReadableStream> {
    
    return await this.aiConnector.executeAIFunction(
      'medical_chatbot_default',
      'generate_chat_response',
      {
        messages,
        conversationId,
        context: 'medical_support'
      },
      userId,
      conversationId
    )
  }
  
  async generateMedicalSummary(
    patientData: PatientMedicalData,
    userId: string
  ): Promise<MedicalSummary> {
    
    return await this.aiConnector.executeAIFunction(
      'medical_analysis_default',
      'generate_medical_summary',
      {
        patientData,
        summaryType: 'comprehensive',
        includeRecommendations: true
      },
      userId
    )
  }
}
```

---

## Configuration Management

### AI Setup Seeding (Initial Data)
```sql
-- Insert default AI setups for prescription scanning
INSERT INTO ai_setup (
    setup_id, 
    setup_name, 
    setup_type, 
    provider_name, 
    model,
    capabilities_enabled,
    system_prompt,
    functions_enabled,
    function_definitions,
    is_default_for_type
) VALUES (
    'prescription_scanner_default',
    'Prescription Scanner',
    'prescription_scanning',
    'openai',
    'gpt-4o',
    '["vision", "function_calling"]',
    'You are a medical prescription analyzer. Extract structured data from prescription images with high accuracy. Focus on patient information, doctor details, medications with dosages, and issue dates.',
    true,
    '{
      "name": "extract_prescription_data",
      "description": "Extract structured data from a medical prescription",
      "parameters": {
        "type": "object",
        "properties": {
          "isPrescription": {"type": "boolean"},
          "patientName": {"type": "string"},
          "doctorName": {"type": "string"},
          "medications": {
            "type": "array",
            "items": {
              "type": "object", 
              "properties": {
                "name": {"type": "string"},
                "dosage": {"type": "string"},
                "frequency": {"type": "string"},
                "duration": {"type": "string"}
              }
            }
          }
        }
      }
    }',
    true
);

-- Insert chatbot setup
INSERT INTO ai_setup (
    setup_id,
    setup_name,
    setup_type,
    provider_name,
    model,
    capabilities_enabled,
    system_prompt,
    temperature,
    is_default_for_type
) VALUES (
    'medical_chatbot_default',
    'Medical Chatbot',
    'chatbot', 
    'anthropic',
    'claude-3-5-sonnet-20241022',
    '["chat", "medical_knowledge"]',
    'You are a helpful medical assistant for Scrypto patients. Provide general health information but always recommend consulting healthcare professionals for medical advice. Never provide specific medical diagnoses or treatment recommendations.',
    0.7,
    true
);
```

---

## API Layer Implementation

### Generic AI API Endpoint
```typescript
// app/api/ai/execute/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AIConnectorService } from '@/lib/services/ai/ai-connector.service'
import { z } from 'zod'

const AIExecuteRequest = z.object({
  setupId: z.string().uuid(),
  functionName: z.string(),
  input: z.record(z.any()),
  sessionId: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedServerClient()
    const body = await request.json()
    const validated = AIExecuteRequest.parse(body)
    
    const aiConnector = new AIConnectorService()
    const result = await aiConnector.executeAIFunction(
      validated.setupId,
      validated.functionName,
      validated.input,
      user.id,
      validated.sessionId
    )
    
    return NextResponse.json({ success: true, data: result })
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: error.status || 500 }
    )
  }
}
```

### Prescription Analysis API
```typescript
// app/api/patient/presc/scanning/analyze/route.ts
import { PrescriptionScanningAIService } from '@/lib/services/ai/prescription-scanning.service'

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedServerClient()
    const { imageBase64, fileName, fileType } = await request.json()
    
    // Upload image to storage first
    const uploadPath = await uploadPrescriptionImage(imageBase64, user.id, fileName)
    
    // Analyze with AI
    const scanningService = new PrescriptionScanningAIService()
    const analysisResult = await scanningService.analyzePrescription(
      imageBase64,
      user.id,
      crypto.randomUUID() // session ID
    )
    
    return NextResponse.json({
      success: true,
      ...analysisResult,
      uploadedPath: uploadPath,
      sessionId: analysisResult.sessionId
    })
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

---

## Usage Tracking & Cost Control

### Cost Control Service
```typescript
// lib/services/ai/cost-control.service.ts
export class AIcostControlService {
  async checkUsageLimits(userId: string, setupId: string): Promise<UsageCheckResult> {
    const now = new Date()
    
    // Check daily limits
    const dailyUsage = await this.getDailyUsage(userId, setupId)
    const setup = await this.getAISetup(setupId)
    
    if (dailyUsage.cost >= setup.max_cost_per_user_daily) {
      return { 
        allowed: false, 
        reason: 'Daily cost limit exceeded',
        resetTime: this.getNextDayStart()
      }
    }
    
    if (dailyUsage.requests >= setup.max_requests_per_day) {
      return {
        allowed: false,
        reason: 'Daily request limit exceeded', 
        resetTime: this.getNextDayStart()
      }
    }
    
    // Check global limits
    const globalUsage = await this.getGlobalDailyUsage()
    if (globalUsage.cost >= setup.max_global_cost_daily) {
      return {
        allowed: false,
        reason: 'System at capacity, try again later',
        resetTime: this.getNextDayStart()
      }
    }
    
    return { allowed: true }
  }
  
  async trackUsage(
    userId: string,
    setupId: string,
    cost: number,
    tokens: number
  ): Promise<void> {
    // Update or create daily quota record
    await this.upsertDailyQuota(userId, setupId, { cost, tokens, requests: 1 })
    
    // Update global usage tracking
    await this.updateGlobalUsage({ cost, tokens, requests: 1 })
  }
}
```

### Usage Monitoring Dashboard Data
```typescript
// lib/services/ai/usage-monitoring.service.ts
export class UsageMonitoringService {
  async getUserUsageReport(userId: string, days: number = 30): Promise<UsageReport> {
    // Get user's AI usage across all functions
    // Calculate cost breakdown by function type
    // Generate trend analysis
    // Compare against limits
    
    return {
      totalCost: 45.67,
      totalRequests: 234,
      breakdown: {
        prescription_scanning: { cost: 23.45, requests: 45 },
        chatbot: { cost: 12.22, requests: 156 },
        medical_analysis: { cost: 10.00, requests: 33 }
      },
      trends: {
        dailyAverage: 1.52,
        peakUsageDay: '2025-08-25',
        mostUsedFunction: 'chatbot'
      },
      warnings: [
        'Approaching daily limit for prescription scanning',
        'Higher than average usage this week'
      ]
    }
  }
  
  async getSystemUsageReport(): Promise<SystemUsageReport> {
    // Overall system usage metrics
    // Cost breakdown by provider
    // Performance metrics
    // Error rates and reliability
    
    return {
      globalCost: 2456.78,
      totalUsers: 1245,
      providerBreakdown: {
        openai: { cost: 1456.78, requests: 12450 },
        anthropic: { cost: 756.00, requests: 5670 },
        google: { cost: 244.00, requests: 1230 }
      },
      performance: {
        averageResponseTime: 2.3, // seconds
        errorRate: 0.02, // 2%
        successRate: 99.8
      }
    }
  }
}
```

---

## Frontend Integration

## Admin Panel Architecture (Isolated Stream)

### Admin Route Structure (Completely Separate from Patient)
```
app/admin/
├── layout.tsx                          # Admin-specific layout with auth
├── page.tsx                           # Admin dashboard overview
├── ai-services/
│   ├── page.tsx                       # AI services management hub  
│   ├── api-keys/
│   │   ├── page.tsx                   # API keys management list
│   │   ├── new/page.tsx               # Add new API key
│   │   └── [id]/page.tsx              # Edit API key
│   ├── setups/
│   │   ├── page.tsx                   # AI setups list
│   │   ├── new/page.tsx               # Create AI setup
│   │   └── [id]/page.tsx              # Edit AI setup
│   ├── usage/
│   │   ├── page.tsx                   # Usage monitoring dashboard
│   │   ├── reports/page.tsx           # Detailed usage reports
│   │   └── costs/page.tsx             # Cost analysis
│   └── audit/
│       ├── page.tsx                   # AI audit log viewer
│       └── compliance/page.tsx        # Compliance reports
├── users/
│   ├── page.tsx                       # User management
│   └── [id]/page.tsx                  # User details
└── system/
    ├── page.tsx                       # System settings
    └── monitoring/page.tsx             # System health

config/
└── adminNav.ts                        # Admin navigation separate from patient
```

### Admin Authentication & Authorization
```typescript
// app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth/require-admin'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Admin-specific authentication check
  const admin = await requireAdmin()
  
  return (
    <AdminLayoutClient 
      adminUser={admin}
      sidebarItems={adminNavItems}
    >
      {children}
    </AdminLayoutClient>
  )
}

// lib/auth/require-admin.ts
export async function requireAdmin() {
  const { supabase, user } = await getAuthenticatedServerClient()
  
  if (!user) {
    redirect('/admin/login')
  }
  
  // Check if user has admin role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
    
  if (userRole?.role !== 'admin') {
    redirect('/admin/unauthorized')
  }
  
  return { ...user, role: 'admin' }
}
```

### Admin Navigation Configuration
```typescript
// config/adminNav.ts
export const adminNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard', 
    icon: 'LayoutGrid',
    href: '/admin'
  },
  {
    id: 'ai-services',
    label: 'AI Services',
    icon: 'Bot',
    href: '/admin/ai-services',
    children: [
      { id: 'api-keys', label: 'API Keys', icon: 'Key', href: '/admin/ai-services/api-keys' },
      { id: 'setups', label: 'AI Setups', icon: 'Settings', href: '/admin/ai-services/setups' },
      { id: 'usage', label: 'Usage', icon: 'BarChart', href: '/admin/ai-services/usage' },
      { id: 'audit', label: 'Audit Log', icon: 'FileText', href: '/admin/ai-services/audit' }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'Users', 
    href: '/admin/users'
  },
  {
    id: 'system',
    label: 'System',
    icon: 'Server',
    href: '/admin/system',
    children: [
      { id: 'monitoring', label: 'Monitoring', icon: 'Activity', href: '/admin/system/monitoring' },
      { id: 'settings', label: 'Settings', icon: 'Cog', href: '/admin/system/settings' }
    ]
  }
]
```

### AI Services Management Hub
```typescript
// app/admin/ai-services/page.tsx
import { requireAdmin } from '@/lib/auth/require-admin'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { adminNavItems } from '@/config/adminNav'

export default async function AIServicesAdminPage() {
  const admin = await requireAdmin()
  
  // Fetch AI service statistics server-side
  const stats = await getAIServiceStats()
  
  const aiServicesConfig = {
    title: 'AI Services Management',
    subtitle: 'Configure and monitor AI providers',
    tiles: [
      {
        id: 'api-keys',
        title: 'API Keys',
        description: 'Manage AI provider API keys',
        status: { 
          text: `${stats.activeKeys} active keys`, 
          tone: 'info' as const 
        },
        icon: 'Key',
        href: '/admin/ai-services/api-keys',
        accent: 'blue' as const
      },
      {
        id: 'ai-setups',
        title: 'AI Setups',
        description: 'Configure AI models and parameters',
        status: { 
          text: `${stats.activeSetups} configurations`, 
          tone: 'info' as const 
        },
        icon: 'Settings',
        href: '/admin/ai-services/setups', 
        accent: 'blue' as const
      },
      {
        id: 'usage-monitoring',
        title: 'Usage Monitoring',
        description: 'Track AI usage and costs',
        status: { 
          text: `$${stats.todayCost} spent today`, 
          tone: stats.todayCost > 100 ? 'warning' : 'success' 
        },
        icon: 'BarChart',
        href: '/admin/ai-services/usage',
        accent: 'blue' as const
      },
      {
        id: 'audit-log',
        title: 'Audit Log',
        description: 'Review AI interaction history',
        status: { 
          text: `${stats.todayRequests} requests today`, 
          tone: 'info' as const 
        },
        icon: 'FileText',
        href: '/admin/ai-services/audit',
        accent: 'blue' as const
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={adminNavItems}
      headerTitle="AI Services"
      headerSubtitle="Artificial Intelligence Management"
      tileConfig={aiServicesConfig}
    />
  )
}
```

### Admin Layout Components
```typescript
// app/admin/AdminLayoutClient.tsx
'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface AdminLayoutClientProps {
  children: React.ReactNode
  adminUser: { id: string; email: string; role: string }
  sidebarItems: NavItem[]
}

export default function AdminLayoutClient({ 
  children, 
  adminUser, 
  sidebarItems 
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Sidebar */}
      <AdminSidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        adminUser={adminUser}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <AdminHeader
          title="Scrypto Admin"
          user={adminUser}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Admin-Specific Components
```typescript
// components/admin/AdminSidebar.tsx
export default function AdminSidebar({ 
  items, 
  isOpen, 
  onToggle, 
  adminUser 
}: AdminSidebarProps) {
  return (
    <aside className={`
      fixed top-0 left-0 z-50 h-screen bg-gray-800 dark:bg-gray-900 text-white
      transition-all duration-300 border-r border-gray-700
      ${isOpen ? 'w-64' : 'w-16'}
    `}>
      {/* Admin Logo */}
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <span className="text-lg font-semibold">Scrypto Admin</span>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4 px-2">
        {items.map(item => (
          <AdminNavItem 
            key={item.id}
            item={item}
            isCollapsed={!isOpen}
          />
        ))}
      </nav>
      
      {/* Admin User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{adminUser.email}</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

// components/admin/AdminHeader.tsx
export default function AdminHeader({ title, user, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Theme Toggle */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* User Menu */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{user.email}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  )
}
```

### Prescription Scanning Integration
```typescript
// Update PrescriptionScanClient.tsx to use AI service
const handleContinue = async () => {
  if (!capturedImage) return
  
  setProcessing(true)
  try {
    // Call AI analysis API
    const response = await fetch('/api/patient/presc/scanning/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: capturedImage,
        fileName: `prescription_${Date.now()}.jpg`,
        fileType: 'image/jpeg'
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Show analysis results
      setAnalysisResult(result.data)
      setShowResults(true)
    } else {
      // Show error or "not a prescription" message
      setError(result.error)
    }
    
  } catch (error) {
    setError('Analysis failed. Please try again.')
  } finally {
    setProcessing(false)
  }
}
```

### ChatDock Integration
```typescript
// Update ChatDock.tsx to use AI chatbot service
export default function ChatDock() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const sendMessage = async (content: string) => {
    const newMessage = { role: 'user', content }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          setupId: 'medical_chatbot_default'
        })
      })
      
      // Handle streaming response
      const reader = response.body?.getReader()
      let aiResponse = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        aiResponse += chunk
        
        // Update UI with streaming text
        setMessages(prev => [
          ...prev.slice(0, -1),
          newMessage,
          { role: 'assistant', content: aiResponse }
        ])
      }
      
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    // Enhanced ChatDock with AI integration
  )
}
```

---

## Security & Compliance

### API Key Encryption
```typescript
// lib/services/ai/encryption.service.ts
export class AIEncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyDerivation = 'pbkdf2'
  
  async encryptAPIKey(apiKey: string, keyName: string): Promise<EncryptedKeyResult> {
    const salt = crypto.randomBytes(16)
    const iv = crypto.randomBytes(12)
    const derivedKey = crypto.pbkdf2Sync(this.getMasterKey(), salt, 100000, 32, 'sha256')
    
    const cipher = crypto.createCipherGCM(this.algorithm, derivedKey, iv)
    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    
    const result = {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex'),
      hash: crypto.createHash('sha256').update(apiKey).digest('hex')
    }
    
    // Audit log the encryption
    await this.logAPIKeyAction(keyName, 'encrypted', 'API key encrypted and stored')
    
    return result
  }
  
  async decryptAPIKey(encryptedData: EncryptedKeyData): Promise<string> {
    // Decrypt with proper verification
    // Log access for audit trail
    // Verify hash matches original
    
    const derivedKey = crypto.pbkdf2Sync(
      this.getMasterKey(), 
      Buffer.from(encryptedData.salt, 'hex'), 
      100000, 32, 'sha256'
    )
    
    const decipher = crypto.createDecipherGCM(
      this.algorithm, 
      derivedKey, 
      Buffer.from(encryptedData.iv, 'hex')
    )
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

### Medical Data Compliance
```typescript
// lib/services/ai/compliance.service.ts
export class AIComplianceService {
  async auditAIUsage(userId: string, days: number = 30): Promise<ComplianceReport> {
    // Generate compliance report for medical data processing
    // Include all AI interactions with PHI
    // Track data retention and disposal
    // Verify access controls and permissions
    
    const history = await this.getAIHistoryForCompliance(userId, days)
    
    return {
      totalPHIInteractions: history.filter(h => h.contains_phi).length,
      dataRetentionCompliance: this.checkRetentionCompliance(history),
      accessControlViolations: this.checkAccessViolations(history),
      costCompliance: this.checkCostCompliance(history),
      recommendations: this.generateComplianceRecommendations(history)
    }
  }
  
  async cleanupExpiredData(): Promise<CleanupResult> {
    // Clean up AI history older than retention period
    // Remove expired sessions and temporary data
    // Cleanup orphaned files and images
    // Generate cleanup audit trail
    
    const expiredRecords = await this.findExpiredRecords()
    const cleanupResult = await this.performCleanup(expiredRecords)
    
    await this.logCleanupAudit(cleanupResult)
    
    return cleanupResult
  }
}
```

---

## Implementation Plan

### Phase 1: Database Foundation (Week 1)
1. **Create AI tables migration** with proper RLS and indexes
2. **Implement encryption service** for secure API key storage
3. **Seed initial AI setups** for prescription scanning and chatbot
4. **Create repository classes** for AI data access

### Phase 2: AI Connector Layer (Week 1-2)
1. **Port Vercel AI SDK integration** from ultimate-chat patterns
2. **Create generic AI connector** with provider abstraction  
3. **Implement usage tracking** and cost monitoring
4. **Add comprehensive error handling** and retry logic

### Phase 3: Service Implementation (Week 2)
1. **Create prescription scanning AI service** with OpenAI Vision
2. **Create medical chatbot service** for patient support
3. **Implement AI history logging** and audit trails
4. **Add rate limiting and cost controls**

### Phase 4: Frontend Integration (Week 2-3)
1. **Create AI admin panel** for managing setups and API keys
2. **Integrate prescription scanning** with camera workflow
3. **Enhance ChatDock** with AI chatbot functionality
4. **Implement usage dashboards** and monitoring interfaces

### Phase 5: Testing & Compliance (Week 3)
1. **Comprehensive AI testing** with mock and real providers
2. **Security testing** for API key protection and access controls
3. **Cost control testing** with usage limit scenarios
4. **Medical compliance audit** and documentation

---

## Key Benefits

### 1. **Multi-Provider Flexibility**
- Switch between OpenAI, Anthropic, Google without code changes
- A/B testing different models for same medical function
- Cost optimization through intelligent provider selection
- Reliability through automatic failover

### 2. **Medical-Grade Security** 
- Encrypted API key storage with proper key management
- Complete audit trail for regulatory compliance
- User-scoped access controls and permissions
- PHI handling compliance with retention policies

### 3. **Enterprise Cost Management**
- Real-time usage tracking and cost monitoring
- Per-user and global usage limits
- Cost breakdown by function and provider
- Automated alerts and usage optimization

### 4. **Extensible Architecture**
- Add new AI functions without infrastructure changes
- Support future medical AI use cases (diagnosis, drug interactions)
- Clean separation between AI logic and business logic
- Standardized patterns for all AI integrations

---

## Success Criteria

### Technical Requirements
- ✅ Multiple AI providers working through single interface
- ✅ Complete audit trail of all AI interactions
- ✅ Real-time cost tracking and usage limits
- ✅ Secure API key management with encryption
- ✅ Medical data validation and compliance

### Business Requirements
- ✅ Cost control preventing budget overruns
- ✅ Usage monitoring and optimization insights
- ✅ Scalable foundation for future AI features
- ✅ Regulatory compliance for medical AI usage
- ✅ Professional medical chatbot experience

### Integration Requirements
- ✅ Prescription scanning works with camera workflow
- ✅ Chatbot integrates seamlessly with ChatDock
- ✅ Admin panel provides complete AI management
- ✅ SSR rendering with proper server-side data fetching
- ✅ Mobile-optimized AI interactions

---

**IMPLEMENTATION READY**: This specification provides a comprehensive, enterprise-ready AI service architecture that leverages proven Vercel AI SDK patterns while adding medical-grade security, compliance, and cost controls necessary for healthcare applications.