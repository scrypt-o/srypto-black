# Prescription Scanning Migration Plan - Complete Implementation

**Date**: 2025-08-30  
**Source**: script-implementation branch (working implementation)  
**Target**: main-branch (current architecture)  
**Timeline**: 2-3 hours with testing

---

## WHAT EXISTS IN script-implementation (WORKING CODE)

### **1. CORE CAMERA FUNCTIONALITY**
**File**: `app/patient/presc/scan/PrescriptionScanClient.tsx` (500+ lines)
- ✅ **Camera permissions** and getUserMedia API handling
- ✅ **Video stream management** with front/back camera switching
- ✅ **Image capture** to canvas with quality controls
- ✅ **Flash control** and device capability detection
- ✅ **Error handling** for camera failures and permissions

### **2. AI INTEGRATION SERVICES**
**Files**: `lib/services/ai/` (6 services, 48KB total)
- ✅ **prescription-ai-modern.service.ts** - Vercel AI SDK with OpenAI Vision
- ✅ **cost-control.service.ts** - AI usage monitoring and limits
- ✅ **ai-connector.service.ts** - Generic AI provider interface
- ✅ **Zod schemas** for prescription data extraction
- ✅ **Confidence scoring** and quality assessment

### **3. API ENDPOINTS** 
**Files**: `app/api/patient/presc/scanning/`
- ✅ **analyze/route.ts** - AI analysis with CSRF + auth (already follows current patterns)
- ✅ **Storage integration** with Supabase buckets
- ✅ **Error handling** with proper status codes
- ✅ **Input validation** with Zod schemas

### **4. PRESCRIPTION DATA FLOW**
1. **Camera capture** → Base64 image
2. **Upload to storage** → Supabase bucket  
3. **AI analysis** → OpenAI Vision API with structured output
4. **Data extraction** → Patient info, medications, diagnosis
5. **Save to database** → prescription_prescriptions table
6. **User review** → Edit/approve before final save

---

## WHAT NEEDS MIGRATION (SPECIFIC TASKS)

### **PHASE 1: CORE FUNCTIONALITY MIGRATION (1 hour)**

#### **1.1 Camera Component** 
**Source**: Extract from `PrescriptionScanClient.tsx` lines 1-200
**Target**: `components/features/prescriptions/CameraCaptureFeature.tsx`
**What to bring**:
```typescript
// Camera state management
const [stream, setStream] = useState<MediaStream | null>(null)
const [hasPermission, setHasPermission] = useState<boolean | null>(null)
const [isBackCamera, setIsBackCamera] = useState(true)
const [hasFlash, setHasFlash] = useState(false)
const [capturedImage, setCapturedImage] = useState<string | null>(null)

// Camera functions
const initializeCamera = async () => { /* getUserMedia logic */ }
const captureImage = () => { /* canvas capture logic */ }
const switchCamera = () => { /* front/back toggle */ }
const toggleFlash = () => { /* flash control */ }
```

#### **1.2 AI Analysis Component**
**Source**: Extract from `PrescriptionScanClient.tsx` lines 200-350
**Target**: `components/features/prescriptions/PrescriptionAnalysisFeature.tsx`
**What to bring**:
```typescript
// AI processing state
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [analysisResult, setAnalysisResult] = useState<any>(null)
const [analysisError, setAnalysisError] = useState<string | null>(null)

// AI functions
const analyzeImage = async (imageData: string) => {
  // Call /api/patient/presc/scanning/analyze
  // Handle AI response and confidence scoring
}
```

#### **1.3 Results Display Component**  
**Source**: Extract from `PrescriptionScanClient.tsx` lines 350-500
**Target**: `components/features/prescriptions/PrescriptionResultsFeature.tsx`
**What to bring**:
```typescript
// Results display with extracted prescription data
// Save/reject functionality  
// Navigation back to prescription list
```

### **PHASE 2: AI SERVICES MIGRATION (30 minutes)**

#### **2.1 Copy AI Services**
**Source**: `lib/services/ai/prescription-ai-modern.service.ts`
**Target**: `lib/services/prescription-ai.service.ts`
**Changes needed**:
- ✅ **Already follows current patterns** (CSRF, auth, Zod validation)
- ✅ **Modern Vercel AI SDK** implementation
- ✅ **Proper error handling** and confidence scoring

#### **2.2 Copy Cost Control**
**Source**: `lib/services/ai/cost-control.service.ts` 
**Target**: `lib/services/ai-cost-control.service.ts`
**Features**:
- AI usage tracking and limits
- Cost monitoring per user
- Rate limiting for expensive operations

### **PHASE 3: API ROUTES MIGRATION (30 minutes)**

#### **3.1 Analysis Endpoint**
**Source**: `app/api/patient/presc/scanning/analyze/route.ts`
**Target**: `app/api/patient/prescriptions/analyze/route.ts`
**Status**: ✅ **Already follows current patterns** (CSRF + auth + validation)

