# Lookup Tables Group - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for all lookup/reference tables

---

## 📊 OVERVIEW

### Tables Covered (13 tables)
- Address types, countries, provinces
- Medical reference data (allergens, severity levels, vital signs)
- Patient lifestyle data (alcohol, smoking, exercise)
- System classifications (alert types, message types, prescription status)

### Common Pattern
Most lookup tables follow this structure:
- Primary key (auto-increment integer or code)
- Code/Name/Description fields
- Display order for UI sorting
- Active status for soft deletes
- Created/updated timestamps

---

## 🏠 ADDRESS & LOCATION TABLES

### 1. lookup_address_types
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
description | text NULL
display_order | integer NULL DEFAULT 0
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Address type classifications (home, work, postal, etc.)

### 2. lookup_countries
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
iso_code | character varying NULL
display_order | integer NULL DEFAULT 0
```
**Purpose**: Country reference data with ISO codes

### 3. lookup_sa_provinces
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
display_order | integer NULL DEFAULT 0
```
**Purpose**: South African province data

---

## 🏥 MEDICAL REFERENCE TABLES

### 4. lookup_allergen_type
```sql
type_id | integer NOT NULL DEFAULT nextval('lookup_allergen_type_type_id_seq') (PRIMARY KEY)
type_code | character varying NOT NULL
type_name | character varying NOT NULL
type_description | text NULL
display_order | integer NOT NULL
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Allergen categories (food, drug, environmental, etc.)

### 5. lookup_allergy_severity
```sql
severity_id | integer NOT NULL DEFAULT nextval('lookup_allergy_severity_severity_id_seq') (PRIMARY KEY)
severity_code | character varying NOT NULL
severity_name | character varying NOT NULL
severity_description | text NULL
display_order | integer NOT NULL
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Allergy severity levels (mild, moderate, severe, life-threatening)

### 6. lookup_severity_levels
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
color | character varying NULL
icon | character varying NULL
display_order | integer NULL DEFAULT 0
```
**Purpose**: General severity classifications with UI styling

### 7. lookup_vital_sign_types
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
unit | character varying NULL
normal_range_min | numeric NULL
normal_range_max | numeric NULL
critical_low | numeric NULL
critical_high | numeric NULL
display_order | integer NULL DEFAULT 0
```
**Purpose**: Vital sign definitions with normal/critical ranges

---

## 👤 LIFESTYLE & BEHAVIOR TABLES

### 8. lookup_alcohol_use
```sql
alcohol_use_id | integer NOT NULL DEFAULT nextval('lookup_alcohol_use_alcohol_use_id_seq') (PRIMARY KEY)
alcohol_use_code | character varying NOT NULL
alcohol_use_name | character varying NOT NULL
alcohol_use_description | text NULL
display_order | integer NOT NULL
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Alcohol consumption levels (none, light, moderate, heavy)

### 9. lookup_smoking_status
```sql
smoking_status_id | integer NOT NULL DEFAULT nextval('lookup_smoking_status_smoking_status_id_seq') (PRIMARY KEY)
smoking_status_code | character varying NOT NULL
smoking_status_name | character varying NOT NULL
smoking_status_description | text NULL
display_order | integer NOT NULL
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Smoking status options (never, former, current, quit)

