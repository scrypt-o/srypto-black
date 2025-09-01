# Table: patient__persinfo__profile - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient personal profile table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__profile
```

### Primary Key
```sql
profile_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `profile_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `first_name` | `text` | **NO** | `null` | Patient's first name |
| `last_name` | `text` | **NO** | `null` | Patient's last name |
| `id_number` | `text` | YES | `null` | **SENSITIVE** National ID number |
| `date_of_birth` | `date` | YES | `null` | **SENSITIVE** Date of birth |
| `gender` | `text` | YES | `null` | Gender identity |
| `phone` | `text` | YES | `null` | **SENSITIVE** Primary phone number |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `title` | `text` | YES | `null` | Title (Mr, Ms, Dr, etc.) |
| `middle_name` | `text` | YES | `null` | Middle name(s) |
| `passport_number` | `text` | YES | `null` | **SENSITIVE** Passport number |
| `citizenship` | `text` | YES | `null` | Citizenship/nationality |
| `email` | `text` | YES | `null` | **SENSITIVE** Email address |
| `nick_name` | `text` | YES | `null` | Preferred nickname |
| `marital_status` | `text` | YES | `null` | Marital status |
| `race_ethnicity` | `text` | YES | `null` | **SENSITIVE** Race/ethnicity |
| `languages_spoken` | `jsonb` | YES | `null` | Languages array |
| `primary_language` | `text` | YES | `null` | Primary language |
| `deceased` | `boolean` | YES | `false` | Deceased flag |
| `deceased_date` | `date` | YES | `null` | Date of death |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `profile_picture_url` | `text` | YES | `null` | Profile image URL |
| `email_in_use` | `text` | YES | `null` | Currently used email |
| `latitude` | `numeric` | YES | `null` | Location latitude |
| `longitude` | `numeric` | YES | `null` | Location longitude |
| `max_pharmacy_distance_km` | `integer` | YES | `15` | Pharmacy search radius |
| `location_updated_at` | `timestamp with time zone` | YES | `null` | Location update timestamp |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__profile
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS SENSITIVE DATA** for non-owner access

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `gender` CHECK: IN ('male', 'female', 'non-binary', 'prefer-not-to-say')
- `marital_status` CHECK: IN ('single', 'married', 'divorced', 'widowed', 'separated')
- `max_pharmacy_distance_km` CHECK: >= 1 AND <= 100
- Unique constraint on (user_id) - one profile per user

---

## 🎯 FILTER CONDITIONS

### For User's Own Profile
```sql
WHERE user_id = auth.uid()
```

### For Profile Completion Check
```sql
WHERE user_id = auth.uid() 
  AND first_name IS NOT NULL 
  AND last_name IS NOT NULL 
  AND date_of_birth IS NOT NULL
```

---

## ✅ VALIDATION RULES

### Required Fields
- `profile_id` (auto-generated)
- `user_id` (from auth.uid())
- `first_name`
- `last_name`

### Sensitive Data Fields
- `id_number` - National ID (encrypt at rest)
- `date_of_birth` - DOB (encrypt at rest)
- `phone` - Phone number (encrypt at rest)
- `passport_number` - Passport (encrypt at rest)
- `email` - Email address (encrypt at rest)
- `race_ethnicity` - Ethnicity data (encrypt at rest)

### JSONB Field
- `languages_spoken`: Array of language codes
  ```json
  ["en", "af", "zu", "xh"]
  ```

### Location Fields
- `latitude`: -90 to 90 decimal degrees
- `longitude`: -180 to 180 decimal degrees

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__profile`
2. **The view name is**: `v_patient__persinfo__profile`
3. **CONTAINS HIGHLY SENSITIVE PII** - Must be encrypted at rest
4. **One profile per user** - unique constraint on user_id
5. **Location data** for pharmacy distance calculations
6. **Deceased tracking** for legacy record management
7. **GDPR/POPIA compliance required** for all personal data

---

## 🔧 API INTEGRATION POINTS

### GET User Profile
```
/api/patient/personal-info/profile
→ SELECT * FROM v_patient__persinfo__profile WHERE user_id = auth.uid()
```

### UPDATE Profile
```
/api/patient/personal-info/profile
→ UPDATE patient__persinfo__profile SET ... WHERE user_id = auth.uid()
```

### Profile Completion Status
```
→ Check required fields completion for onboarding flow
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **PUBLIC**: first_name, last_name, title, nick_name
- **INTERNAL**: gender, marital_status, languages_spoken
- **CONFIDENTIAL**: id_number, date_of_birth, phone, email
- **RESTRICTED**: passport_number, race_ethnicity

### Access Controls
- **Owner**: Full read/write access
- **Healthcare Provider**: Limited read (name, DOB, phone)
- **System**: No direct access - use service accounts

---

**CONCLUSION**: Core patient demographics table with comprehensive personal information, location services, and strict privacy/security requirements.