#### **3.2 Storage Integration**
**Already exists**: Storage upload/signed-url endpoints
**Update needed**: Ensure prescription images go to correct bucket

### **PHASE 4: CONFIGURATION & INTEGRATION (30 minutes)**

#### **4.1 Configuration Files**
**Create**: `config/prescriptionScanConfig.ts`
```typescript
export const cameraConfig = {
  defaultCamera: 'environment',
  videoConstraints: { width: 1920, height: 1080 },
  captureFormat: 'image/jpeg',
  quality: 0.9,
  flashSupport: true
}

export const aiConfig = {
  analysisEndpoint: '/api/patient/prescriptions/analyze',
  timeout: 30000,
  retryAttempts: 3,
  confidenceThreshold: 75,
  qualityThreshold: 60
}
```

#### **4.2 Navigation Integration**
**Update**: Prescriptions tile in patient dashboard
**Add**: "Scan Prescription" option in prescriptions menu

### **PHASE 5: TESTING & VALIDATION (30 minutes)**

#### **5.1 Camera Testing**
- [ ] Camera permissions request works
- [ ] Front/back camera switching works
- [ ] Image capture produces clear base64 data
- [ ] Flash control functions properly
- [ ] Error handling for denied permissions

#### **5.2 AI Testing**  
- [ ] Image upload to analysis endpoint works
- [ ] OpenAI Vision API returns structured data
- [ ] Confidence scoring works correctly
- [ ] Error handling for failed analysis
- [ ] Cost control limits function

#### **5.3 Integration Testing**
- [ ] Full flow: Camera → Capture → Analyze → Results → Save
- [ ] Navigation between steps works smoothly
- [ ] Data persistence to database works
- [ ] Error recovery at each step

---

## ARCHITECTURAL DECISIONS

### **CLIENT-SIDE APPROACH (CORRECT)**
**Why pure client-side**:
- ✅ **Camera access**: Browser APIs only
- ✅ **Real-time preview**: User needs immediate feedback
- ✅ **Device storage**: Local image handling before upload
- ✅ **Responsive UI**: Camera controls need device interaction

**SSR would be stupid for prescription scanning** - you're absolutely right.

### **COMPONENT SEPARATION**
**Instead of 500-line monolith**:
- `CameraCaptureFeature.tsx` - Camera responsibility only
- `PrescriptionAnalysisFeature.tsx` - AI processing only
- `PrescriptionResultsFeature.tsx` - Results display only
- Each ~150-200 lines with clear boundaries

### **CONFIGURATION-DRIVEN**
**Instead of hardcoded values**:
- Camera settings configurable
- AI endpoints and timeouts configurable  
- Quality thresholds adjustable
- Error messages customizable

---

## INTEGRATION COMPLEXITY ASSESSMENT

### **LOW COMPLEXITY (Direct Copy)**
- ✅ **AI services** - Already follow current patterns
- ✅ **API routes** - Already have CSRF + auth + validation
- ✅ **Camera logic** - Pure JavaScript, framework-agnostic

### **MEDIUM COMPLEXITY (Pattern Updates)**
- 🟡 **Component separation** - Split monolith into focused components
- 🟡 **Configuration** - Extract hardcoded values to config files
- 🟡 **Navigation integration** - Wire into current layout architecture

### **HIGH COMPLEXITY (Architecture Alignment)**
- 🔴 **Layout integration** - Must work with current layout mess (once fixed)
- 🔴 **Authentication** - Remove requireUser(), ensure middleware compatibility
- 🔴 **Error boundaries** - Integrate with current error handling patterns

---

## MIGRATION TIMELINE

### **IMMEDIATE (Next 2 hours)**
1. **Copy core functionality** - Camera + AI + Results components
2. **Update authentication** - Remove requireUser(), use middleware
3. **Create configurations** - Extract settings to config files
4. **Basic integration** - Get scanning flow working in current app

### **AFTER STAKEHOLDER MEETING**
1. **Layout architecture fix** - Once header mess is resolved
2. **Polish integration** - Proper navigation and styling
3. **Comprehensive testing** - End-to-end validation
4. **Documentation update** - Add to prescription scanning specs

---

## RISK ASSESSMENT

### **LOW RISK**
- **Core functionality is proven** - works in script-implementation
- **AI services are modern** - already follow best practices
- **API patterns match** - current CSRF + auth standards

### **MEDIUM RISK**  
- **Layout integration** - Current layout architecture is messy
- **Component boundaries** - Need clear separation of concerns
- **Testing complexity** - Camera + AI requires device testing

**RECOMMENDATION**: **Proceed with migration** - the prescription scanning functionality is solid and just needs integration with current architecture patterns.

**The complex part (camera + AI) is already solved** - just need to fit it into the current layout system.