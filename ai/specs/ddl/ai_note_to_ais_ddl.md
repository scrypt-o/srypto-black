# Table: ai_note_to_ais - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for AI inter-communication notes table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
ai_note_to_ais
```

### Primary Key
```sql
id (INTEGER, NOT NULL, AUTO-INCREMENT)
```

### Foreign Keys
```sql
None (system-wide AI messages)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `id` | `integer` | **NO** | `nextval('ai_note_to_ais_id_seq')` | **PRIMARY KEY** |
| `from_ai` | `text` | **NO** | `null` | Source AI system identifier |
| `message_title` | `text` | **NO** | `null` | Message subject/title |
| `message_content` | `text` | **NO** | `null` | Full message content |
| `lesson_learned` | `text` | **NO** | `null` | Key lesson or insight |
| `what_matters_most` | `text` | **NO** | `null` | Critical priorities identified |
| `created_at` | `timestamp without time zone` | YES | `now()` | Record creation timestamp |

---

## 🔐 CONSTRAINTS & INDEXES

### Constraints Identified
- `ai_note_to_ais_pkey` (PRIMARY KEY on id)
- Auto-increment sequence: `ai_note_to_ais_id_seq`

---

## 🎯 FILTER CONDITIONS

### For Recent Messages
```sql
ORDER BY created_at DESC
```

### For AI Source Filter
```sql
WHERE from_ai = :ai_type
```

### For Content Search
```sql
WHERE message_title ILIKE '%:search%' 
   OR message_content ILIKE '%:search%'
   OR lesson_learned ILIKE '%:search%'
```

---

## ✅ VALIDATION RULES

### Required Fields
- `from_ai`
- `message_title`
- `message_content`
- `lesson_learned`
- `what_matters_most`

### Text Fields
- All text fields are required (NOT NULL)
- No length restrictions defined

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `ai_note_to_ais`
2. **System-wide messages** - not user-scoped
3. **Integer primary key** with auto-increment
4. **No foreign keys** - global AI communication
5. **Timestamp without timezone** (consider updating)
6. **All content fields required**

---

## 🔧 API INTEGRATION POINTS

### GET All Messages
```
/api/ai/notes
→ SELECT * FROM ai_note_to_ais ORDER BY created_at DESC
```

### CREATE AI Note
```
/api/ai/notes
→ INSERT INTO ai_note_to_ais (from_ai, message_title, message_content, lesson_learned, what_matters_most)
```

---

**CONCLUSION**: AI inter-communication notes table for system-wide AI message sharing and knowledge transfer.