# Table: patient__medications__history - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for historical medication records table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medications__history
```

### Primary Key
```sql
med_history_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
related_condition_id → patient__medhist__conditions(condition_id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `med_history_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `medication_name` | `text` | YES | `null` | Full medication name |
| `brand_name` | `text` | YES | `null` | Commercial brand name |
| `generic_name` | `text` | YES | `null` | Generic/scientific name |
| `active_ingredient` | `text` | YES | `null` | Primary active ingredient |
| `dosage_value` | `numeric(8,2)` | YES | `null` | Dosage amount |
| `dosage_unit` | `text` | YES | `null` | Dosage unit (mg, ml, tablets) |
| `strength_value` | `numeric(8,2)` | YES | `null` | Medication strength value |
| `strength_unit` | `text` | YES | `null` | Strength unit (mg, mg/ml) |
| `frequency` | `text` | YES | `null` | Administration frequency |
| `route_of_administration` | `text` | YES | `null` | How medication was taken |
| `start_date` | `date` | YES | `null` | Treatment start date |
| `end_date` | `date` | YES | `null` | Treatment end date |
| `prescribed_by_doctor` | `text` | YES | `null` | **SENSITIVE** Prescribing physician |
| `practice_number` | `text` | YES | `null` | **SENSITIVE** Doctor practice number |
| `indication` | `text` | YES | `null` | Reason for medication |
| `contraindications` | `text` | YES | `null` | Medical contraindications |
| `side_effects_experienced` | `text` | YES | `null` | **CRITICAL** Patient-reported side effects |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `related_condition_id` | `uuid` | YES | `null` | Link to medical condition |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medications__history
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **Historical medication tracking for medical continuity**

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `frequency` CHECK: Valid frequency patterns
- `route_of_administration` CHECK: IN ('oral', 'injection', 'topical', 'inhalation', 'sublingual')
- `start_date` <= `end_date` (when both provided)
- Index on (user_id, medication_name) for drug history searches
- Index on (user_id, start_date DESC) for chronological viewing

---

## 🎯 FILTER CONDITIONS

### For User's Medication History
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Drug History Check
```sql
WHERE user_id = auth.uid() 
  AND (medication_name ILIKE ? OR generic_name ILIKE ? OR active_ingredient ILIKE ?)
  AND is_active = true
```

### For Physician History
```sql
WHERE user_id = auth.uid() 
  AND prescribed_by_doctor = ?
  AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `med_history_id` (auto-generated)
- `user_id` (from auth.uid())

### Historical Data Integrity
- At least one medication identifier required
- `end_date` must be >= `start_date` (when both provided)
- `practice_number` format validation for healthcare provider identification

### Side Effects Tracking
- `side_effects_experienced` is critical for drug allergy identification
- Integration with allergy management system

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medications__history`
2. **The view name is**: `v_patient__medications__history`
3. **PERMANENT MEDICAL RECORD** - Never delete, only deactivate
4. **Side effects tracking** critical for future prescribing decisions
5. **Provider information** for medical continuity
6. **Drug allergy detection** through side effects analysis

---

## 🔧 API INTEGRATION POINTS

### GET Medication History
```
/api/patient/medications/history
→ SELECT * FROM v_patient__medications__history WHERE user_id = auth.uid()
```

### POST Historical Medication
```
/api/patient/medications/history
→ INSERT INTO patient__medications__history (user_id, ...)
```

### GET Drug Interaction Check
```
/api/patient/medications/history/interactions?new_drug={name}
→ Check historical reactions and contraindications
```

### GET Provider History
```
/api/patient/medications/history/provider?doctor={name}
→ All medications prescribed by specific provider
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **CONFIDENTIAL**: All medication history is protected health information (PHI)
- **SENSITIVE**: prescribed_by_doctor, practice_number
- **CRITICAL**: side_effects_experienced (drug allergy detection)

### Access Controls
- **Owner**: Full read/write access to their history
- **Healthcare Provider**: Read access with proper authorization
- **Pharmacy**: Limited read for safety checking (with consent)

### Medical Continuity
- Permanent record for provider handoffs
- Drug allergy and interaction prevention
- Treatment effectiveness tracking

---

## 📊 BUSINESS LOGIC

### Historical Tracking Purpose
- **Drug allergy identification** through side effects
- **Treatment effectiveness** analysis over time
- **Provider continuity** during care transitions
- **Medication interaction prevention**

### Side Effects Analysis
- Pattern recognition for drug sensitivities
- Integration with allergy management
- Automated flagging for similar medications

### Provider Tracking
- `prescribed_by_doctor` + `practice_number` for full provider identification
- Medical board verification support
- Care coordination facilitation

---

**CONCLUSION**: Critical historical medication tracking table ensuring patient safety through comprehensive drug history, side effect monitoring, and provider continuity for optimal care coordination.