# Table: patient__presc__prescriptions - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for AI-powered prescription processing table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__presc__prescriptions
```

### Primary Key
```sql
prescription_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `prescription_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `image_url` | `text` | YES | `null` | Prescription scan image URL |
| `extracted_text` | `text` | YES | `null` | **AI FIELD** OCR extracted text |
| `patient_name` | `text` | YES | `null` | **AI EXTRACTED** Patient first name |
| `patient_surname` | `text` | YES | `null` | **AI EXTRACTED** Patient surname |
| `dr_name` | `text` | YES | `null` | **AI EXTRACTED** Doctor first name |
| `dr_surname` | `text` | YES | `null` | **AI EXTRACTED** Doctor surname |
| `practice_number` | `text` | YES | `null` | **AI EXTRACTED** Practice number |
| `prescription_date` | `date` | YES | `null` | **AI EXTRACTED** Date prescribed |
| `condition_diagnosed` | `text` | YES | `null` | **AI EXTRACTED** Diagnosed condition |
| `medications_prescribed` | `jsonb` | YES | `null` | **AI EXTRACTED** Medications array |
| `inferred_diagnosis` | `text` | YES | `null` | **AI INFERRED** Likely diagnosis |
| `inferred_side_effects` | `text` | YES | `null` | **AI INFERRED** Potential side effects |
| `inferred_contraindications` | `text` | YES | `null` | **AI INFERRED** Contraindications |
| `scan_quality_score` | `numeric(4,2)` | YES | `null` | **AI FIELD** Image quality (0-100) |
| `prescriber_name` | `text` | YES | `null` | **COMPUTED** Full prescriber name |
| `prescriber_practice_number` | `text` | YES | `null` | **COMPUTED** Practice number |
| `status` | `text` | YES | `null` | Processing status |
| `medications` | `jsonb` | YES | `null` | **STRUCTURED** Medications data |
| `total_items` | `integer` | YES | `null` | Total medication items |
| `collection_status` | `text` | YES | `null` | Collection/fulfillment status |
| `pharmacy_details` | `jsonb` | YES | `null` | Assigned pharmacy data |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `scan_confidence` | `numeric(5,4)` | YES | `null` | **AI FIELD** Overall confidence (0.0-1.0) |
| `scan_note` | `text` | YES | `null` | **AI FIELD** Processing notes |
| `submitted_at` | `timestamp with time zone` | YES | `null` | Pharmacy submission timestamp |
| `submission_status` | `text` | YES | `null` | Submission workflow status |
| `mvr_data` | `jsonb` | YES | `null` | **AI MVR** Minimal Viable Record |
| `ai_confidence_score` | `numeric(5,2)` | YES | `null` | **AI FIELD** Confidence (0-100) |
| `ai_warnings` | `ARRAY` | YES | `null` | **AI FIELD** Processing warnings |
| `ai_verified_at` | `timestamp with time zone` | YES | `null` | AI verification timestamp |
| `inferred_diagnoses` | `jsonb` | YES | `'[]'::jsonb` | **AI FIELD** Top 3 diagnoses with confidence |
| `pharmacy_recommendations` | `jsonb` | YES | `'[]'::jsonb` | **AI FIELD** OTC product recommendations |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__presc__prescriptions
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **AI-powered prescription processing pipeline**

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `scan_confidence` CHECK: >= 0.0 AND <= 1.0
- `ai_confidence_score` CHECK: >= 0 AND <= 100
- `scan_quality_score` CHECK: >= 0.0 AND <= 100.0
- `status` CHECK: IN ('processing', 'completed', 'error', 'pending_review')
- `submission_status` CHECK: IN ('sent_to_pharmacies', 'quote_received', 'accepted', 'rejected')
- `collection_status` CHECK: IN ('pending', 'ready', 'collected', 'expired')

### Indexes
- Index on (user_id, created_at DESC) for user prescription history
- Index on (user_id, submission_status) for pharmacy workflow
- Index on (ai_confidence_score) for quality monitoring

---

## 🎯 FILTER CONDITIONS

### For User's Prescriptions
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Processing Queue
```sql
WHERE status = 'processing' 
  AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
