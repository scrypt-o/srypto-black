# Table: audit_log - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for system audit logging table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
audit_log
```

### Primary Key
```sql
audit_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NULLABLE)
changed_by → auth.users(id) (UUID, NULLABLE)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `audit_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | YES | `null` | User being audited |
| `action` | `text` | YES | `null` | Action performed (CREATE/UPDATE/DELETE) |
| `table_name` | `text` | YES | `null` | Table affected |
| `record_id` | `uuid` | YES | `null` | Record ID affected |
| `old_value` | `jsonb` | YES | `null` | Previous values (JSON) |
| `new_value` | `jsonb` | YES | `null` | New values (JSON) |
| `changed_by` | `uuid` | YES | `null` | User who made the change |
| `changed_at` | `timestamp with time zone` | YES | `now()` | When change occurred |
| `ip_address` | `text` | YES | `null` | IP address of change |
| `notes` | `text` | YES | `null` | Additional audit notes |

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `action` CHECK: IN ('CREATE', 'UPDATE', 'DELETE', 'SELECT')
- Index on (table_name, record_id)
- Index on changed_at for date range queries

---

## 🎯 FILTER CONDITIONS

### For User Activity
```sql
WHERE user_id = :user_id OR changed_by = :user_id
ORDER BY changed_at DESC
```

### For Table Audit Trail
```sql
WHERE table_name = :table_name AND record_id = :record_id
ORDER BY changed_at ASC
```

### For Date Range
```sql
WHERE changed_at >= :start_date AND changed_at <= :end_date
```

---

## 🚨 CRITICAL NOTES

1. **System-wide audit trail** - not user-scoped
2. **JSONB storage** for flexible data capture
3. **IP address tracking** for security
4. **Nullable foreign keys** for system actions
5. **Proper timestamps with timezone**

---

**CONCLUSION**: Comprehensive audit logging table for tracking all system changes with JSONB data storage.