### 10. lookup_exercise_frequency
```sql
exercise_frequency_id | integer NOT NULL DEFAULT nextval('lookup_exercise_frequency_exercise_frequency_id_seq') (PRIMARY KEY)
exercise_frequency_code | character varying NOT NULL
exercise_frequency_name | character varying NOT NULL
exercise_frequency_description | text NULL
display_order | integer NOT NULL
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: Exercise frequency options (daily, weekly, rarely, never)

---

## 🔔 SYSTEM & COMMUNICATION TABLES

### 11. lookup_alert_types
```sql
alert_type_id | integer NOT NULL DEFAULT nextval('lookup_alert_types_alert_type_id_seq') (PRIMARY KEY)
type_code | text NOT NULL
type_name | text NOT NULL
type_description | text NULL
severity_level | text NOT NULL
display_order | integer NULL DEFAULT 999
is_active | boolean NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT now()
updated_at | timestamp with time zone NULL DEFAULT now()
```
**Purpose**: System alert classifications with severity levels

### 12. lookup_message_types
```sql
message_type_id | integer NOT NULL DEFAULT nextval('lookup_message_types_message_type_id_seq') (PRIMARY KEY)
type_code | character varying NOT NULL
type_name | character varying NOT NULL
type_description | text NULL
priority_level | character varying NOT NULL DEFAULT 'normal'
display_order | integer NOT NULL DEFAULT 0
is_active | boolean NOT NULL DEFAULT true
created_at | timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP
updated_at | timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP
```
**Purpose**: Message type classifications with priority levels

### 13. lookup_prescription_status
```sql
code | character varying NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
color | character varying NULL
display_order | integer NULL DEFAULT 0
```
**Purpose**: Prescription status options with UI colors

---

## 🔍 USAGE PATTERNS

### Frontend Dropdowns
```sql
-- Address types for forms
SELECT code, name FROM lookup_address_types WHERE is_active = true ORDER BY display_order;

-- Severity levels with styling
SELECT code, name, color, icon FROM lookup_severity_levels ORDER BY display_order;

-- Vital signs with ranges
SELECT code, name, unit, normal_range_min, normal_range_max FROM lookup_vital_sign_types;
```

### Validation Queries
```sql
-- Validate allergy severity
SELECT COUNT(*) FROM lookup_allergy_severity 
WHERE severity_code = ? AND is_active = true;

-- Get alert severity
SELECT severity_level FROM lookup_alert_types 
WHERE type_code = ? AND is_active = true;
```

---

## 🔧 API INTEGRATION

### Common Endpoint Pattern
```
/api/lookups/{table-type}
→ GET all active lookup values for dropdown population
```

Examples:
- `/api/lookups/address-types` → lookup_address_types
- `/api/lookups/countries` → lookup_countries  
- `/api/lookups/allergen-types` → lookup_allergen_type
- `/api/lookups/severity-levels` → lookup_severity_levels

---

## ✅ BUSINESS RULES

### Display Order
- Lower numbers appear first in UI
- Default 0 or 999 for new items
- Used for logical grouping and UX optimization

### Active Status
- `is_active = false` for soft deletes
- Inactive items hidden from dropdowns
- Preserves historical data integrity

### Code Standards
- Codes should be stable identifiers
- Names can change for UI updates
- Descriptions provide help text

---

## 🚨 CRITICAL NOTES

1. **REFERENCE DATA ONLY** - No patient PII
2. **Frontend dependencies** - Changes affect UI dropdowns
3. **Historical integrity** - Never delete, only deactivate
4. **Code stability** - Codes used as foreign keys
5. **Display order matters** - Affects user experience
6. **Multi-language ready** - Name fields can be localized

---

## 🛡️ SECURITY CONSIDERATIONS

### Data Classification
- **PUBLIC**: All lookup data is non-sensitive reference information
- **STABLE**: Core system functionality depends on these tables
- **CACHED**: Often cached in frontend for performance

### Access Patterns
- **READ-ONLY** for most application users
- **ADMIN ONLY** for modifications
- **SYSTEM INTEGRATION** for validation

---

## 📊 MAINTENANCE

### Regular Tasks
1. Review `display_order` for UX optimization
2. Update descriptions for clarity
3. Add new options as business requires
4. Retire obsolete options (set `is_active = false`)

### Data Integrity
- Validate foreign key references before deactivating
- Test frontend dropdowns after changes
- Monitor API usage for breaking changes

---

**CONCLUSION**: Essential reference data tables providing stable, well-structured lookup values for dropdowns, validation, and business logic throughout the application. Critical foundation for data integrity and user experience.