```

### For Quality Review
```sql
WHERE user_id = auth.uid() 
  AND (ai_confidence_score < 75 OR array_length(ai_warnings, 1) > 0)
  AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `prescription_id` (auto-generated)
- `user_id` (from auth.uid())

### AI Processing Fields
- `scan_confidence`: 0.0 to 1.0
- `ai_confidence_score`: 0 to 100
- `scan_quality_score`: 0.0 to 100.0

### JSONB Field Structures
- `medications_prescribed`: Array of medication objects
- `medications`: Structured medication data with dosages
- `pharmacy_details`: Pharmacy assignment information
- `mvr_data`: Minimal Viable Record for interoperability
- `inferred_diagnoses`: Top 3 diagnoses with confidence scores
- `pharmacy_recommendations`: OTC product suggestions

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__presc__prescriptions`
2. **The view name is**: `v_patient__presc__prescriptions`
3. **AI-POWERED OCR PIPELINE** - Sophisticated prescription processing
4. **CONTAINS MEDICAL DATA** - HIPAA/GDPR compliance required
5. **Doctor/Patient PII** extracted from prescriptions
6. **Pharmacy integration** for prescription fulfillment
7. **AI confidence scoring** for quality assurance

---

## 🔧 API INTEGRATION POINTS

### POST Upload Prescription
```
/api/patient/prescriptions/prescriptions
→ INSERT with image_url, trigger AI processing
```

### GET Prescription History
```
/api/patient/prescriptions/prescriptions
→ SELECT * FROM v_patient__presc__prescriptions WHERE user_id = auth.uid()
```

### GET Processing Status
```
/api/patient/prescriptions/prescriptions/[id]/status
→ Check AI processing and pharmacy submission status
```

### POST Submit to Pharmacies
```
/api/patient/prescriptions/prescriptions/[id]/submit
→ Update submission_status, submitted_at
```

---

## 🤖 AI PROCESSING WORKFLOW

### Stage 1: OCR Extraction
- `image_url` → `extracted_text`
- `scan_quality_score` assessment
- `scan_confidence` calculation

### Stage 2: Data Structure
- Parse `extracted_text` into structured fields
- Extract patient/doctor information
- `ai_confidence_score` calculation

### Stage 3: Medical Intelligence
- `inferred_diagnosis` from medications
- `inferred_side_effects` analysis
- `inferred_contraindications` checking
- `inferred_diagnoses` top 3 with confidence

### Stage 4: Business Logic
- `mvr_data` generation for interoperability
- `pharmacy_recommendations` for OTC products
- `ai_warnings` for quality issues

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **HIGHLY SENSITIVE**: All prescription data is protected health information (PHI)
- **PII FIELDS**: patient_name, patient_surname, dr_name, dr_surname
- **MEDICAL**: All medication and diagnosis fields

### Access Controls
- **Owner**: Full read/write access to their prescriptions
- **Healthcare Provider**: Read access with proper authorization
- **Pharmacy**: Limited read for fulfillment (with consent)
- **AI System**: Automated processing permissions

### Data Retention
- **Permanent medical records** - never delete
- **Image storage** subject to privacy regulations
- **AI processing logs** for audit trails

---

## 📊 BUSINESS LOGIC

### Processing Status Lifecycle
1. **processing** - AI extraction in progress
2. **completed** - Successfully processed
3. **error** - Processing failed
4. **pending_review** - Low confidence, needs human review

### Submission Workflow
1. **sent_to_pharmacies** - Broadcast to pharmacy network
2. **quote_received** - Pharmacies provided quotes
3. **accepted** - Patient selected pharmacy
4. **rejected** - Patient declined or expired

### Quality Assurance
- `ai_confidence_score` < 75 triggers human review
- `ai_warnings` indicate processing issues
- `scan_quality_score` affects processing accuracy

---

**CONCLUSION**: Advanced AI-powered prescription processing table enabling automated OCR extraction, medical intelligence, pharmacy integration, and comprehensive quality assurance for digital healthcare workflows.