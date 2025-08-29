# Prescription Scanning System - Production Ready Specification

**Feature**: `patient__presc__scanning`  
**Date**: 2025-08-26  
**Status**: Production Ready Specification  
**Domain**: Patient  
**Group**: Prescriptions (presc)  
**Item**: Scanning  

**Based on**: Legacy code analysis + Database verification + Scrypto patterns

---

## Critical Updates from Comprehensive Spec

This specification addresses production-critical gaps identified through legacy codebase analysis while leveraging the existing comprehensive database schema.

### **✅ Database Schema Confirmed**
The `patient__presc__prescriptions` table is **perfectly designed** with all necessary fields:
- AI processing fields: `scan_confidence`, `ai_confidence_score`, `ai_warnings`
- Medical intelligence: `inferred_diagnoses`, `inferred_contraindications`  
- Operational fields: `status`, `submission_status`, `pharmacy_details`
- Security: `user_id` with RLS policies

---

## **🔧 CORRECTED API Design**

### **Fixed: REST Endpoint Separation**
```typescript
// ❌ LEGACY MISTAKE (and my original spec):
POST /api/patient/presc/scanning { save: false } // analyze
POST /api/patient/presc/scanning { save: true }  // save

// ✅ CORRECT SCRYPTO PATTERN:
POST /api/patient/presc/scanning/analyze         // analyze only
POST /api/patient/presc/scanning                 // save results
```

### **1. Analyze Prescription**
`POST /api/patient/presc/scanning/analyze`

**Purpose**: Upload and analyze image with AI (no database save)

**Request:**
```typescript
{
  file: string,      // base64 encoded image
  fileName: string,  
  fileType: 'image/jpeg' | 'image/png'
}
```

**Response (Success):**
```typescript
{
  isPrescription: true,
  confidence: number,           // Overall AI confidence 0-100
  scanQuality: number,          // Image quality score 0-100
  patientName: string,
  patientSurname: string,
  doctorName: string,
  practiceNumber?: string,
  prescriptionDate: string,     // YYYY-MM-DD
  diagnosis?: string,
  medications: Medication[],
  aiWarnings?: string[],        // Quality/safety warnings
  uploadedPath: string,         // Storage path for save operation
  sessionId: string             // For session recovery
}
```

**Response (Not Prescription):**
```typescript
{
  isPrescription: false,
  reason: string,
  detectedType: string,         // 'receipt', 'document', 'unclear', etc.
  uploadedPath: string,
  sessionId: string
}
```

### **2. Save Analyzed Prescription**
`POST /api/patient/presc/scanning`

**Purpose**: Save verified analysis results to database

**Request:**
```typescript
{
  sessionId: string,           // Links to analysis session
  uploadedPath: string,        
  analysisResult: AnalysisResult,
  userConfirmed: boolean       // User reviewed and confirmed data
}
```

**Response:**
```typescript
{
  prescription: {
    prescription_id: string,
    created_at: string,
    status: 'completed' | 'pending_review'
  }
}
```

---

## **🛡️ PRODUCTION SAFETY REQUIREMENTS**

### **Medical Data Validation Layer**
```typescript
interface MedicalValidator {
  validateDosage(medication: string, dosage: string): ValidationResult
  checkPrescriptionAge(issueDate: string): ValidationResult  
  validatePatientMatch(extractedName: string, userId: string): ValidationResult
  detectDuplicatePrescription(medications: Medication[], userId: string): boolean
}

// Required validations before save:
const validations = [
  validator.validateDosage(med.name, med.dosage),
  validator.checkPrescriptionAge(result.prescriptionDate),
  validator.validatePatientMatch(`${result.patientName} ${result.patientSurname}`, user.id),
  validator.detectDuplicatePrescription(result.medications, user.id)
]
```

