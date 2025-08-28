# Table: patient__medications__adherence - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for medication adherence tracking table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__medications__adherence
```

### Primary Key
```sql
adherence_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
medication_id → patient__medications__medications(medication_id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `adherence_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `medication_id` | `uuid` | YES | `null` | **FOREIGN KEY** → patient__medications__medications |
| `taken_datetime` | `timestamp with time zone` | YES | `null` | When medication was taken |
| `dose_taken` | `boolean` | YES | `false` | Whether dose was actually taken |
| `notes` | `text` | YES | `null` | Patient notes about dose |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__medications__adherence
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **Tracks medication compliance patterns**

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `taken_datetime` should be <= CURRENT_TIMESTAMP (no future doses)
- Index on (user_id, medication_id, taken_datetime) for adherence reporting
- Index on (user_id, taken_datetime DESC) for recent activity

---

## 🎯 FILTER CONDITIONS

### For User's Adherence Records
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Medication Adherence Report
```sql
WHERE user_id = auth.uid() 
  AND medication_id = ?
  AND taken_datetime >= DATE_TRUNC('month', CURRENT_DATE)
  AND is_active = true
```

### For Daily Adherence Check
```sql
WHERE user_id = auth.uid() 
  AND DATE(taken_datetime) = CURRENT_DATE
  AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `adherence_id` (auto-generated)
- `user_id` (from auth.uid())

### Business Rules
- `medication_id` can be null for generic adherence tracking
- `taken_datetime` should not be in the future
- `dose_taken` false indicates missed/skipped dose

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__medications__adherence`
2. **The view name is**: `v_patient__medications__adherence`
3. **MEDICATION COMPLIANCE TRACKING** - Critical for patient outcomes
4. **Supports both specific and general adherence logging**
5. **Time-series data** for trend analysis
6. **Patient self-reporting** mechanism

---

## 🔧 API INTEGRATION POINTS

### POST Log Medication Taken
```
/api/patient/medications/adherence
→ INSERT INTO patient__medications__adherence (user_id, medication_id, dose_taken, taken_datetime)
```

### GET Adherence History
```
/api/patient/medications/adherence?medication_id={id}&days=30
→ WHERE medication_id = ? AND taken_datetime >= CURRENT_DATE - INTERVAL '30 days'
```

### GET Daily Adherence Summary
```
/api/patient/medications/adherence/daily
→ Daily aggregation of adherence patterns
```

---

## 📊 BUSINESS LOGIC

### Adherence Tracking
- **dose_taken = true**: Patient took medication as scheduled
- **dose_taken = false**: Patient missed/skipped dose
- **notes**: Context for missed doses or side effects

### Compliance Reporting
- Daily, weekly, monthly adherence percentages
- Missed dose patterns identification
- Provider alerts for poor adherence

### Integration Points
- Medication reminders system
- Provider dashboard alerts
- Health outcome correlation analysis

---

**CONCLUSION**: Essential medication adherence tracking table enabling patient self-monitoring, provider oversight, and health outcome improvement through compliance analytics.