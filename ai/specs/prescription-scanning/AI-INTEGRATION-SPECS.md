# AI Integration Specifications - Prescription Scanning

**Date**: 2025-08-30  
**AI Provider**: OpenAI Vision API via Vercel AI SDK  
**Configuration**: Database-driven via Supabase ai_setup table

---

## 🤖 **AI SERVICE ARCHITECTURE**

### **Modern Implementation**
```typescript
// lib/services/prescription-ai.service.ts
export class ModernPrescriptionAIService {
  
  // Database-driven configuration (NOT hardcoded)
  private async getAIConfig(userId: string) {
    // Fetch from ai_setup table:
    // - ai_api_key (user's OpenAI key)
    // - ai_model (gpt-4o, gpt-4-turbo, etc.)
    // - ai_temperature (0.1 for consistent medical extraction)
    // - ai_system_instructions (custom prompts)
    // - configuration (JSONB for additional settings)
  }
  
  // Main analysis function
  async analyzePrescription(request: PrescriptionAnalysisRequest) {
    // 1. Fetch user-specific AI configuration
    // 2. Initialize OpenAI client with user settings
    // 3. Process image with structured output schema
    // 4. Upload image to secure storage
    // 5. Log interaction for audit and cost tracking
    // 6. Return structured prescription data
  }
}
```

### **Structured Output Schema**
```typescript
const PrescriptionSchema = z.object({
  isPrescription: z.boolean(),           // Primary validation
  patientName: z.string().optional(),    // Patient first name
  patientSurname: z.string().optional(), // Patient last name
  doctorName: z.string().optional(),     // Prescribing doctor
  practiceNumber: z.string().optional(), // Doctor's practice number
  issueDate: z.string().optional(),      // Prescription date
  diagnosis: z.string().optional(),      // Medical condition
  medications: z.array(z.object({        // Extracted medications
    name: z.string(),                    // Medication name
    dosage: z.string(),                  // Strength/dosage
    frequency: z.string(),               // How often to take
    duration: z.string(),                // How long to take
    instructions: z.string().optional()  // Special instructions
  })).optional(),
  overallConfidence: z.number().min(0).max(100), // AI confidence score
  scanQuality: z.number().min(0).max(100),       // Image quality score
  aiWarnings: z.array(z.string()).optional()     // Analysis warnings
})
```

---

## 🗄️ **DATABASE CONFIGURATION**

### **ai_setup Table Structure**
```sql
-- User-specific AI configuration
CREATE TABLE ai_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  ai_type TEXT NOT NULL,                    -- 'prescription_analysis'
  ai_model_provider TEXT NOT NULL,          -- 'openai'
  ai_model TEXT NOT NULL,                   -- 'gpt-4o'
  ai_api_key TEXT,                          -- User's API key (encrypted)
  ai_temperature NUMERIC DEFAULT 0.1,      -- Analysis consistency
  ai_max_tokens INTEGER DEFAULT 2000,      -- Token limit
  ai_system_instructions TEXT,              -- Custom prompts
  configuration JSONB DEFAULT '{}',        -- Additional settings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

### **Configuration Usage Pattern**
```typescript
// 1. User creates AI configuration (one-time setup)
INSERT INTO ai_setup (user_id, ai_type, ai_model_provider, ai_model, ai_api_key)
VALUES (auth.uid(), 'prescription_analysis', 'openai', 'gpt-4o', 'user-api-key')

// 2. Service fetches configuration for analysis
const config = await supabase
  .from('ai_setup')
  .select('*')
  .eq('user_id', userId)
  .eq('ai_type', 'prescription_analysis')
  .eq('is_active', true)
  .single()

// 3. Initialize AI client with user settings
const openaiClient = createOpenAI({ apiKey: config.ai_api_key })
```

---

## 📊 **USAGE MONITORING**

### **ai_audit_log Table Integration**
```sql
-- Complete audit trail for AI interactions
CREATE TABLE ai_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation TEXT NOT NULL,              -- 'prescription_analysis'
  success BOOLEAN NOT NULL,
  cost_incurred NUMERIC DEFAULT 0,
  metadata JSONB,                       -- Processing details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

### **Usage Statistics Calculation**
```typescript
// Admin functionality for monitoring
async getUsageStats(userId?: string, dateRange?: object) {
  // Calculate aggregated statistics:
  // - Total requests (successful + failed)
  // - Total cost incurred
  // - Average processing time
  // - Average confidence scores
  // - Recent request details for troubleshooting
}
```

### **Cost Control Implementation**
```typescript
// lib/services/ai-cost-control.service.ts
export class AICostControlService {
  private readonly DAILY_REQUEST_LIMIT = 20    // Configurable per user
  private readonly DAILY_COST_LIMIT = 5.00     // Dollar limit per day
  
  async checkUsageLimits(userId: string): Promise<UsageQuota> {
    // Check today's usage against limits
    // Return allowed/denied with usage details
  }
}
```

---

## 🔄 **ERROR HANDLING & RECOVERY**

### **AI Service Error Categories**
1. **Configuration errors**: Missing API keys, invalid models
2. **Network errors**: API timeouts, connectivity issues
3. **Validation errors**: Invalid images, corrupt data
4. **Quota errors**: Usage limits exceeded, insufficient credits
5. **Processing errors**: AI analysis failures, unexpected responses

### **Error Recovery Strategies**
- **Retry mechanism**: Automatic retry for transient failures
- **Graceful degradation**: Fallback to basic OCR if AI fails
- **User feedback**: Clear error messages with actionable guidance
- **Admin alerts**: Monitoring for systematic failures

---

## 🎯 **PERFORMANCE OPTIMIZATION**

### **Image Processing**
- **Quality optimization**: High-resolution capture for better AI analysis
- **Compression**: Efficient JPEG encoding for network transfer
- **Progressive upload**: Streaming upload for large images
- **Cache management**: Temporary storage for analysis workflow

### **AI Processing**
- **Model selection**: User-configurable model choice for speed/accuracy tradeoffs
- **Token optimization**: Efficient prompting to minimize costs
- **Response streaming**: Real-time feedback during processing
- **Caching**: Results caching for duplicate image analysis

**The technical architecture provides a robust, scalable foundation** for AI-powered prescription scanning with enterprise-grade monitoring and configuration management.