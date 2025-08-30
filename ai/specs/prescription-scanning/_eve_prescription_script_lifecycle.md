# Prescription Scanning Lifecycle - As Documented/Prescribed

## Overview
This document describes what the prescription scanning lifecycle SHOULD be according to the official Scrypto documentation and requirements, not the current implementation.

## Core Philosophy
- **Simple, secure, no-edit workflow** to prevent prescription fraud
- **Two valid AI outcomes only**: Success or Not Successful (both are valid, not errors)
- **Config-driven behavior** - nothing hardcoded
- **Design system compliance** - uses established templates and patterns

## The Prescribed User Workflow

### Step 1: User Navigation
**User wants to digitize a prescription**
- User navigates: **Prescriptions → Scan Script**
- Alternative: Home → Prescriptions tile → My Prescriptions → Scan New Prescription button
- Navigation follows: `Prescriptions (Tiles) → My Prescriptions (List) → Scan New (Camera) → Results (Detail)`

### Step 2: Capture Interface
**User captures or uploads prescription image**

**Template Used**: `CameraCaptureTemplate` (4th template for immersive capture)

**Interface Specifications**:
- **Orientation**: Always landscape mode
- **Default Camera**: Rear camera
- **Document Frame**: Thin white border for prescription placement guidance
- **Main Capture Button**: Bottom center, plain round, large
- **Switch Camera Button**: Bottom right of capture, plain round, medium
- **Floating Action Button**: Bottom left elevated, moveable, round with icon
- **Cancel Button**: Top right, white minimal style

**Capture Methods**:
- **Scan** (camera capture) - preferred method
- **Upload** (file selection) - fallback option
- *Important*: Use term "scan" not "photo" throughout

### Step 3: Image Preview
**User sees their scanned image**
- App displays the captured prescription image
- User choices:
  - **Re-scan**: Start over (clear image, return to camera)
  - **Submit for processing**: Proceed to AI analysis

### Step 4: AI Processing
**AI analyzes the prescription**

**Critical Requirements**:
- All AI settings come from DATABASE via `ai_setup` table
- Settings managed via: Sidebar → AI Services
- Never hardcode API keys, temperature, or prompts
- Uses **Medical AI Analysis Pattern** from design system

**Configuration Sources**:
- `lib/configs/medical-analysis-config.ts` - AI parameters
- `lib/configs/camera-ui-config.ts` - Camera settings
- `lib/features/prescriptions/fields.ts` - Field definitions

### Step 5: AI Results (Two Valid Outcomes)

#### Outcome A: NOT SUCCESSFUL
**AI cannot read the scan**

**Reasons might include**:
- Image too blurry
- Not a prescription document
- Inappropriate content
- Text not readable

**User Experience**:
- Message: "Could not read your scan, here is the full response"
- Shows full AI response for transparency
- Options:
  - **Scan again**: Return to camera
  - **Cancel**: Exit scanning flow

*Note: This is a VALID outcome, not an error*

#### Outcome B: SUCCESSFUL
**AI successfully extracts prescription data**

**Data Extracted**:
- Patient information (name, surname)
- Doctor information (name, practice number, phone)
- Prescription date
- Diagnosis/condition
- Medications (each with):
  - Name
  - Dosage
  - Frequency
  - Duration
  - Special instructions
  - Confidence score
  - Scan notes

**Display Template**: `DetailFormTemplate` for structured results

**User Options**:
- **Save it**: Save to patient prescriptions → Return to list
- **Re-scan**: Start over from beginning

**CRITICAL SECURITY RULE**: 
- **NO EDITING ALLOWED** - Prevents fraud (adding controlled substances)
- If user doesn't like results, they must re-scan

### Step 6: Save Operation
**If user chooses to save**

**Process**:
1. Prescription saved to `patient__presc__prescriptions` table
2. Medications saved to `patient__presc__medications` table
3. Image stored in `prescription-images` bucket
4. User redirected to prescription list
5. Success message displayed

**Database Operations**:
- Use stored procedure: `sp_patient__presc__scan_save`
- Views for reading: `v_patient__presc__prescriptions`
- All operations user-scoped by `user_id`

## Technical Architecture (As Prescribed)

### Database Layer
```sql
Tables (with proper naming):
- patient__presc__prescriptions
- patient__presc__medications

Views (for reading):
- v_patient__presc__prescriptions
- v_patient__presc__medications

Stored Procedures (for writing):
- sp_patient__presc__scan_save
- sp_patient__presc__prescriptions_update
- sp_patient__presc__prescriptions_delete
```

