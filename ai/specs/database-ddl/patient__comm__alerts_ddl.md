# Table: patient__comm__alerts - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient communication alerts table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__comm__alerts
```

### Primary Key
```sql
alert_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `alert_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `alert_type` | `text` | YES | `null` | Type of alert: medical, appointment, medication, emergency |
| `severity` | `text` | YES | `null` | Alert severity: low, medium, high, critical |
| `message` | `text` | YES | `null` | Alert message content |
| `trigger_condition` | `text` | YES | `null` | Condition that triggered the alert |
| `date_created` | `timestamp with time zone` | YES | `now()` | Alert creation timestamp |
| `is_read` | `boolean` | YES | `false` | Whether alert has been read |
| `is_acknowledged` | `boolean` | YES | `false` | Whether alert has been acknowledged |
| `expiry_date` | `timestamp with time zone` | YES | `null` | When alert expires |
| `action_required` | `text` | YES | `null` | Required action description |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__comm__alerts
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `patient_comm_alerts_pkey` (PRIMARY KEY on alert_id)
- `patient_comm_alerts_user_id_fkey` (FOREIGN KEY to auth.users)

### Expected Constraints (from business logic)
- `alert_type` CHECK: IN ('medical', 'appointment', 'medication', 'emergency', 'system')
- `severity` CHECK: IN ('low', 'medium', 'high', 'critical')

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE alert_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Unread Alerts
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND is_read = false
```

### For Critical Alerts
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND severity = 'critical'
  AND (expiry_date IS NULL OR expiry_date > NOW())
```

---

## ✅ VALIDATION RULES

### Required Fields
- `alert_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `alert_type` (should be required in business logic)
- `severity` (should be required in business logic)
- `message` (should be required in business logic)

### Text Limits (from business rules)
- `alert_type`: 1-50 characters
- `severity`: 1-20 characters
- `message`: 1-500 characters
- `trigger_condition`: max 1000 characters
- `action_required`: max 1000 characters

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__comm__alerts`
2. **The view name is**: `v_patient__comm__alerts`
3. **Column names match expected API/Frontend patterns**
4. **RLS is enabled** - all queries MUST go through the view for user filtering
5. **Dual timestamp tracking**: `date_created` for alert timing, `created_at` for record timing
6. **Expiry mechanism**: Alerts can have expiration dates for automatic cleanup

---

## 🔧 API INTEGRATION POINTS

### GET Single Alert
```
/api/patient/communication/alerts/[id]
→ SELECT * FROM v_patient__comm__alerts WHERE alert_id = :id
```

### GET Alert List
```
/api/patient/communication/alerts
→ SELECT * FROM v_patient__comm__alerts [WHERE filters]
```

### GET Unread Count
```
/api/patient/communication/alerts/unread-count
→ SELECT COUNT(*) FROM v_patient__comm__alerts WHERE is_read = false
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__comm__alerts_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Patient communication alerts table is properly structured for healthcare alert management with severity levels, expiry handling, and read/acknowledgment tracking.