# CORE NAMING CONVENTION - THE ONLY TRUTH
**THIS DOCUMENT SUPERSEDES ALL OTHER NAMING CONVENTIONS**
Last Updated: 2025-09-02

## CRITICAL: These Are The ONLY Valid Names

### Patient Domain Groups (EXACTLY THESE - NO VARIATIONS)
```
Group Code   | Full Name                | Used In
-------------|--------------------------|------------------
comm         | Communications           | DB, API, URLs
persinfo     | Personal Information     | DB, API, URLs  
presc        | Prescriptions           | DB, API, URLs
medications  | Medications             | DB, API, URLs
location     | Location Services       | DB, API, URLs
deals        | Pharmacy Deals          | DB, API, URLs
vitality     | Vitality & Wellness     | DB, API, URLs
carenet      | Care Network            | DB, API, URLs
medhist      | Medical History         | DB, API, URLs
labresults   | Lab Results             | DB, API, URLs
rewards      | Rewards Program         | DB, API, URLs
```

**NO OTHER VARIATIONS ALLOWED:**
- ❌ NEVER: personal-info, personal_info, personalinfo
- ✅ ALWAYS: persinfo
- ❌ NEVER: medical-history, medical_history, medicalhistory  
- ✅ ALWAYS: medhist

## The Iron Rules - NO EXCEPTIONS

### 1. Database Tables
```
Pattern: patient__{group}__{item}
Example: patient__persinfo__profile
         patient__medhist__allergies
```

### 2. Database Views
```
Pattern: v_patient__{group}__{item}
Example: v_patient__persinfo__profile
         v_patient__medhist__allergies
```

### 3. API Routes
```
Pattern: /api/patient/{group}/{item}
Example: /api/patient/persinfo/profile
         /api/patient/medhist/allergies

CRITICAL: Use group code, NOT full name!
```

### 4. Page Routes
```
Pattern: /patient/{group}/{item}
Example: /patient/persinfo/profile
         /patient/medhist/allergies
```

### 5. Component Files
```
Pattern: /components/features/patient/{group}/{ItemFeature}.tsx
Example: /components/features/patient/persinfo/ProfileEditForm.tsx
         /components/features/patient/medhist/AllergiesListFeature.tsx
```

### 6. Hook Files
```
Pattern: /hooks/use{Group}{Item}.ts
Example: /hooks/usePersinfoProfile.ts
         /hooks/useMedhistAllergies.ts
```

### 7. Schema Files
```
Pattern: /schemas/{item}.ts
Example: /schemas/profile.ts
         /schemas/allergies.ts

Export: {Item}Schema, {Item}Row, {Item}CreateInput, {Item}UpdateInput
```

## Common Items by Group

### persinfo (Personal Information)
- profile
- addresses
- documents
- dependents
- emergency-contacts
- medical-aid

### medhist (Medical History)
- allergies
- conditions
- family-history
- immunizations
- surgeries

### presc (Prescriptions)
- scan
- active
- history
- quotes

### comm (Communications)
- messages
- alerts
- notifications

## Validation Checklist

Before ANY implementation:
1. ✓ Does the database table match `patient__{group}__{item}`?
2. ✓ Does the API folder match `/api/patient/{group}/`?
3. ✓ Is the group code from the approved list above?
4. ✓ Does the URL use the group code (not full name)?

## Examples of CORRECT Implementation

### Profile Feature (Complete Vertical Slice)
```
Database Table:  patient__persinfo__profile
Database View:   v_patient__persinfo__profile
API Route:       /api/patient/persinfo/profile
Page Route:      /patient/persinfo/profile
Component:       /components/features/patient/persinfo/ProfileEditForm.tsx
Hook:           /hooks/usePersinfoProfile.ts
Schema:         /schemas/profile.ts
```

### Allergies Feature (Complete Vertical Slice)
```
Database Table:  patient__medhist__allergies
Database View:   v_patient__medhist__allergies
API Route:       /api/patient/medhist/allergies
Page Route:      /patient/medhist/allergies
Component:       /components/features/patient/medhist/AllergiesListFeature.tsx
Hook:           /hooks/useMedhistAllergies.ts
Schema:         /schemas/allergies.ts
```

## Common Mistakes That Break The App

1. **Using full names instead of codes**
   - ❌ /api/patient/personal-information/profile
   - ✅ /api/patient/persinfo/profile

2. **Inconsistent naming between layers**
   - ❌ DB: patient__persinfo__profile, API: /api/patient/personal-info/profile
   - ✅ DB: patient__persinfo__profile, API: /api/patient/persinfo/profile

3. **Creating new group names**
   - ❌ /api/patient/personal/profile
   - ✅ /api/patient/persinfo/profile

## Enforcement

Run this check before EVERY commit:
```bash
# Check API folder structure
ls app/api/patient/ | grep -E "^(comm|persinfo|presc|medications|location|deals|vitality|carenet|medhist|labresults|rewards)$"

# If any folder doesn't match, FIX IT IMMEDIATELY
```

## The Golden Rule

**If it's not in this document, it's WRONG.**

No interpretations. No variations. No shortcuts.
This is the ONLY naming convention that matters.