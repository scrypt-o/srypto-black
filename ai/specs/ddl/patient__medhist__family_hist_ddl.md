# Table: patient__medhist__family_hist - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient family medical history table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medhist__family_hist
```

### Primary Key
```sql
family_history_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `family_history_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `relative` | `text` | YES | `null` | Relative's name or identifier |
| `condition` | `text` | YES | `null` | Medical condition/disease |
| `relationship` | `text` | YES | `null` | Family relationship type |
| `age_at_onset` | `integer` | YES | `null` | Age when condition started |
| `notes` | `text` | YES | `null` | Additional notes |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medhist__family_hist
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `relationship` CHECK: IN ('parent', 'sibling', 'grandparent', 'child', 'aunt', 'uncle', 'cousin')
- `age_at_onset` CHECK: >= 0 AND <= 150
- Index on (user_id, relationship)

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE family_history_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true ORDER BY relationship, relative
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (relative ILIKE '%:search%' OR condition ILIKE '%:search%')
  AND (:relationship IS NULL OR relationship = :relationship)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `family_history_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `condition` (should be required in business logic)
- `relationship` (should be required in business logic)

### Age Validation
- `age_at_onset`: Must be between 0 and 150 if provided

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medhist__family_hist`
2. **The view name is**: `v_patient__medhist__family_hist`
3. **Family medical history tracking** for genetic risk assessment
4. **Proper timestamps with timezone**
5. **Privacy-sensitive data** - family member information

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/patient/medical-history/family-history/[id]
→ SELECT * FROM v_patient__medhist__family_hist WHERE family_history_id = :id
```

### GET List
```
/api/patient/medical-history/family-history
→ SELECT * FROM v_patient__medhist__family_hist [WHERE filters]
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__medhist__family_hist_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Family medical history table for tracking hereditary conditions and genetic risk factors with privacy protection.