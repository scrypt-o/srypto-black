# Table: patient__medhist__immunizations - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient immunizations table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medhist__immunizations
```

### Primary Key
```sql
immunization_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `immunization_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `vaccine_name` | `text` | YES | `null` | Name of the vaccine |
| `vaccine_code` | `text` | YES | `null` | Vaccine identification code |
| `date_given` | `date` | YES | `null` | Date vaccine was administered |
| `provider_name` | `text` | YES | `null` | Healthcare provider name |
| `batch_number` | `text` | YES | `null` | Vaccine batch/lot number |
| `site` | `text` | YES | `null` | Injection site location |
| `route` | `text` | YES | `null` | Route of administration |
| `notes` | `text` | YES | `null` | Additional notes |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medhist__immunizations
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `site` CHECK: IN ('left_arm', 'right_arm', 'left_thigh', 'right_thigh', 'oral', 'nasal')
- `route` CHECK: IN ('intramuscular', 'subcutaneous', 'oral', 'intranasal', 'intradermal')
- Index on (user_id, date_given)

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE immunization_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true ORDER BY date_given DESC
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (vaccine_name ILIKE '%:search%' OR provider_name ILIKE '%:search%')
  AND (:vaccine_code IS NULL OR vaccine_code = :vaccine_code)
  AND date_given >= :start_date
  AND date_given <= :end_date
```

---

## ✅ VALIDATION RULES

### Required Fields
- `immunization_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `vaccine_name` (should be required in business logic)
- `date_given` (should be required in business logic)

### Date Validation
- `date_given`: Cannot be in the future

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medhist__immunizations`
2. **The view name is**: `v_patient__medhist__immunizations`
3. **Immunization tracking** with batch numbers for safety
4. **Provider information** for follow-up
5. **Proper timestamps with timezone**
6. **Critical for public health** and travel requirements

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/patient/medical-history/immunizations/[id]
→ SELECT * FROM v_patient__medhist__immunizations WHERE immunization_id = :id
```

### GET List
```
/api/patient/medical-history/immunizations
→ SELECT * FROM v_patient__medhist__immunizations [WHERE filters]
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__medhist__immunizations_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Comprehensive immunization tracking table with safety batch numbers, provider details, and administration route tracking.