### **Session Recovery System**
```typescript
interface ScanningSession {
  sessionId: string,
  userId: string,
  uploadedPath?: string,
  analysisResult?: AnalysisResult,
  status: 'uploading' | 'analyzing' | 'analyzed' | 'saving' | 'completed',
  createdAt: string,
  expiresAt: string,           // 2 hour session timeout
  retryCount: number
}

// Browser refresh recovery:
// 1. Check sessionStorage for active scanning session
// 2. If found, call GET /api/patient/presc/scanning/session/{sessionId}
// 3. Restore state based on session status
```

### **AI Processing Safeguards**
```typescript
interface AIProcessingSafeguards {
  timeoutMs: 45000,           // 45 second timeout for OpenAI calls
  retryAttempts: 2,           // Maximum retry attempts
  costLimitPerUser: 100,      // Monthly cost limit per user ($)
  confidenceThreshold: 70,    // Below this = pending_review status
  dangerousWords: string[],   // Flag prescriptions with controlled substances
  maxFileSize: 10485760       // 10MB file size limit
}
```

### **Error Recovery Procedures**
```typescript
interface ErrorRecovery {
  // OpenAI timeout recovery
  handleAnalysisTimeout(): Promise<SessionRecoveryOptions>
  
  // Storage failure recovery  
  handleUploadFailure(sessionId: string): Promise<void>
  
  // Network failure recovery
  resumeInterruptedSession(sessionId: string): Promise<ScanningSession>
  
  // Corrupt data recovery
  validateAndRepairSession(session: ScanningSession): Promise<ScanningSession>
}
```

---

## **📊 OPERATIONAL MONITORING**

### **Required Metrics Tracking**
```typescript
interface ScanningMetrics {
  // Performance metrics
  trackAnalysisLatency(duration: number, success: boolean): void
  trackUploadLatency(fileSize: number, duration: number): void
  
  // Success rate tracking
  recordAnalysisOutcome(outcome: 'success' | 'not_prescription' | 'error', reason?: string): void
  recordSaveOutcome(outcome: 'saved' | 'validation_failed' | 'error'): void
  
  // Cost tracking
  trackOpenAICost(tokens: number, model: string): void
  trackStorageCost(fileSize: number): void
  
  // Quality metrics
  trackConfidenceDistribution(confidence: number): void
  trackWarningFrequency(warnings: string[]): void
}
```

### **Required Alerts**
- AI success rate drops below 85%
- Average analysis time exceeds 30 seconds
- OpenAI costs exceed budget thresholds
- High frequency of validation failures
- Storage space approaching limits

### **Audit Trail Requirements**
```sql
-- Required audit logging
INSERT INTO ai_audit_log (
  user_id,
  action_type,        -- 'scan_analyze', 'scan_save', 'scan_validate'
  resource_id,        -- prescription_id or session_id
  ai_confidence,
  processing_time_ms,
  ai_warnings,
  outcome,           -- 'success', 'failure', 'pending_review'
  metadata          -- Additional context (file size, model used, etc.)
);
```

---

## **🔒 ENHANCED SECURITY REQUIREMENTS**

### **Input Validation**
```typescript
const ScanningInputValidation = z.object({
  file: z.string()
    .min(1, 'Image required')
    .max(15000000, 'File too large (10MB limit)')  // ~10MB base64
    .refine(isValidBase64Image, 'Invalid image format'),
  fileName: z.string()
    .min(1, 'Filename required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i, 'Invalid filename'),
  fileType: z.enum(['image/jpeg', 'image/png'])
})
```

### **Rate Limiting**
```typescript
interface RateLimits {
  perUser: {
    scansPerHour: 10,
    scansPerDay: 50,
    uploadMBPerHour: 100
  },
  perIP: {
    requestsPerMinute: 30
  },
  global: {
    concurrentAnalyses: 50,    // Prevent OpenAI overload
    openAICostPerHour: 1000    // Dollar limit
  }
}
```

