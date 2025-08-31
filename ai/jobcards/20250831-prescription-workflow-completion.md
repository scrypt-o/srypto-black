# Job Card: Complete Prescription Workflow Implementation

**Date**: 2025-08-31  
**Owner**: Claude (Architecture Agent)  
**Status**: Planning Phase  
**Reference**: Prescription scanning specs + GenericListFeature patterns

---

## TASK OVERVIEW

Complete the missing prescription management workflow components to enable full prescription lifecycle: Scan → List → Detail → Image View.

## CURRENT STATE ANALYSIS

### ✅ WHAT EXISTS (Foundation Complete)
- **Scanning workflow**: Camera capture + file upload + AI analysis  
- **Database table**: `patient__presc__prescriptions` with comprehensive AI fields
- **AI integration**: OpenAI Vision API with Supabase configuration
- **Storage**: Images uploaded to `prescription-images` bucket with user isolation
- **Navigation**: Prescriptions sidebar → Scan + My Prescriptions tiles

### ❌ WHAT'S MISSING (Critical Gaps)
1. **Prescription list view**: Current uses old table, not GenericListFeature pattern
2. **Prescription detail page**: No detail view to show AI data + original image
3. **Secure image API**: No authenticated route to serve prescription images  
4. **Complete navigation**: List → Detail → Image workflow broken

## IMPLEMENTATION PLAN

### **Phase 1: Prescription List (GenericListFeature Pattern)**
**File**: Replace `app/patient/presc/active/page.tsx` 
**Goal**: Use GenericListFeature with prescription-specific configuration

**Components to create**:
- `config/prescriptionsListConfig.ts` - DDL field mappings for prescriptions
- `components/features/prescriptions/PrescriptionsListFeature.tsx` - 27-line component
- Update page to use SSR + GenericListFeature pattern

**Field mappings** (from DDL):
```typescript
transformRowToItem: (row: PrescriptionRow) => ({
  id: row.prescription_id,
  title: `${row.patient_name} ${row.patient_surname}` || 'Prescription',
  subtitle: row.condition_diagnosed || 'No diagnosis',  
  thirdColumn: row.prescription_date,
  severity: mapConfidence(row.scan_quality_score), // confidence → UI severity
  data: row
})
```

### **Phase 2: Prescription Detail View**
**File**: `app/patient/presc/active/[id]/page.tsx` (NEW)
**Goal**: Show AI extracted data + original prescription image

**Components to create**:
- `config/prescriptionsDetailConfig.ts` - Form fields configuration (READ-ONLY)
- `components/features/prescriptions/PrescriptionDetailFeature.tsx` - Detail component
- Special handling for image display within detail view

**Key requirements**:
- **Read-only mode**: No editing allowed (fraud prevention per specs)
- **Image display**: Show original scanned/uploaded prescription image
- **AI data display**: All extracted fields in organized layout
- **Navigation**: Back to prescription list

### **Phase 3: Secure Image API**
**File**: `app/api/files/prescriptions/[id]/route.ts` (NEW)
**Goal**: Securely serve prescription images with user authentication

**Security requirements** (from specs):
```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // 1. Verify user authentication
  // 2. Check prescription ownership (user_id match)
  // 3. Get image_url from prescription record
  // 4. Return signed URL or stream image data
  // 5. Proper headers for image content-type
}
```

### **Phase 4: Integration & Testing**
**Goal**: Complete workflow validation

**Testing checklist**:
- [ ] Scan prescription → AI analysis → Save works
- [ ] My Prescriptions list loads and displays prescriptions
- [ ] Click prescription → Detail view opens
- [ ] Detail view shows AI data + original image
- [ ] Image loading is secure and user-scoped
- [ ] No editing allowed (read-only enforcement)

## COMPLIANCE WITH CURRENT STANDARDS

### **Architecture Patterns**
- **GenericListFeature**: 94% code reduction, follows allergies pattern
- **GenericDetailFeature**: Configuration-driven with field definitions
- **API routes**: CSRF + auth + validation following current standards
- **Database access**: Reads from views, proper user ownership

### **Security Requirements**
- **No manual editing**: Per specs, extracted data cannot be modified
- **User isolation**: All data scoped by user_id with RLS
- **Secure storage**: Images served only to prescription owners
- **Audit trail**: AI interactions logged in ai_audit_log

### **Prescription-Specific Considerations**
- **Medical data**: Prescription content is sensitive health information
- **Fraud prevention**: No editing policy prevents prescription tampering  
- **Image access**: Original prescription images must be securely served
- **AI confidence**: Display confidence scores for data reliability

## SUCCESS CRITERIA

### **Navigation Flow Working**
1. **Prescriptions** → Shows tiles (Scan + My Prescriptions)
2. **My Prescriptions** → GenericListFeature with prescription data
3. **Click prescription** → Detail view with AI data + image
4. **Image display** → Securely loaded original prescription photo

### **Technical Requirements**
- ✅ **TypeScript compilation**: Clean across all components
- ✅ **Security compliance**: User authentication and data isolation  
- ✅ **Pattern compliance**: Uses GenericListFeature + GenericDetailFeature
- ✅ **Spec compliance**: Follows prescription scanning specifications

### **User Experience**
- **Complete workflow**: Scan → Save → List → Detail → View
- **No editing**: Read-only prescription data (fraud prevention)
- **Image viewing**: Original prescription image display
- **Performance**: Fast loading and responsive interface

## RISKS & MITIGATION

### **Medium Risk: Image Display**
- **Challenge**: Securely displaying stored prescription images
- **Mitigation**: Follow Supabase storage signed URL patterns

### **Low Risk: GenericDetailFeature Adaptation**  
- **Challenge**: Read-only mode for prescription data
- **Mitigation**: Configuration with disabled editing, proven pattern

**DELIVERABLE**: Complete prescription management workflow following all specifications and current architecture patterns.

---

**Ready to implement when approved.**