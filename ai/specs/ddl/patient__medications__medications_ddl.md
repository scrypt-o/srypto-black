# Table: patient__medications__medications - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient medications tracking table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medications__medications
```

### Primary Key
```sql
medication_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
related_medical_history_id → patient__medhist__conditions(condition_id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `medication_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `medication_name` | `text` | YES | `null` | Full medication name |
| `brand_name` | `text` | YES | `null` | Commercial brand name |
| `generic_name` | `text` | YES | `null` | Generic/scientific name |
| `active_ingredient` | `text` | YES | `null` | Primary active ingredient |
| `dosage_value` | `numeric(8,2)` | YES | `null` | Dosage amount (e.g., 5.50) |
| `dosage_unit` | `text` | YES | `null` | Dosage unit (mg, ml, tablets) |
| `strength_value` | `numeric(8,2)` | YES | `null` | Medication strength value |
| `strength_unit` | `text` | YES | `null` | Strength unit (mg, mg/ml) |
| `frequency` | `text` | YES | `null` | Administration frequency |
| `route_of_administration` | `text` | YES | `null` | How medication is taken |
| `start_date` | `date` | YES | `null` | Treatment start date |
| `end_date` | `date` | YES | `null` | Treatment end date |
| `prescribed_by` | `text` | YES | `null` | **SENSITIVE** Prescribing physician |
| `indication` | `text` | YES | `null` | Reason for medication |
| `contraindications` | `text` | YES | `null` | Medical contraindications |
| `side_effects` | `text` | YES | `null` | Known side effects |
| `interactions` | `text` | YES | `null` | Drug interaction warnings |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `related_medical_history_id` | `uuid` | YES | `null` | Link to medical condition |
| `cost_per_unit` | `numeric(10,2)` | YES | `null` | Cost per unit/dose |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `scan_confidence` | `numeric(5,4)` | YES | `null` | **AI FIELD** OCR confidence (0.0-1.0) |
| `scan_note` | `text` | YES | `null` | **AI FIELD** OCR processing notes |
| `notes` | `text` | YES | `null` | User/provider notes |
| `is_critical` | `boolean` | YES | `false` | Critical medication flag |
| `prescription_date` | `date` | YES | `null` | Date medication was prescribed |
| `status` | `text` | YES | `'active'` | Medication status |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medications__medications
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS SENSITIVE DATA** for non-owner access

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `status` CHECK: IN ('active', 'discontinued', 'completed', 'paused', 'suspended')
- `frequency` CHECK: Valid frequency patterns (daily, twice daily, etc.)
- `route_of_administration` CHECK: IN ('oral', 'injection', 'topical', 'inhalation', 'sublingual')
- `scan_confidence` CHECK: >= 0.0 AND <= 1.0
- `start_date` <= `end_date` (when both provided)

---

## 🎯 FILTER CONDITIONS

### For User's Medications
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Active Medications
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND status = 'active'
  AND (end_date IS NULL OR end_date >= CURRENT_DATE)
```

### For Critical Medications
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND is_critical = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `medication_id` (auto-generated)
- `user_id` (from auth.uid())

### Medication Identification (at least one required)
- `medication_name` OR `brand_name` OR `generic_name`

### Dosage Information
- If `dosage_value` provided, `dosage_unit` is required
- If `strength_value` provided, `strength_unit` is required

### Date Validation
- `end_date` must be >= `start_date` (when both provided)
- `prescription_date` should be <= `start_date` (when both provided)

### AI Scan Fields
- `scan_confidence`: 0.0 to 1.0 decimal
- `scan_note`: OCR processing metadata

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medications__medications`
2. **The view name is**: `v_patient__medications__medications`
3. **CONTAINS MEDICAL DATA** - HIPAA/GDPR compliance required
4. **AI-Enhanced**: Includes OCR confidence and processing notes
5. **Cost Tracking**: Financial impact monitoring
6. **Critical Flag**: Emergency medication identification
7. **Flexible dosing**: Supports complex medication regimens

---

## 🔧 API INTEGRATION POINTS

### GET User Medications
```
/api/patient/medications/medications
→ SELECT * FROM v_patient__medications__medications WHERE user_id = auth.uid()
```

### POST New Medication
```
/api/patient/medications/medications
→ INSERT INTO patient__medications__medications (user_id, ...)
```

### PUT Update Medication
```
/api/patient/medications/medications/[id]
→ UPDATE patient__medications__medications SET ... WHERE medication_id = ? AND user_id = auth.uid()
```

### GET Active Medications
```
/api/patient/medications/medications?status=active
→ WHERE status = 'active' AND is_active = true
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **INTERNAL**: medication names, dosages, frequencies
- **CONFIDENTIAL**: prescribed_by, indication, contraindications
- **MEDICAL**: All fields are protected health information (PHI)

### Access Controls
- **Owner**: Full read/write access to their medications
- **Healthcare Provider**: Read access with proper authorization
- **Pharmacy**: Limited read for fulfillment (with consent)
- **System**: No direct access - use service accounts

### Privacy Considerations
- `prescribed_by` contains provider PII
- Drug interactions may reveal other conditions
- Medication history is permanent medical record

---

## 📊 BUSINESS LOGIC

### Medication Status Lifecycle
1. **active** - Currently taking medication
2. **paused** - Temporarily stopped
3. **discontinued** - Permanently stopped
4. **completed** - Finished prescribed course
5. **suspended** - Medically suspended

### Critical Medications
- Life-saving medications (insulin, heart medication)
- Emergency access requirements
- Special handling in UI/notifications

### Cost Tracking
- `cost_per_unit` for financial impact
- Integration with insurance systems
- Budget planning and alerts

---

**CONCLUSION**: Comprehensive medication tracking table with AI-enhanced data capture, flexible dosing regimens, safety monitoring, and complete medication lifecycle management.