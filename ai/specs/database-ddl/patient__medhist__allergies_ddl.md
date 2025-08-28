# Table: patient__medhist__allergies - DDL Documentation

**Date Generated**: 23/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient allergies table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medhist__allergies
```

### Primary Key
```sql
allergy_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `allergy_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `allergen` | `text` | YES | `null` | Allergen name/substance |
| `allergen_type` | `text` | YES | `null` | Type: food, medication, environmental, other |
| `severity` | `text` | YES | `null` | Severity: mild, moderate, severe, life_threatening |
| `reaction` | `text` | YES | `null` | Reaction symptoms description |
| `first_observed` | `date` | YES | `null` | Date first reaction observed |
| `notes` | `text` | YES | `null` | Additional notes |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `trigger_factors` | `text` | YES | `null` | What triggers the allergy |
| `emergency_action_plan` | `text` | YES | `null` | Emergency response plan |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medhist__allergies
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `patient_allergies_pkey` (PRIMARY KEY on allergy_id)
- `patient_allergies_user_id_fkey` (FOREIGN KEY to auth.users)

### Expected Constraints (from migration)
- `allergen_type` CHECK: IN ('food', 'medication', 'environmental', 'other')
- `severity` CHECK: IN ('mild', 'moderate', 'severe', 'life_threatening')

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE allergy_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (allergen ILIKE '%:search%' OR reaction ILIKE '%:search%')
  AND (:allergen_type IS NULL OR allergen_type = :allergen_type)
  AND (:severity IS NULL OR severity = :severity)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `allergy_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `allergen` (should be required in business logic)
- `allergen_type` (should be required in business logic)
- `severity` (should be required in business logic)

### Text Limits (from business rules)
- `allergen`: 1-200 characters
- `reaction`: max 1000 characters
- `notes`: unlimited
- `trigger_factors`: unlimited
- `emergency_action_plan`: unlimited

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medhist__allergies` (NOT `patient__medical_history__allergies`)
2. **The view name is**: `v_patient__medhist__allergies` (NOT `v_patient__medical_history__allergies`)
3. **Column names match our API/Frontend exactly** - NO MISMATCH
4. **Current data**: EMPTY (no records found in view)
5. **RLS is enabled** - all queries MUST go through the view for user filtering

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/patient/medical-history/allergies/[id]
→ SELECT * FROM v_patient__medhist__allergies WHERE allergy_id = :id
```

### GET List
```
/api/patient/medical-history/allergies
→ SELECT * FROM v_patient__medhist__allergies [WHERE filters]
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__medhist__allergies_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: The database schema is CORRECT and matches our API/Frontend expectations. The issue is NOT column names - it's elsewhere in the data flow.