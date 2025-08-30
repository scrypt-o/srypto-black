# Table: patient__persinfo__medical_aid - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient medical aid information table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__medical_aid
```

### Primary Key
```sql
medical_aid_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `medical_aid_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `medical_aid_name` | `text` | **NO** | `null` | **REQUIRED** Medical aid scheme name |
| `plan_type` | `text` | YES | `null` | Medical aid plan/option type |
| `member_number` | `text` | **NO** | `null` | **REQUIRED** **SENSITIVE** Member number |
| `policy_holder_id` | `text` | YES | `null` | **SENSITIVE** Policy holder ID number |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `dependent_code` | `text` | YES | `null` | **SENSITIVE** Dependent code on policy |
| `is_primary_member` | `boolean` | YES | `true` | Flag if user is primary member |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `policy_holder_first_name` | `text` | YES | `null` | **SENSITIVE** Policy holder first name |
| `policy_holder_last_name` | `text` | YES | `null` | **SENSITIVE** Policy holder last name |
| `policy_holder_email` | `text` | YES | `null` | **SENSITIVE** Policy holder email |
| `policy_holder_phone` | `text` | YES | `null` | **SENSITIVE** Policy holder phone |
| `number_of_dependents` | `integer` | YES | `null` | Number of dependents on policy |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__medical_aid
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS SENSITIVE MEMBER DATA** for non-owner access

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- Unique constraint on (user_id) - one medical aid record per user
- `medical_aid_name` NOT NULL - required field
- `member_number` NOT NULL - required field
- `is_primary_member` boolean constraint
- `number_of_dependents` CHECK: >= 0

---

## 🎯 FILTER CONDITIONS

### For User's Own Medical Aid
```sql
WHERE user_id = auth.uid()
```

### For Active Medical Aid
```sql
WHERE user_id = auth.uid() 
  AND is_active = true
```

### For Primary Member Check
```sql
WHERE user_id = auth.uid() 
  AND is_primary_member = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `medical_aid_id` (auto-generated)
- `user_id` (from auth.uid())
- `medical_aid_name` (cannot be null)
- `member_number` (cannot be null)

### Sensitive Data Fields
- `member_number` - Medical aid member number (encrypt at rest)
- `policy_holder_id` - ID number of policy holder (encrypt at rest)
- `dependent_code` - Dependent identifier (encrypt at rest)
- `policy_holder_first_name` - Policy holder personal data (encrypt at rest)
- `policy_holder_last_name` - Policy holder personal data (encrypt at rest)
- `policy_holder_email` - Policy holder contact (encrypt at rest)
- `policy_holder_phone` - Policy holder contact (encrypt at rest)

### Medical Aid Types (South African)
Common medical aid schemes:
- Discovery Health
- Momentum Health
- Medihelp
- Bestmed
- Fedhealth
- KeyHealth
- Bonitas
- Profmed
- GEMS

### Business Logic
- If `is_primary_member = true`: User is the main policy holder
- If `is_primary_member = false`: User is a dependent
- `dependent_code` used for dependent identification
- `number_of_dependents` tracks family size for primary members

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__medical_aid`
2. **The view name is**: `v_patient__persinfo__medical_aid`
3. **CONTAINS HIGHLY SENSITIVE MEDICAL INSURANCE DATA** - Must be encrypted at rest
4. **One medical aid per user** - unique constraint on user_id
5. **Primary/Dependent member support** for family medical aid
6. **South African medical aid system** compliance
7. **GDPR/POPIA compliance required** for all personal insurance data

---

## 🔧 API INTEGRATION POINTS

### GET User Medical Aid
```
/api/patient/personal-info/medical-aid
→ SELECT * FROM v_patient__persinfo__medical_aid WHERE user_id = auth.uid()
```

### UPDATE Medical Aid
```
/api/patient/personal-info/medical-aid
→ UPDATE patient__persinfo__medical_aid SET ... WHERE user_id = auth.uid()
```

### Medical Aid Validation
```
→ Validate member numbers with medical aid APIs
→ Check policy holder details for dependents
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **INTERNAL**: Medical aid scheme names, plan types
- **CONFIDENTIAL**: Member numbers, dependent codes
- **RESTRICTED**: Policy holder personal information, ID numbers

### Access Controls
- **Owner**: Full read/write access
- **Healthcare Provider**: Limited read for billing/claims
- **System**: No direct access - use service accounts
- **Medical Aid**: API integration for verification only

### Medical Insurance Privacy
- Member numbers used for claims processing
- Policy holder details for dependent verification
- Never share with unauthorized third parties
- Encrypted storage for all sensitive fields

### Compliance Requirements
- Medical Schemes Act compliance (South Africa)
- POPIA compliance for personal information
- GDPR compliance for EU residents
- Audit trail for all access to medical aid data

---

**CONCLUSION**: Critical medical insurance information table for South African healthcare system with primary/dependent member support, sensitive data encryption, and compliance with medical aid regulations.