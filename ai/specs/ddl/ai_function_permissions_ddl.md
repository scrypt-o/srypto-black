# Table: ai_function_permissions - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for AI function permissions table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
ai_function_permissions
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
| `function_name` | `text` | **NO** | `null` | AI function identifier |
| `is_allowed` | `boolean` | YES | `true` | Permission granted flag |
| `max_calls_per_hour` | `integer` | YES | `100` | Rate limit per hour |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `max_calls_per_hour` CHECK: >= 0
- Unique constraint on (user_id, function_name)

---

## 🎯 FILTER CONDITIONS

### For User Permissions
```sql
WHERE user_id = auth.uid() AND is_allowed = true
```

### For Function Check
```sql
WHERE user_id = auth.uid() AND function_name = :function_name AND is_allowed = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `id` (auto-generated)
- `user_id` (from auth.uid())
- `function_name`

### Defaults
- `is_allowed`: true
- `max_calls_per_hour`: 100

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `ai_function_permissions`
2. **User-scoped permissions** for AI function access
3. **Rate limiting** built into the schema
4. **Default allow** approach with explicit restrictions

---

**CONCLUSION**: AI function permissions table for controlling user access to AI capabilities with rate limiting.