### **Data Protection**
- All prescription images encrypted at rest
- Signed URLs with 2-hour expiry maximum
- Automatic image cleanup after 90 days (configurable)
- PHI access logging for compliance

---

## **🧪 TESTING REQUIREMENTS**

### **E2E Test Scenarios** 
```typescript
// Critical test cases beyond basic happy path
describe('Production Edge Cases', () => {
  test('Browser refresh during analysis recovers session', async ({ page }) => {
    // Start analysis, refresh mid-process, verify recovery
  })
  
  test('Concurrent tab scanning prevents race conditions', async ({ page }) => {
    // Open multiple tabs, verify one session wins
  })
  
  test('Network timeout during analysis shows proper error', async ({ page }) => {
    // Mock slow OpenAI response, verify timeout handling
  })
  
  test('Invalid dosage triggers validation error', async ({ page }) => {
    // Mock AI returning "10000mg aspirin", verify rejection
  })
  
  test('Expired prescription shows warning', async ({ page }) => {
    // Mock old prescription date, verify age warning
  })
})
```

### **Load Testing Requirements**
- 100 concurrent scanning sessions
- 1000 prescription analyses per hour
- 10GB image uploads per hour
- Recovery from OpenAI rate limit errors

---

## **📈 SUCCESS CRITERIA**

### **Performance Targets**
- Analysis completion: 95% under 30 seconds  
- Upload success rate: 99.5%
- AI accuracy: 90% confidence scores above 80
- Session recovery: 100% successful restoration

### **Quality Targets**
- False positive rate: <2% (non-prescriptions marked as prescriptions)
- Dangerous dosage detection: 100% (must catch all unsafe dosages)
- Duplicate detection: 95% accuracy
- User satisfaction: >4.5/5 rating

### **Operational Targets**
- Uptime: 99.9% availability
- Error rate: <0.5% unrecoverable errors
- Cost efficiency: <$0.10 per successful scan
- Compliance: 100% audit trail coverage

---

## **🚀 IMPLEMENTATION PRIORITY**

### **Phase 1: Critical Fixes**
1. **Fix API endpoints** - Separate analyze/save operations
2. **Add medical validation** - Dosage range and age checks
3. **Implement session recovery** - Browser refresh handling
4. **Add monitoring** - Success rate and performance tracking

### **Phase 2: Production Hardening**
1. **Enhanced error handling** - Specific recovery procedures
2. **Rate limiting** - Prevent abuse and cost overruns  
3. **Advanced validation** - Drug interactions and duplicate detection
4. **Compliance features** - Audit trails and data retention

### **Phase 3: Optimization**
1. **Performance tuning** - Response time optimization
2. **Cost optimization** - Smart retry logic and caching
3. **UX improvements** - Better error messages and guidance
4. **Analytics** - Usage patterns and improvement opportunities

---

## **📋 IMPLEMENTATION CHECKLIST**

### **Database Layer** ✅
- [x] Schema verified - all required fields present
- [x] RLS policies confirmed
- [x] Indexes appropriate for scanning workflows

### **API Layer** ❌
- [ ] **CRITICAL**: Split analyze/save endpoints
- [ ] Add medical validation layer
- [ ] Implement session management
- [ ] Add comprehensive error handling
- [ ] Add rate limiting and monitoring

### **Frontend Layer** ❌  
- [ ] Update to use separate API endpoints
- [ ] Add session recovery logic
- [ ] Implement better error handling
- [ ] Add loading states for long operations
- [ ] Add validation feedback

### **Operations Layer** ❌
- [ ] Set up monitoring and alerting  
- [ ] Implement audit logging
- [ ] Add cost tracking
- [ ] Set up automated testing
- [ ] Create runbooks for common issues

---

**CONCLUSION**: The existing database schema is excellent and production-ready. The critical work needed is in API design corrections, medical validation layers, session management, and operational monitoring. This specification provides the roadmap to transform the "somewhat functional but horrible" legacy implementation into a production-ready medical-grade system.