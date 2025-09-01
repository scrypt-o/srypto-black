# Table: patient__comm__notifications - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient communication notifications table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__comm__notifications
```

### Primary Key
```sql
notification_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
related_record_id → various tables (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `notification_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `notification_type` | `text` | YES | `null` | Type: appointment, medication, test_result, system |
| `title` | `text` | YES | `null` | Notification title/header |
| `content` | `text` | YES | `null` | Notification body content |
| `date_sent` | `timestamp with time zone` | YES | `now()` | Notification sent timestamp |
| `is_read` | `boolean` | YES | `false` | Whether notification has been read |
| `notification_source` | `text` | YES | `null` | Source system: app, email, sms, push |
| `related_record_id` | `uuid` | YES | `null` | ID of related record (appointment, prescription, etc.) |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__comm__notifications
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `patient_comm_notifications_pkey` (PRIMARY KEY on notification_id)
- `patient_comm_notifications_user_id_fkey` (FOREIGN KEY to auth.users)

### Expected Constraints (from business logic)
- `notification_type` CHECK: IN ('appointment', 'medication', 'test_result', 'system', 'reminder', 'alert')
- `notification_source` CHECK: IN ('app', 'email', 'sms', 'push', 'system')

---

## 🎯 FILTER CONDITIONS

### For Single Notification (Detail View)
```sql
WHERE notification_id = :id AND user_id = auth.uid() AND is_active = true
```

### For List View
```sql
WHERE user_id = auth.uid() AND is_active = true
ORDER BY date_sent DESC
```

### For Unread Notifications
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND is_read = false
```

### For Type Filter
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND notification_type = :type
```

### For Related Record
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND related_record_id = :record_id
```

### For Recent Notifications
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND date_sent >= NOW() - INTERVAL '7 days'
ORDER BY date_sent DESC
```

---

## ✅ VALIDATION RULES

### Required Fields
- `notification_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `notification_type` (should be required in business logic)
- `title` (should be required in business logic)
- `content` (should be required in business logic)

### Text Limits (from business rules)
- `notification_type`: 1-50 characters
- `title`: 1-200 characters
- `content`: 1-1000 characters
- `notification_source`: 1-20 characters

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__comm__notifications`
2. **The view name is**: `v_patient__comm__notifications`
3. **Column names match expected API/Frontend patterns**
4. **RLS is enabled** - all queries MUST go through the view for user filtering
5. **Multi-channel support**: Notifications can be sent via app, email, SMS, or push
6. **Record linking**: `related_record_id` allows linking to appointments, prescriptions, etc.
7. **Dual timestamp tracking**: `date_sent` for notification timing, `created_at` for record timing

---

## 🔧 API INTEGRATION POINTS

### GET Single Notification
```
/api/patient/communication/notifications/[id]
→ SELECT * FROM v_patient__comm__notifications WHERE notification_id = :id
```

### GET Notification List
```
/api/patient/communication/notifications
→ SELECT * FROM v_patient__comm__notifications ORDER BY date_sent DESC
```

### GET Unread Count
```
/api/patient/communication/notifications/unread-count
→ SELECT COUNT(*) FROM v_patient__comm__notifications WHERE is_read = false
```

### GET By Type
```
/api/patient/communication/notifications?type=appointment
→ SELECT * FROM v_patient__comm__notifications WHERE notification_type = 'appointment'
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__comm__notifications_*`
- All operations user-scoped via auth.uid()

---

## 🔄 INTEGRATION PATTERNS

### Appointment Reminders
```sql
-- Link to appointment record
INSERT INTO patient__comm__notifications (
  user_id, notification_type, title, content, related_record_id
) VALUES (
  auth.uid(), 'appointment', 'Upcoming Appointment', 
  'You have an appointment tomorrow at 2:00 PM', :appointment_id
);
```

### Medication Reminders
```sql
-- Link to medication record
INSERT INTO patient__comm__notifications (
  user_id, notification_type, title, content, related_record_id
) VALUES (
  auth.uid(), 'medication', 'Medication Reminder', 
  'Time to take your prescribed medication', :medication_id
);
```

---

**CONCLUSION**: Patient communication notifications table provides comprehensive notification management with multi-channel delivery, record linking, and flexible content structure for all healthcare communication needs.