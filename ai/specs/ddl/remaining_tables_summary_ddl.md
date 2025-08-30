# Remaining Supabase Tables - DDL Summary Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: Summary of ALL remaining table structures for rapid reference

---

## 📊 COMPLETED DDL FILES (7 tables)

✅ **admin__test__sample** - Admin test sample table  
✅ **ai_audit_log** - AI system audit trail  
✅ **ai_function_permissions** - AI function access control  
✅ **ai_note_to_ais** - Inter-AI communication notes  
✅ **ai_setup** - User AI configuration settings  
✅ **patient__medhist__conditions** - Patient medical conditions  
✅ **patient__medhist__family_hist** - Patient family medical history  
✅ **patient__medhist__immunizations** - Patient vaccination records  
✅ **patient__medhist__surgeries** - Patient surgical history  

---

## 🔄 REMAINING TABLES TO PROCESS (57 tables)

### 🏥 **PATIENT MEDICATION TABLES (3)**
- `patient__medications__medications` - 30 columns (comprehensive medication tracking)
- `patient__medications__adherence` - Medication compliance tracking
- `patient__medications__history` - Historical medication changes

### 👤 **PATIENT PERSONAL INFO TABLES (6)**
- `patient__persinfo__profile` - 31 columns (complete patient profile)
- `patient__persinfo__address` - 46 columns (home/postal/delivery addresses)
- `patient__persinfo__dependents` - Dependents and family members
- `patient__persinfo__documents` - Document storage and tracking
- `patient__persinfo__emrg_contacts` - Emergency contact information
- `patient__persinfo__medical_aid` - Medical aid/insurance details

### 💊 **PATIENT PRESCRIPTION TABLES (3)**
- `patient__presc__prescriptions` - 36 columns (OCR prescription processing)
- `patient__presc__medications` - Prescription medication details
- `patient__presc__scans` - Prescription scan management

### ⚡ **PATIENT VITALITY TABLES (7)**
- `patient__vitality__activity` - Physical activity tracking
- `patient__vitality__body_measure` - Body measurements and BMI
- `patient__vitality__mental` - Mental health tracking
- `patient__vitality__nutrition` - Nutritional data
- `patient__vitality__reproductive` - Reproductive health
- `patient__vitality__sleep` - Sleep pattern tracking
- `patient__vitality__vital_signs` - Blood pressure, heart rate, etc.

### 🏥 **PATIENT CARE NETWORK TABLES (2)**
- `patient__carenet__caregivers` - Healthcare professional network
- `patient__carenet__caretakers` - Personal care support network

### 📨 **PATIENT COMMUNICATION TABLES (3)**
- `patient__comm__alerts` - System alerts and notifications
- `patient__comm__messages` - Patient-provider messaging
- `patient__comm__notifications` - Push notification management

### 🧪 **PATIENT LAB RESULTS TABLES (1)**
- `patient__labresults__results` - Laboratory test results

### 🔍 **LOOKUP/REFERENCE TABLES (12)**
- `lookup_address_types` - Address type classifications
- `lookup_alcohol_use` - Alcohol consumption levels
- `lookup_alert_types` - Alert type classifications
- `lookup_allergen_type` - Allergen categories
- `lookup_allergy_severity` - Allergy severity levels
- `lookup_countries` - Country reference data
- `lookup_exercise_frequency` - Exercise frequency options
- `lookup_message_types` - Message type classifications
- `lookup_prescription_status` - Prescription status options
- `lookup_sa_provinces` - South African province data
- `lookup_severity_levels` - General severity classifications
- `lookup_smoking_status` - Smoking status options
- `lookup_vital_sign_types` - Vital sign type definitions

### 🏪 **PHARMACY SYSTEM TABLES (7)**
- `pharmacies_directory` - Pharmacy locations and details
- `pharmacy_assignment_requests` - Pharmacy assignment workflow
- `pharmacy_profiles` - Pharmacy business profiles
- `pharmacy_quotes` - Medication pricing quotes
- `pharmacy_staff_profiles` - Pharmacy staff information
- `prescription_flows` - Prescription workflow tracking
- `prescription_pharmacy_queue` - Pharmacy fulfillment queue
- `prescription_status_history` - Prescription status changes

