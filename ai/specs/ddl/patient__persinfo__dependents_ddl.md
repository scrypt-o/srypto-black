# Table: patient__persinfo__dependents - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient dependents information table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__dependents
```

### Primary Key
```sql
dependent_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `dependent_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `full_name` | `text` | **NO** | `null` | **REQUIRED** Dependent's full name |
| `relationship` | `text` | YES | `null` | Relationship to primary user |
| `date_of_birth` | `date` | YES | `null` | **SENSITIVE** Date of birth |
| `id_number` | `text` | YES | `null` | **SENSITIVE** National ID number |
| `medical_aid_number` | `text` | YES | `null` | **SENSITIVE** Medical aid member number |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `title` | `text` | YES | `null` | Title (Master, Miss, etc.) |
| `first_name` | `text` | YES | `null` | First name (parsed from full_name) |
| `middle_name` | `text` | YES | `null` | Middle name(s) |
| `last_name` | `text` | YES | `null` | Last name (parsed from full_name) |
| `passport_number` | `text` | YES | `null` | **SENSITIVE** Passport number |
| `citizenship` | `text` | YES | `null` | Citizenship/nationality |
| `use_profile_info` | `boolean` | YES | `false` | Use primary user's profile info flag |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__dependents
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS SENSITIVE DEPENDENT DATA** for non-owner access
- Family healthcare management

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `full_name` NOT NULL - required field
- `relationship` CHECK: IN ('child', 'spouse', 'parent', 'sibling', 'stepchild', 'adopted-child', 'ward', 'partner', 'other')
- `date_of_birth` CHECK: <= CURRENT_DATE (cannot be future date)
- Age validation for relationship type (e.g., child typically under 18/21)
- Index on (user_id, relationship) for family structure queries

---

## 🎯 FILTER CONDITIONS

### For User's Dependents
```sql
WHERE user_id = auth.uid()
  AND is_active = true
```

### For Children Only
```sql
WHERE user_id = auth.uid() 
  AND relationship IN ('child', 'stepchild', 'adopted-child', 'ward')
  AND is_active = true
```

### For Minor Dependents
```sql
WHERE user_id = auth.uid() 
  AND date_of_birth > (CURRENT_DATE - INTERVAL '18 years')
  AND is_active = true
```

### For Medical Aid Dependents
```sql
WHERE user_id = auth.uid() 
  AND medical_aid_number IS NOT NULL
  AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `dependent_id` (auto-generated)
- `user_id` (from auth.uid())
- `full_name` (cannot be null)

### Family Relationship Types
- **child**: Biological child
- **spouse**: Married partner
- **parent**: Elderly parent as dependent
- **sibling**: Brother/sister dependent
- **stepchild**: Step-child
- **adopted-child**: Legally adopted child
- **ward**: Legal ward/guardianship
- **partner**: Domestic partner
- **other**: Other family relationship

### Sensitive Data Fields
- `date_of_birth` - DOB of dependent (encrypt at rest)
- `id_number` - National ID number (encrypt at rest)
- `medical_aid_number` - Medical insurance number (encrypt at rest)
- `passport_number` - Passport identification (encrypt at rest)

### Business Logic
- **Age validation**: Ensure age aligns with relationship
- **Medical aid consistency**: Link to primary user's medical aid
- **Name parsing**: Automatically split full_name into components
- **Profile inheritance**: Use primary user info when `use_profile_info = true`

### Data Inheritance Rules
When `use_profile_info = true`:
- Use primary user's address information
- Use primary user's medical aid details
- Inherit primary user's emergency contacts
- Apply primary user's privacy settings

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__dependents`
2. **The view name is**: `v_patient__persinfo__dependents`
3. **CONTAINS HIGHLY SENSITIVE CHILD/FAMILY PII** - Must be encrypted at rest
4. **Family healthcare management** - Links to medical aid and services
5. **Minor protection** - Special privacy rules for children under 18
6. **Custody considerations** - Legal guardian access requirements
7. **GDPR/POPIA compliance** for family member personal data

---

## 🔧 API INTEGRATION POINTS

### GET User Dependents
```
/api/patient/personal-info/dependents
→ SELECT * FROM v_patient__persinfo__dependents WHERE user_id = auth.uid()
```

### GET Children Only
```
/api/patient/personal-info/dependents/children
→ SELECT * FROM v_patient__persinfo__dependents 
  WHERE user_id = auth.uid() AND relationship LIKE '%child%'
