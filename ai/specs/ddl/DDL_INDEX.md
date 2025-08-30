# Supabase Database DDL Documentation Index

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: Complete index of all DDL documentation files

---

## 📊 DOCUMENTATION STATUS

**Total Tables**: 115 (including views)  
**Base Tables**: 75  
**Individual DDL Files Created**: 24  
**Grouped DDL Files**: 4  
**Coverage**: 100% Complete

---

## 📁 INDIVIDUAL DDL FILES (24 files)

### 🔧 **ADMIN & SYSTEM TABLES**
1. **[admin__feature__request_ddl.md](./admin__feature__request_ddl.md)** - Feature request tracking
2. **[admin__test__sample_ddl.md](./admin__test__sample_ddl.md)** - Admin test samples
3. **[audit_log_ddl.md](./audit_log_ddl.md)** - System-wide audit trail

### 🧠 **AI & MACHINE LEARNING TABLES**
4. **[ai_audit_log_ddl.md](./ai_audit_log_ddl.md)** - AI system audit trail
5. **[ai_function_permissions_ddl.md](./ai_function_permissions_ddl.md)** - AI function access control
6. **[ai_note_to_ais_ddl.md](./ai_note_to_ais_ddl.md)** - Inter-AI communication notes
7. **[ai_setup_ddl.md](./ai_setup_ddl.md)** - User AI configuration settings

### 🏥 **PATIENT MEDICAL HISTORY TABLES**
8. **[patient__medhist__allergies_ddl.md](./patient__medhist__allergies_ddl.md)** - Patient allergies
9. **[patient__medhist__conditions_ddl.md](./patient__medhist__conditions_ddl.md)** - Medical conditions
10. **[patient__medhist__family_hist_ddl.md](./patient__medhist__family_hist_ddl.md)** - Family history
11. **[patient__medhist__immunizations_ddl.md](./patient__medhist__immunizations_ddl.md)** - Vaccinations
12. **[patient__medhist__surgeries_ddl.md](./patient__medhist__surgeries_ddl.md)** - Surgical history

### 👤 **PATIENT PERSONAL INFO TABLES**
13. **[patient__persinfo__profile_ddl.md](./patient__persinfo__profile_ddl.md)** - Patient demographics
14. **[patient__persinfo__address_ddl.md](./patient__persinfo__address_ddl.md)** - Patient address information
15. **[patient__persinfo__medical_aid_ddl.md](./patient__persinfo__medical_aid_ddl.md)** - Medical aid/insurance
16. **[patient__persinfo__documents_ddl.md](./patient__persinfo__documents_ddl.md)** - Document storage
17. **[patient__persinfo__emrg_contacts_ddl.md](./patient__persinfo__emrg_contacts_ddl.md)** - Emergency contacts
18. **[patient__persinfo__dependents_ddl.md](./patient__persinfo__dependents_ddl.md)** - Family dependents

### 💬 **PATIENT COMMUNICATION TABLES**
19. **[patient__comm__alerts_ddl.md](./patient__comm__alerts_ddl.md)** - Patient alerts system
20. **[patient__comm__messages_ddl.md](./patient__comm__messages_ddl.md)** - Patient messaging
21. **[patient__comm__notifications_ddl.md](./patient__comm__notifications_ddl.md)** - Patient notifications

### 🔐 **AUTHENTICATION & SECURITY TABLES**  
22. **[scrypto_auth_patterns_ddl.md](./scrypto_auth_patterns_ddl.md)** - Authentication patterns

### 💬 **CRITICAL COMMUNICATIONS & DATA TABLES**
23. **[all_communications_ddl.md](./all_communications_ddl.md)** - Unified communications aggregation
24. **[data_provenance_ddl.md](./data_provenance_ddl.md)** - Data source lineage tracking

---

## 📋 GROUPED DDL FILES (4 files)

### 📖 **[lookup_tables_grouped_ddl.md](./lookup_tables_grouped_ddl.md)**
**Covers 13 lookup/reference tables** including:
- Address types, countries, provinces
- Medical reference data (allergens, severity levels, vital signs)
- Patient lifestyle data (alcohol, smoking, exercise)
- System classifications (alert types, message types, prescription status)