### 🔧 **SYSTEM/CORE TABLES (13)**
- `audit_log` - ✅ **COMPLETED** - System audit trail
- `data_provenance` - Data source tracking and lineage
- `ddl_mapping` - Database schema mapping
- `development_tasks` - Development task management
- `document_categories` - Document classification system
- `page_qa_checklist` - Page quality assurance
- `page_qa_summary` - QA summary reports
- `procedure_column_mapping` - Stored procedure mappings
- `sidebar_structure` - UI navigation structure
- `simple_test_table` - Testing and development
- `standard_abbreviations` - Medical abbreviation dictionary
- `task_items` - Task management system
- `task_summary` - Task summary reports
- `test__simple__notes` - Test note management

### 🧠 **SCRYPTO CORE TABLES (5)**
- `scrypto_complete_mapping` - Complete system mappings
- `scrypto_core_rules` - Business rule definitions
- `scrypto_data_journey` - Data flow documentation
- `scrypto_developer_guide` - Developer documentation
- `scrypto_quick_reference` - Quick reference guide

---

## 🎯 **CRITICAL TABLE PATTERNS IDENTIFIED**

### **User-Scoped Tables** (Most patient__ tables)
```sql
-- Standard Pattern:
user_id UUID NOT NULL → auth.users(id)
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

### **Lookup Tables** (All lookup__ tables)
```sql
-- Standard Pattern:
[type]_id INTEGER PRIMARY KEY (auto-increment)
[type]_code VARCHAR NOT NULL
[type]_name VARCHAR NOT NULL  
[type]_description TEXT
display_order INTEGER
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

### **Complex Data Tables** (Prescriptions, Medications)
```sql
-- JSONB columns for flexible data:
medications JSONB
pharmacy_details JSONB
mvr_data JSONB
configuration JSONB
```

---

## ⚠️ **URGENT PRIORITY FOR INDIVIDUAL DDL CREATION**

### **HIGH PRIORITY** (Create individual DDL files first):
1. `patient__persinfo__profile` - Core patient demographics
2. `patient__persinfo__address` - Critical for delivery/communication
3. `patient__medications__medications` - Core medication management
4. `patient__presc__prescriptions` - OCR prescription processing
5. `pharmacies_directory` - Pharmacy location services

### **MEDIUM PRIORITY** (Create after high priority):
6. All `patient__vitality__*` tables - Health tracking
7. All `patient__comm__*` tables - Communication system
8. All `pharmacy_*` tables - Pharmacy ecosystem

### **LOW PRIORITY** (Reference tables):
9. All `lookup_*` tables - Reference data
10. All `scrypto_*` tables - Documentation/system
11. Remaining system tables

---

## 🔧 **API INTEGRATION PATTERN**

All patient tables follow this pattern:
```
/api/patient/[category]/[table-suffix]/[id?]
→ SELECT * FROM v_patient__[category]__[table] WHERE user_id = auth.uid()
```

Examples:
- `/api/patient/personal-info/profile` → `v_patient__persinfo__profile`
- `/api/patient/medications/medications` → `v_patient__medications__medications`
- `/api/patient/prescriptions/prescriptions` → `v_patient__presc__prescriptions`

---

## 🚨 **CRITICAL IMPLEMENTATION NOTES**

1. **ALL patient tables require RLS** with `user_id = auth.uid()`
2. **Views are mandatory** for all patient data access
3. **JSONB columns** are used extensively for flexible data storage
4. **Proper timezone handling** with `timestamp with time zone`
5. **Soft deletes** via `is_active` boolean flags
6. **Audit trails** link to main `audit_log` table
7. **Foreign key constraints** maintain referential integrity
8. **Sensitive data** (API keys, medical data) requires encryption

---

**STATUS**: This summary covers all 64 total tables. 9 individual DDL files completed, 55 remaining. Use this summary to prioritize which individual DDL files to create based on development needs.