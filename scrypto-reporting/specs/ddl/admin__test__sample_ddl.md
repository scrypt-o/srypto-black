# Table: admin__test__sample - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for admin test sample table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
admin__test__sample
```

### Primary Key
```sql
sample_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `sample_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `title` | `text` | **NO** | `null` | Test sample title |
| `description` | `text` | YES | `null` | Test sample description |
| `type` | `text` | **NO** | `null` | Sample type classification |
| `priority` | `text` | **NO** | `null` | Priority level |
| `status` | `text` | **NO** | `'open'::text` | Current status |
| `created_at` | `timestamp without time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp without time zone` | YES | `now()` | Last update timestamp |

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `admin__test__sample_pkey` (PRIMARY KEY on sample_id)
- `admin__test__sample_user_id_fkey` (FOREIGN KEY to auth.users)

---

## 🎯 FILTER CONDITIONS

### For Single Record (Detail View)
```sql
WHERE sample_id = :id AND user_id = auth.uid()
```

### For List View
```sql
WHERE user_id = auth.uid()
```

### For Search/Filter
```sql
WHERE user_id = auth.uid() 
  AND (title ILIKE '%:search%' OR description ILIKE '%:search%')
  AND (:type IS NULL OR type = :type)
  AND (:status IS NULL OR status = :status)
  AND (:priority IS NULL OR priority = :priority)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `sample_id` (auto-generated)
- `user_id` (from auth.uid())
- `title`
- `type`
- `priority`
- `status`

### Optional Fields
- `description`

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `admin__test__sample`
2. **Column names match API/Frontend expectations**
3. **RLS must be enabled** - all queries should be user-scoped
4. **Status defaults to 'open'**
5. **Timestamps are without timezone** (consider updating to timestamptz)

---

## 🔧 API INTEGRATION POINTS

### GET Single Record
```
/api/admin/test/sample/[id]
→ SELECT * FROM admin__test__sample WHERE sample_id = :id AND user_id = auth.uid()
```

### GET List
```
/api/admin/test/sample
→ SELECT * FROM admin__test__sample WHERE user_id = auth.uid() [ORDER BY created_at DESC]
```

### CREATE/UPDATE/DELETE
- All operations user-scoped via auth.uid()
- Timestamps auto-managed via triggers or application logic

---

**CONCLUSION**: Admin test sample table for administrative testing purposes with user-scoped access control.