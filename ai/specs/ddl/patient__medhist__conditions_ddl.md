# Table: patient__medhist__conditions - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient medical conditions table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medhist__conditions
```

### Primary Key
```sql
condition_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
related_allergies_id → patient__medhist__allergies(allergy_id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `condition_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `condition_name` | `text` | YES | `null` | Name of medical condition |
| `icd10_code` | `text` | YES | `null` | ICD-10 diagnostic code |
| `other_standard_codes` | `text` | YES | `null` | Other medical coding systems |
| `diagnosis_date` | `date` | YES | `null` | Date of initial diagnosis |
| `diagnosis_doctor_name` | `text` | YES | `null` | Diagnosing doctor's first name |
| `diagnosis_doctor_surname` | `text` | YES | `null` | Diagnosing doctor's surname |
| `practice_number` | `text` | YES | `null` | Doctor's practice number |
| `severity` | `text` | YES | `null` | Condition severity level |
| `treatment` | `text` | YES | `null` | Current/past treatment |
| `current_status` | `text` | YES | `null` | Current condition status |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `related_allergies_id` | `uuid` | YES | `null` | **FOREIGN KEY** → patient__medhist__allergies |
| `notes` | `text` | YES | `null` | Additional notes |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medhist__conditions
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `severity` CHECK: IN ('mild', 'moderate', 'severe', 'critical')
- `current_status` CHECK: IN ('active', 'resolved', 'chronic', 'remission')
- Index on (user_id, diagnosis_date)

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE condition_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true ORDER BY diagnosis_date DESC
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (condition_name ILIKE '%:search%' OR treatment ILIKE '%:search%')
  AND (:severity IS NULL OR severity = :severity)
  AND (:current_status IS NULL OR current_status = :current_status)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `condition_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `condition_name` (should be required in business logic)
- `diagnosis_date` (should be required in business logic)

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medhist__conditions`
2. **The view name is**: `v_patient__medhist__conditions`
3. **Comprehensive medical condition tracking** with diagnostic codes
4. **Doctor information** stored for referencing
5. **Proper timestamps with timezone**
6. **Links to related allergies**

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/patient/medical-history/conditions/[id]
→ SELECT * FROM v_patient__medhist__conditions WHERE condition_id = :id
```

### GET List
```
/api/patient/medical-history/conditions
→ SELECT * FROM v_patient__medhist__conditions [WHERE filters]
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__medhist__conditions_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Comprehensive medical conditions table with diagnostic coding, doctor tracking, and complete condition lifecycle management.