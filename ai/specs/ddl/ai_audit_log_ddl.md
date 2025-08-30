# Table: ai_audit_log - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for AI audit logging table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
ai_audit_log
```

### Primary Key
```sql
id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `ai_type` | `text` | **NO** | `null` | Type of AI system/model used |
| `action_type` | `text` | **NO** | `null` | Action performed by AI |
| `action_params` | `jsonb` | YES | `'{}'::jsonb` | Parameters passed to AI action |
| `ai_reasoning` | `text` | YES | `null` | AI's reasoning/explanation |
| `result_status` | `text` | **NO** | `null` | Success/failure status |
| `result_data` | `jsonb` | YES | `'{}'::jsonb` | AI action result data |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `ai_audit_log_pkey` (PRIMARY KEY on id)
- `ai_audit_log_user_id_fkey` (FOREIGN KEY to auth.users)

### Expected Constraints (business logic)
- `ai_type` CHECK: likely values ('claude', 'openai', 'custom')
- `action_type` CHECK: likely values ('analyze', 'generate', 'classify', 'predict')
- `result_status` CHECK: likely values ('success', 'failure', 'partial')

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE id = :id AND user_id = auth.uid()
```

### For List View (Recent Activity)
```sql
WHERE user_id = auth.uid() 
ORDER BY created_at DESC
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND (:ai_type IS NULL OR ai_type = :ai_type)
  AND (:action_type IS NULL OR action_type = :action_type)
  AND (:result_status IS NULL OR result_status = :result_status)
  AND created_at >= :start_date
  AND created_at <= :end_date
```

---

## ✅ VALIDATION RULES

### Required Fields
- `id` (auto-generated)
- `user_id` (from auth.uid())
- `ai_type`
- `action_type`
- `result_status`

### JSON Fields
- `action_params`: Default empty object {}
- `result_data`: Default empty object {}

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `ai_audit_log`
2. **JSONB columns** for flexible parameter and result storage
3. **Timestamps with timezone** (proper practice)
4. **User-scoped auditing** - all AI actions tied to users
5. **No soft delete** - permanent audit trail

---

## 🔧 API INTEGRATION POINTS

### GET Audit History
```
/api/ai/audit
→ SELECT * FROM ai_audit_log WHERE user_id = auth.uid() ORDER BY created_at DESC
```

### GET Single Audit Record
```
/api/ai/audit/[id]
→ SELECT * FROM ai_audit_log WHERE id = :id AND user_id = auth.uid()
```

### CREATE Audit Entry
- Insert new record for each AI action
- Auto-populate user_id via auth.uid()
- Store structured data in JSONB fields

---

**CONCLUSION**: AI audit log table for tracking all AI system interactions with comprehensive JSON data storage and user-scoped access control.