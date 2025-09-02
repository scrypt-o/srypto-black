# AI Settings Configuration Specification

**Date**: 2025-09-02  
**Purpose**: User-configurable AI settings for prescription scanning and other AI services

---

## 🎯 **OVERVIEW**

### **Problem Statement**
**Current Issue**: AI services use **hardcoded fallbacks** when user configuration is missing
**Solution**: **AI Settings page** where users configure their **personal AI preferences**

### **Database Integration**
**Table**: `ai_setup` (already exists)
**Purpose**: Store **user-specific AI configuration** for prescription analysis and future AI services

---

## 🗄️ **DATABASE STRUCTURE**

### **ai_setup Table Fields**
```sql
-- User AI Configuration
ai_setup {
  id: UUID PRIMARY KEY,
  user_id: UUID REFERENCES auth.users(id),
  ai_type: TEXT ('prescription_analysis', 'medical_chat', etc.),
  ai_model_provider: TEXT ('openai', 'anthropic', etc.),
  ai_model: TEXT ('gpt-4o', 'gpt-4-turbo', 'claude-3-opus'),
  ai_api_key: TEXT (user's personal API key),
  ai_temperature: NUMERIC (0.0-2.0, default 0.1),
  ai_max_tokens: INTEGER (default 2000),
  ai_system_instructions: TEXT (custom prompts),
  configuration: JSONB (additional settings),
  is_active: BOOLEAN (default true),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### **View for User Access**
```sql
CREATE OR REPLACE VIEW v_patient_ai_settings AS
SELECT 
  ai_type,
  ai_model_provider,
  ai_model,
  ai_temperature,
  ai_max_tokens,
  ai_system_instructions,
  configuration,
  is_active,
  created_at,
  updated_at
FROM ai_setup
WHERE user_id = auth.uid()
ORDER BY ai_type;
```

---

## 🖥️ **UI IMPLEMENTATION**

### **Navigation Integration**
**Location**: Settings → AI Settings  
**URL**: `/patient/settings/ai`  
**Layout**: `DetailPageLayout` (same as other personal info)

### **Form Fields**

#### **Prescription Analysis Configuration**
```typescript
interface AISettingsForm {
  // Provider Selection
  ai_model_provider: 'openai' | 'anthropic'  // Dropdown
  ai_model: string                           // Dropdown based on provider
  
  // API Authentication  
  ai_api_key: string                         // Password input (encrypted display)
  
  // Analysis Parameters
  ai_temperature: number                     // Slider 0.0-1.0
  ai_max_tokens: number                      // Number input 500-4000
  
  // Custom Instructions
  ai_system_instructions: string             // Textarea
  
  // Additional Settings
  enable_cost_monitoring: boolean            // Checkbox
  daily_request_limit: number                // Optional limit (user choice)
}
```

#### **Field Specifications**
```typescript
const aiSettingsFields: DetailField[] = [
  {
    key: 'ai_model_provider',
    label: 'AI Provider',
    type: 'select',
    required: true,
    description: 'Choose your preferred AI service provider',
    options: [
      { value: 'openai', label: 'OpenAI (GPT models)' },
      { value: 'anthropic', label: 'Anthropic (Claude models)' }
    ]
  },
  {
    key: 'ai_model',
    label: 'AI Model', 
    type: 'select',
    required: true,
    description: 'Specific AI model for prescription analysis',
    options: [
      { value: 'gpt-4o', label: 'GPT-4O (Recommended)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' }
    ]
  },
  {
    key: 'ai_api_key',
    label: 'API Key',
    type: 'password',
    required: true,
    description: 'Your personal OpenAI API key for prescription scanning',
    placeholder: 'sk-proj-...'
  },
  {
    key: 'ai_temperature',
    label: 'Analysis Temperature',
    type: 'range',
    required: false,
    description: 'Lower values = more consistent results (0.1 recommended for medical)',
    min: 0,
    max: 1,
    step: 0.1,
    defaultValue: 0.1
  },
  {
    key: 'ai_system_instructions',
    label: 'System Instructions',
    type: 'textarea',
    required: false,
    description: 'Custom instructions for AI prescription analysis',
    rows: 4,
    placeholder: 'You are a medical prescription analyzer...'
  }
]
```

---

## 🔧 **COMPONENT IMPLEMENTATION**

### **AI Settings Page**
```typescript
// app/patient/settings/ai/page.tsx
import { getServerClient } from '@/lib/supabase-server'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import AISettingsDetailFeature from '@/components/features/settings/AISettingsDetailFeature'

