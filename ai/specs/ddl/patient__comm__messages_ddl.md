# Table: patient__comm__messages - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient communication messages table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__comm__messages
```

### Primary Key
```sql
message_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
from_user_id → auth.users(id) (UUID, NULLABLE)
reply_to_id → patient__comm__messages(message_id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `message_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) (recipient) |
| `from_user_id` | `uuid` | YES | `null` | **FOREIGN KEY** → auth.users(id) (sender) |
| `from_user_name` | `text` | YES | `null` | Display name of sender |
| `subject` | `text` | YES | `null` | Message subject line |
| `content` | `text` | YES | `null` | Message body content |
| `message_type` | `text` | YES | `null` | Type: direct, broadcast, appointment, medical, system |
| `sent_at` | `timestamp with time zone` | YES | `now()` | Message sent timestamp |
| `is_read` | `boolean` | YES | `false` | Whether message has been read |
| `has_attachments` | `boolean` | YES | `false` | Whether message has file attachments |
| `reply_to_id` | `uuid` | YES | `null` | **FOREIGN KEY** → patient__comm__messages(message_id) |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__comm__messages
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid() AND is_active = true)
- RLS security boundary
- API read operations use this view ONLY

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `patient_comm_messages_pkey` (PRIMARY KEY on message_id)
- `patient_comm_messages_user_id_fkey` (FOREIGN KEY to auth.users)
- `patient_comm_messages_from_user_id_fkey` (FOREIGN KEY to auth.users)
- `patient_comm_messages_reply_to_id_fkey` (FOREIGN KEY to self)

### Expected Constraints (from business logic)
- `message_type` CHECK: IN ('direct', 'broadcast', 'appointment', 'medical', 'system')

---

## 🎯 FILTER CONDITIONS

### For Single Message (Detail View)
```sql
WHERE message_id = :id AND user_id = auth.uid() AND is_active = true
```

### For Inbox List
```sql
WHERE user_id = auth.uid() AND is_active = true
ORDER BY sent_at DESC
```

### For Unread Messages
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND is_read = false
```

### For Thread View (Replies)
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (message_id = :thread_id OR reply_to_id = :thread_id)
ORDER BY sent_at ASC
```

### For Search
```sql
WHERE user_id = auth.uid() 
  AND is_active = true 
  AND (subject ILIKE '%:search%' OR content ILIKE '%:search%' OR from_user_name ILIKE '%:search%')
```

---

## ✅ VALIDATION RULES

### Required Fields
- `message_id` (auto-generated)
- `user_id` (from auth.uid())

### Optional but Important
- `subject` (should be required for most message types)
- `content` (should be required for all message types)
- `message_type` (should be required in business logic)

### Text Limits (from business rules)
- `subject`: 1-200 characters
- `content`: 1-10000 characters
- `from_user_name`: 1-100 characters
- `message_type`: 1-50 characters

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__comm__messages`
2. **The view name is**: `v_patient__comm__messages`
3. **Column names match expected API/Frontend patterns**
4. **RLS is enabled** - all queries MUST go through the view for user filtering
5. **Thread support**: Messages can reply to other messages via `reply_to_id`
6. **Dual timestamp tracking**: `sent_at` for message timing, `created_at` for record timing
7. **Sender flexibility**: `from_user_id` can be null for system messages, `from_user_name` provides display fallback

---

## 🔧 API INTEGRATION POINTS

### GET Single Message
```
/api/patient/communication/messages/[id]
→ SELECT * FROM v_patient__comm__messages WHERE message_id = :id
```

### GET Message List (Inbox)
```
/api/patient/communication/messages
→ SELECT * FROM v_patient__comm__messages ORDER BY sent_at DESC
```

### GET Thread
```
/api/patient/communication/messages/thread/[id]
→ SELECT * FROM v_patient__comm__messages WHERE message_id = :id OR reply_to_id = :id
```

### GET Unread Count
```
/api/patient/communication/messages/unread-count
→ SELECT COUNT(*) FROM v_patient__comm__messages WHERE is_read = false
```

### CREATE/UPDATE/DELETE
- Use stored procedures: `sp_patient__comm__messages_*`
- All operations user-scoped via auth.uid()

---

**CONCLUSION**: Patient communication messages table supports full messaging functionality including threading, attachments, and various message types for comprehensive healthcare communication.