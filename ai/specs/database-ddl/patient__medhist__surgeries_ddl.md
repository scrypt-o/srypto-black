# Table: patient__medhist__surgeries - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient surgeries table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medhist__surgeries
```

### Primary Key
```sql
surgery_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
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
| `surgery_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `surgery_name` | `text` | YES | `null` | Name of the surgical procedure |
| `surgery_type` | `text` | YES | `null` | Type/category of surgery |
| `surgery_date` | `date` | YES | `null` | Date surgery was performed |
| `hospital_name` | `text` | YES | `null` | Hospital where surgery occurred |
| `surgeon_name` | `text` | YES | `null` | Primary surgeon's name |
| `surgeon_practice_number` | `text` | YES | `null` | Surgeon's practice number |
| `anesthetist_name` | `text` | YES | `null` | Anesthetist's name |
| `procedure_code` | `text` | YES | `null` | Medical procedure code |
| `complications` | `text` | YES | `null` | Complications during/after surgery |
| `recovery_notes` | `text` | YES | `null` | Recovery progress notes |
| `outcome` | `text` | YES | `null` | Surgery outcome status |
| `related_condition_id` | `uuid` | YES | `null` | **FOREIGN KEY** → patient__medhist__conditions |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medhist__surgeries
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `surgery_type` CHECK: IN ('elective', 'emergency', 'diagnostic', 'cosmetic', 'reconstructive')
- `outcome` CHECK: IN ('successful', 'complications', 'partial_success', 'failed')
- Index on (user_id, surgery_date)

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE surgery_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true ORDER BY surgery_date DESC
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (surgery_name ILIKE '%:search%' OR surgeon_name ILIKE '%:search%')
  AND (:surgery_type IS NULL OR surgery_type = :surgery_type)
  AND (:outcome IS NULL OR outcome = :outcome)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `surgery_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `surgery_name` (should be required in business logic)
- `surgery_date` (should be required in business logic)
- `surgeon_name` (should be required in business logic)

### Date Validation
- `surgery_date`: Cannot be in the future (usually)

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medhist__surgeries`
2. **The view name is**: `v_patient__medhist__surgeries`
3. **Comprehensive surgery tracking** with full medical team details
4. **Links to related medical conditions**
5. **Proper timestamps with timezone**
6. **Includes complications and outcomes** for complete medical record

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/patient/medical-history/surgeries/[id]
→ SELECT * FROM v_patient__medhist__surgeries WHERE surgery_id = :id
```

### GET List
```
/api/patient/medical-history/surgeries
→ SELECT * FROM v_patient__medhist__surgeries [WHERE filters]
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__medhist__surgeries_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Comprehensive surgical history table with complete medical team tracking, complications, outcomes, and links to related conditions.