export default async function AISettingsPage() {
  const supabase = await getServerClient()
  
  // Get user's AI configuration for prescription analysis
  const { data, error } = await supabase
    .from('v_patient_ai_settings')
    .select('*')
    .eq('ai_type', 'prescription_analysis')
    .single()

  return (
    <DetailPageLayout 
      sidebarItems={patientNavItems} 
      headerTitle="AI Settings"
    >
      <AISettingsDetailFeature 
        aiConfig={data} 
        error={error}
      />
    </DetailPageLayout>
  )
}
```

### **AI Settings Component**
```typescript
// components/features/settings/AISettingsDetailFeature.tsx
'use client'
import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { aiSettingsDetailConfig } from '@/config/aiSettingsDetailConfig'

export default function AISettingsDetailFeature({ aiConfig, error }) {
  if (error || !aiConfig) {
    // Show initial setup form for new users
    return <AISettingsSetupForm />
  }
  
  return <GenericDetailFeature data={aiConfig} config={aiSettingsDetailConfig} />
}
```

### **Configuration Object**
```typescript
// config/aiSettingsDetailConfig.ts
export const aiSettingsDetailConfig: DetailFeatureConfig = {
  entityName: 'AI configuration',
  entityNamePlural: 'AI settings',
  listPath: '/patient/settings',
  
  formSchema: aiSettingsFormSchema,
  transformRowToFormData: (row) => ({ 
    ai_model_provider: row.ai_model_provider,
    ai_model: row.ai_model,
    ai_api_key: row.ai_api_key,
    ai_temperature: row.ai_temperature,
    ai_system_instructions: row.ai_system_instructions
  }),
  transformFormDataToApiInput: (formData) => ({
    ai_type: 'prescription_analysis',
    ai_model_provider: formData.ai_model_provider?.trim(),
    ai_model: formData.ai_model?.trim(),
    ai_api_key: formData.ai_api_key?.trim(),
    ai_temperature: formData.ai_temperature || 0.1,
    ai_system_instructions: formData.ai_system_instructions?.trim() || 'You are a medical prescription analyzer.'
  }),
  
  fields: aiSettingsFields,
  hooks: { 
    useUpdate: useUpdateAISettings, 
    useDelete: useDeleteAISettings 
  }
}
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### **API Key Protection**
- **Encrypted storage**: API keys encrypted in database
- **Masked display**: Show only last 4 characters in UI  
- **Secure transmission**: HTTPS only for API key updates
- **User isolation**: Users can only access their own AI settings

### **Validation Requirements**
```typescript
const aiSettingsFormSchema = z.object({
  ai_model_provider: z.enum(['openai', 'anthropic']),
  ai_model: z.string().min(1),
  ai_api_key: z.string().regex(/^sk-[a-zA-Z0-9-_]+$/, 'Invalid API key format'),
  ai_temperature: z.number().min(0).max(2).optional(),
  ai_system_instructions: z.string().max(2000).optional()
})
```

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements**
- **AI Settings page** accessible from Settings sidebar
- **User configuration** saves to ai_setup table
- **Prescription scanning** uses user's personal AI settings
- **Form validation** ensures proper API key format and parameters

### **User Experience**
- **Easy setup**: Clear instructions for obtaining API keys
- **Visual feedback**: Show when settings are properly configured
- **Error handling**: Clear messages for invalid configurations
- **Security**: API keys properly masked and protected

**This creates user-controllable AI configuration** that **eliminates hardcoded fallbacks** and **enables personalized AI settings** for prescription scanning and future AI features.

---

**Simple, clean implementation** following **existing DetailPageLayout patterns** with **proper form handling** and **database integration**.