### API Endpoints
Following standard API Gateway pattern:
- `POST /api/patient/presc/scanning` - Analyze image
- `PUT /api/patient/presc/scanning` - Save analyzed prescription
- `GET /api/patient/presc/scanning` - Get scan history
- Standard CRUD for prescriptions management

### Validation Layer (Zod Schemas)
```typescript
// Required schemas
/schemas/patient/presc/scanning.schema.ts
/schemas/patient/presc/prescriptions.schema.ts
/schemas/patient/presc/medications.schema.ts
```

### Hooks Layer (TanStack Query)
```typescript
// Required hooks
/hooks/patient/presc/usePatientPrescScanning.ts
/hooks/patient/presc/usePatientPrescPrescriptions.ts
```

### Configuration Files
All behavior defined in configs, not hardcoded:
1. `lib/configs/camera-ui-config.ts` - Camera interface settings
2. `lib/configs/medical-analysis-config.ts` - AI analysis parameters
3. `lib/features/prescriptions/fields.ts` - Field definitions
4. `lib/configs/navigation-config.ts` - Route definitions

## Key Design Patterns (From Design System)

### Medical AI Analysis Pattern
- Image validation and processing
- Structured data extraction
- Confidence scoring
- Contraindication analysis

### Camera Capture Pattern
- Immersive full-screen experience
- Document guidance frame
- Camera switching capability
- Flash control

### Test Mode Pattern
- Detect test prescriptions
- Special handling for development

### Medical Severity Indicators Pattern
- Show contraindications
- Risk level indicators
- Warning displays

## Security Requirements

1. **Authentication**: All routes require authentication via middleware
2. **Private Storage**: Images in private bucket with signed URLs
3. **RLS Policies**: User data isolation at database level
4. **No Edit Policy**: Prevents prescription fraud
5. **Input Validation**: Zod schemas for all inputs
6. **User Scoping**: All queries filtered by `user_id`

## Testing Requirements

### Playwright Test Coverage
- Camera capture workflows
- File upload fallback
- AI success scenarios
- AI failure scenarios
- Save operation
- Navigation flows
- Mobile-specific features
- Error recovery

### Test Files
```
/scrypto-e2e-testing/tests/prescription-scanning.spec.ts
```

## Acceptance Criteria (From Documentation)

The feature is complete when:
1. ✅ Uses `CameraCaptureTemplate` for capture
2. ✅ Uses `DetailFormTemplate` for results
3. ✅ All patterns from design system implemented
4. ✅ Landscape camera, rear default, proper layout
5. ✅ Medical AI Analysis Pattern with test mode
6. ✅ Proper navigation flow integration
7. ✅ Config-driven (no hardcoding)
8. ✅ Security: private storage, auth, RLS
9. ✅ Complete Playwright test coverage
10. ✅ Mobile: camera switching, orientation, touch

## Critical Rules Summary

1. **NO EDITING** - If user doesn't like results, they re-scan
2. **AI settings from database** - Never hardcoded
3. **Two valid outcomes** - Success or Not Successful (both valid)
4. **Security focus** - Prevent prescription fraud
5. **User terminology** - Say "scan" not "photo"
6. **Template compliance** - Use established design patterns
7. **Config-driven** - All behavior in configuration files
8. **User isolation** - Data scoped by user_id
9. **Audit trail** - All scans recorded
10. **Standard patterns** - Follow Scrypto architecture

## Implementation Sequence (As Prescribed)

1. Create `CameraCaptureTemplate` (4th template)
2. Create configuration files
3. Implement design patterns
4. Build camera interface
5. Add AI integration
6. Create results display
7. Add navigation integration
8. Test everything with Playwright

## Validation Points

Use this prescribed workflow to:
- Validate current implementation
- Identify gaps and deviations
- Ensure compliance with requirements
- Maintain security standards

---

**Document Purpose**: This describes the INTENDED prescription scanning lifecycle based on official Scrypto documentation and requirements.
**Reference Documents**: 
- `/scrypto-legacy-for-examples-read-only/_eve_/workflows/prescription-scanning-workflow.md`
- `/scrypto-legacy-for-examples-read-only/_archived/_eve_old/plan/active/prescription-scanning-requirements.md`
- `/prescription-scanning-migration-plan.md`