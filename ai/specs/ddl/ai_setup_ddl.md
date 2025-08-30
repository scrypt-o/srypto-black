# Table: ai_setup - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for AI configuration setup table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
ai_setup
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
| `ai_type` | `text` | **NO** | `null` | AI system type identifier |
| `ai_model_provider` | `text` | **NO** | `null` | AI provider (OpenAI, Anthropic, etc) |
| `ai_model` | `text` | **NO** | `null` | Specific model name/version |
| `ai_api_key` | `text` | YES | `null` | **SENSITIVE** API key for provider |
| `ai_temperature` | `numeric` | YES | `0.2` | Model temperature setting |
| `ai_max_tokens` | `integer` | YES | `1000` | Maximum tokens per request |
| `ai_system_instructions` | `text` | YES | `null` | Custom system instructions |
| `configuration` | `jsonb` | YES | `'{}'::jsonb` | Additional configuration |
| `is_active` | `boolean` | YES | `true` | Active configuration flag |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `ai_temperature` CHECK: >= 0 AND <= 2.0
- `ai_max_tokens` CHECK: > 0
- Unique constraint on (user_id, ai_type) for active configs

---

## 🎯 FILTER CONDITIONS

### For User's Active Setup
```sql
WHERE user_id = auth.uid() AND is_active = true
```

### For Specific AI Type
```sql
WHERE user_id = auth.uid() AND ai_type = :ai_type AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `id` (auto-generated)
- `user_id` (from auth.uid())
- `ai_type`
- `ai_model_provider`
- `ai_model`

### Sensitive Data
- `ai_api_key`: Encrypt at rest, never log

### Defaults
- `ai_temperature`: 0.2
- `ai_max_tokens`: 1000
- `configuration`: {}
- `is_active`: true

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `ai_setup`
2. **CONTAINS SENSITIVE DATA** - API keys must be encrypted
3. **User-scoped configurations** for personalized AI setups
4. **JSONB configuration** for flexible additional settings
5. **Proper timestamps with timezone**
6. **Active flag** for managing multiple configurations

---

## 🔧 API INTEGRATION POINTS

### GET User's AI Setup
```
/api/ai/setup
→ SELECT * FROM ai_setup WHERE user_id = auth.uid() AND is_active = true
```

### UPDATE Configuration
```
/api/ai/setup/[id]
→ UPDATE ai_setup SET ... WHERE id = :id AND user_id = auth.uid()
```

---

**CONCLUSION**: AI setup configuration table with sensitive API key storage and user-scoped AI model configurations.