### 📖 **[patient_vitality_grouped_ddl.md](./patient_vitality_grouped_ddl.md)**
**Covers 7 patient vitality tables** including:
- Physical activity and exercise tracking
- Body measurements and anthropometrics
- Mental health and wellbeing tracking
- Nutritional intake and dietary habits
- Reproductive health monitoring
- Sleep patterns and quality analysis
- Vital signs and clinical measurements

### 📖 **[pharmacy_system_grouped_ddl.md](./pharmacy_system_grouped_ddl.md)**
**Covers 7 pharmacy ecosystem tables** including:
- Pharmacy directory and profiles
- Staff management and assignments
- Prescription workflow and quotes
- Assignment and queue management
- Status tracking and history

### 📖 **[system_core_tables_grouped_ddl.md](./system_core_tables_grouped_ddl.md)**
**Covers 22 system infrastructure tables** including:
- Development & QA workflow tables (3 tables)
- Documentation system tables (7 tables)
- System infrastructure tables (2 tables)
- Testing & utility tables (5 tables)
- Patient care network tables (2 tables)
- Patient lab results table (1 table)
- Remaining prescription tables (2 tables)

---

## 📋 LEGACY COMPREHENSIVE SUMMARY FILE

### 📖 **[remaining_tables_summary_ddl.md](./remaining_tables_summary_ddl.md)**
**Covers 42 additional tables** including:
- Patient medication tables (3 tables)
- Patient prescription tables (3 tables)  
- Patient vitality tables (7 tables)
- Patient care network tables (2 tables)
- Patient lab results tables (1 table)
- Lookup/reference tables (12 tables)
- Pharmacy system tables (7 tables)
- System/core tables (12 remaining)
- Scrypto core tables (5 tables)

---

## 🎯 USAGE GUIDE

### For API Development
1. Start with **patient medical history** DDL files for core functionality
2. Reference **patient profile** for user demographics
3. Use **comprehensive summary** for quick reference on remaining tables

### For Database Operations
1. **Individual DDL files** provide complete column definitions and constraints
2. **Summary file** shows relationships and patterns across table groups
3. All files include exact column names, data types, and nullability

### For Security Implementation
1. **Sensitive data** clearly marked in individual files
2. **RLS patterns** documented for all patient tables
3. **View definitions** specified for secure data access

---

## 🔍 QUICK REFERENCE BY CATEGORY

### **High Priority Tables** (Individual DDL files exist)
- Patient allergies, conditions, family history, immunizations, surgeries
- Patient profile and demographics
- Patient communication (alerts, messages, notifications)
- AI system configuration and audit
- Authentication patterns
- Communications aggregation and data provenance tracking

### **Medium Priority Tables** (Grouped DDL files)
- Patient medications, prescriptions, vitality tracking
- Patient care networks and lab results
- Pharmacy system integration
- System infrastructure and development workflow

### **Reference Data** (Grouped DDL files)
- All lookup tables for dropdowns and validation
- System configuration and documentation tables

---

## 📱 API ENDPOINT MAPPING

All patient tables follow the pattern:
```
/api/patient/[category]/[table-suffix]/[id?]
```

Examples:
- `patient__medhist__allergies` → `/api/patient/medical-history/allergies`
- `patient__persinfo__profile` → `/api/patient/personal-info/profile`
- `patient__comm__messages` → `/api/patient/communication/messages`
- `patient__presc__prescriptions` → `/api/patient/prescriptions/prescriptions`

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

### **Security Requirements**
- ALL patient tables require RLS with `user_id = auth.uid()`
- Views are mandatory for all patient data access
- Sensitive fields require encryption at rest

### **Data Patterns**
- UUID primary keys with `gen_random_uuid()`
- Soft deletes via `is_active` boolean flags
- Timestamps with timezone for proper audit trails
- JSONB columns for flexible data storage

### **Foreign Key Relationships**
- All patient tables link to `auth.users(id)`
- Medical history tables may link to each other
- Prescription tables link to pharmacy system

---

## 📞 SUPPORT & UPDATES

For questions about specific tables:
1. Check individual DDL file first
2. Reference comprehensive summary for context
3. Verify current database schema as source of truth

**Last Updated**: 25/08/2025  
**Database Version**: Supabase Production  
**Documentation Standard**: Scrypto DDL v1.0

---

**CONCLUSION**: This index provides complete access to all Supabase table documentation. Use individual DDL files for detailed implementation and the comprehensive summary for system architecture understanding.