```

### POST New Dependent
```
/api/patient/personal-info/dependents
→ INSERT INTO patient__persinfo__dependents
```

### PUT Update Dependent
```
/api/patient/personal-info/dependents/{dependent_id}
→ UPDATE patient__persinfo__dependents SET ... WHERE dependent_id = ? AND user_id = auth.uid()
```

### DELETE Dependent
```
/api/patient/personal-info/dependents/{dependent_id}
→ UPDATE patient__persinfo__dependents SET is_active = false WHERE dependent_id = ? AND user_id = auth.uid()
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **PUBLIC**: Relationship types, basic demographics
- **INTERNAL**: Names, ages, family structure
- **CONFIDENTIAL**: ID numbers, medical aid numbers, birthdates
- **RESTRICTED**: Complete dependent profiles, especially for minors

### Access Controls
- **Primary User**: Full read/write/delete access to own dependents
- **Healthcare Provider**: Limited read access for medical services
- **Legal Guardian**: Access based on legal custody arrangements
- **System**: No direct access - use service accounts with audit trails

### Minor Protection (Under 18)
- **Enhanced privacy**: Stricter access controls for minors
- **Parental consent**: Required for medical decisions
- **Data retention**: Limited retention after age of majority
- **Access logging**: All minor data access logged and monitored

### Family Privacy Considerations
- **Custody disputes**: Handle complex family access scenarios
- **Estranged family**: Respect no-contact preferences
- **Adoption records**: Sealed/confidential adoption information
- **Guardianship**: Court-ordered access arrangements

---

## 🏥 HEALTHCARE INTEGRATION

### Medical Aid Coordination
- **Family policies**: Link dependents to primary user's medical aid
- **Dependent codes**: Track medical aid dependent numbers
- **Benefit sharing**: Manage shared medical aid benefits
- **Claim coordination**: Process dependent medical claims

### Healthcare Services
- **Pediatric care**: Special handling for child dependents
- **Family medicine**: Coordinated care for family units
- **Emergency treatment**: Dependent emergency medical decisions
- **Consent management**: Track medical consent for minors

### Age-Based Services
- **Child healthcare**: Pediatric services and immunizations
- **Adult dependents**: Elderly parent care coordination
- **Transition planning**: Healthcare transition at age of majority
- **Special needs**: Enhanced support for dependents with disabilities

---

## 🔄 DEPENDENT LIFECYCLE

### Registration Process
1. **Identity verification**: Confirm dependent identity and relationship
2. **Legal validation**: Verify custody/guardianship rights
3. **Medical aid enrollment**: Add to family medical aid policy
4. **Privacy setup**: Configure dependent privacy preferences

### Age Transition (Minors to Adults)
1. **Age monitoring**: Track approaching age of majority
2. **Account transition**: Create independent account for adult children
3. **Consent transfer**: Transfer medical decision rights
4. **Privacy migration**: Update privacy settings for new adult

### Relationship Changes
1. **Custody updates**: Handle custody arrangement changes
2. **Family restructuring**: Manage divorce/remarriage impacts
3. **Adoption finalization**: Update records for completed adoptions
4. **Guardianship changes**: Legal guardian appointment updates

---

## 📊 REPORTING & ANALYTICS

### Family Demographics
- **Family size**: Number of dependents per user
- **Age distribution**: Dependent age groups and healthcare needs
- **Relationship patterns**: Family structure analysis
- **Geographic clustering**: Family location patterns

### Healthcare Utilization
- **Family medical usage**: Combined family healthcare consumption
- **Preventive care**: Family immunization and screening compliance
- **Emergency services**: Family emergency service utilization
- **Specialist referrals**: Family specialist healthcare coordination

---

**CONCLUSION**: Comprehensive dependent management table for family healthcare coordination with strict privacy protections, minor safeguards, custody awareness, and medical aid integration for South African healthcare system compliance.