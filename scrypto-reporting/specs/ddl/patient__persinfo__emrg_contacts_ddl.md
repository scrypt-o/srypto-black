# Table: patient__persinfo__emrg_contacts - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient emergency contacts table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__emrg_contacts
```

### Primary Key
```sql
contact_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `contact_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `name` | `text` | **NO** | `null` | **REQUIRED** Emergency contact name |
| `relationship` | `text` | YES | `null` | Relationship to patient |
| `phone` | `text` | YES | `null` | **SENSITIVE** Primary phone number |
| `email` | `text` | YES | `null` | **SENSITIVE** Email address |
| `is_primary` | `boolean` | YES | `false` | Primary emergency contact flag |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `address` | `text` | YES | `null` | **SENSITIVE** Physical address |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `alternative_phone` | `text` | YES | `null` | **SENSITIVE** Alternative phone number |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__emrg_contacts
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS SENSITIVE CONTACT DATA** for non-owner access
- Emergency services access in critical situations

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `name` NOT NULL - required field
- `relationship` CHECK: IN ('spouse', 'parent', 'child', 'sibling', 'partner', 'friend', 'relative', 'guardian', 'caregiver', 'other')
- Only ONE primary contact per user: `is_primary = true` unique constraint
- At least one contact method required: (phone IS NOT NULL OR email IS NOT NULL)
- Index on (user_id, is_primary) for primary contact queries

---

## 🎯 FILTER CONDITIONS

### For User's Emergency Contacts
```sql
WHERE user_id = auth.uid()
  AND is_active = true
```

### For Primary Emergency Contact
```sql
WHERE user_id = auth.uid() 
  AND is_primary = true
  AND is_active = true
```

### For Active Contacts with Phone
```sql
WHERE user_id = auth.uid() 
  AND is_active = true
  AND (phone IS NOT NULL OR alternative_phone IS NOT NULL)
```

### Emergency Services Access (Critical)
```sql
WHERE user_id = ? -- Patient ID from medical emergency
  AND is_active = true
  ORDER BY is_primary DESC, created_at ASC
```

---

## ✅ VALIDATION RULES

### Required Fields
- `contact_id` (auto-generated)
- `user_id` (from auth.uid())
- `name` (cannot be null)

### Contact Information Requirements
- At least ONE contact method must be provided (phone OR email)
- Phone numbers must be valid format
- Email addresses must be valid format
- Maximum 5 emergency contacts per user

### Relationship Types
- **spouse**: Married partner
- **parent**: Mother or father
- **child**: Son or daughter
- **sibling**: Brother or sister
- **partner**: Domestic partner/significant other
- **friend**: Close friend
- **relative**: Extended family member
- **guardian**: Legal guardian (for minors)
- **caregiver**: Professional or family caregiver
- **other**: Other relationship type

### Sensitive Data Fields
- `phone` - Primary phone number (encrypt at rest)
- `email` - Email address (encrypt at rest)
- `address` - Physical address (encrypt at rest)
- `alternative_phone` - Alternative phone (encrypt at rest)

### Business Rules
- **Only ONE primary contact** allowed per user
- **Primary contact** should have complete information
- **Emergency access** allowed for healthcare providers in critical situations
- **Contact verification** recommended annually

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__emrg_contacts`
2. **The view name is**: `v_patient__persinfo__emrg_contacts`
3. **LIFE-CRITICAL DATA** - Used in medical emergencies
4. **CONTAINS SENSITIVE THIRD-PARTY PII** - Must be encrypted at rest
5. **Emergency services access** - Special access rules for medical emergencies
6. **One primary contact maximum** - Business rule enforcement required
7. **GDPR/POPIA compliance** for third-party personal data

---

## 🔧 API INTEGRATION POINTS

### GET User Emergency Contacts
```
/api/patient/personal-info/emergency-contacts
→ SELECT * FROM v_patient__persinfo__emrg_contacts WHERE user_id = auth.uid()
```

### GET Primary Emergency Contact
```
/api/patient/personal-info/emergency-contacts/primary
→ SELECT * FROM v_patient__persinfo__emrg_contacts WHERE user_id = auth.uid() AND is_primary = true
```

### POST New Emergency Contact
```
/api/patient/personal-info/emergency-contacts
→ INSERT INTO patient__persinfo__emrg_contacts
```

### PUT Update Emergency Contact
```
/api/patient/personal-info/emergency-contacts/{contact_id}
→ UPDATE patient__persinfo__emrg_contacts SET ... WHERE contact_id = ? AND user_id = auth.uid()
```

### DELETE Emergency Contact
```
/api/patient/personal-info/emergency-contacts/{contact_id}
→ UPDATE patient__persinfo__emrg_contacts SET is_active = false WHERE contact_id = ? AND user_id = auth.uid()
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **PUBLIC**: Relationship types
- **INTERNAL**: Contact names
- **CONFIDENTIAL**: Phone numbers, email addresses, physical addresses
- **RESTRICTED**: Complete contact profiles for third parties

### Access Controls
- **Owner**: Full read/write/delete access
- **Healthcare Provider**: Read access during medical emergencies only
- **Emergency Services**: Limited read access during verified emergencies
- **System**: No direct access - use service accounts with audit trails

### Third-Party Privacy
- **Consent required**: Contacts must consent to emergency notification
- **Limited purpose**: Contact data only used for genuine emergencies
- **Data minimization**: Only collect necessary emergency information
- **Right to removal**: Contacts can request removal from emergency lists

### Emergency Access Protocol
1. **Verification**: Confirm legitimate medical emergency
2. **Limited access**: Only essential contact information provided
3. **Audit logging**: All emergency access events logged
4. **Time limits**: Emergency access expires after incident resolution
5. **Notification**: Contact patient when emergency contact accessed

---

## 🚨 EMERGENCY PROCEDURES

### Medical Emergency Access
```sql
-- Healthcare Provider Emergency Access
SELECT name, phone, alternative_phone, relationship
FROM patient__persinfo__emrg_contacts 
WHERE user_id = $patient_id 
  AND is_active = true
ORDER BY is_primary DESC, created_at ASC
LIMIT 3;
```

### Emergency Contact Priority
1. **Primary contact** (is_primary = true)
2. **Spouse/Partner** relationships
3. **Parent/Guardian** relationships
4. **Other family** relationships
5. **Friends/Caregivers**

### Critical Situations
- **Life-threatening emergencies**: Access all active contacts
- **Minor medical events**: Access primary contact only
- **Mental health crises**: Access designated mental health contact if specified
- **Legal/Consent issues**: Access guardian/legal representative

---

## 🔄 CONTACT MANAGEMENT

### Contact Verification
- **Annual review**: Prompt users to verify contact information
- **Contact confirmation**: Send verification messages to contacts
- **Outdated detection**: Flag contacts with failed contact attempts
- **Update reminders**: Notify users when contact info is stale

### Privacy Management
- **Consent tracking**: Record contact consent for emergency notification
- **Opt-out handling**: Allow contacts to remove themselves
- **Data retention**: Remove inactive contacts after defined period
- **Shared access**: Allow contacts to update their own information

---

**CONCLUSION**: Life-critical emergency contact table with comprehensive privacy protections, emergency access protocols, and third-party consent management for patient safety and legal compliance.