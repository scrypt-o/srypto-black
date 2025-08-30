# System Core Tables Group - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: System infrastructure, development, and documentation tables

---

## 📊 OVERVIEW

### Tables Covered (12 tables)
- **Development & QA**: Development tasks, QA checklists and summaries
- **Documentation System**: Mapping tables, core rules, quick reference guides
- **System Infrastructure**: DDL mapping, procedure mapping, sidebar structure
- **Testing & Utilities**: Simple test table, standard abbreviations, task management

### Common Patterns
- Mixed security models (some public, some user-scoped)
- JSONB columns for flexible configuration storage
- Timestamp tracking for audit trails
- Reference/lookup functionality for system operations

---

## 🔧 DEVELOPMENT & QA TABLES

### 1. development_tasks
**Purpose**: Track development tasks and project management
- Project task tracking and status management
- Development workflow coordination
- Feature implementation tracking

**Expected Key Fields**: task_id, title, description, status, assigned_to, priority, due_date

### 2. page_qa_checklist  
**Purpose**: Quality assurance checklist for page reviews
- QA checklist items and criteria
- Page review workflow management
- Quality gate enforcement

**Expected Key Fields**: checklist_id, page_name, criteria, status, checked_by, review_date

### 3. page_qa_summary
**Purpose**: Summary reports of QA activities  
- Aggregate QA metrics and results
- Page quality score tracking  
- QA trend analysis and reporting

**Expected Key Fields**: summary_id, page_name, total_checks, passed_checks, failed_checks, qa_score

---

## 📚 DOCUMENTATION SYSTEM TABLES

### 4. ddl_mapping
**Purpose**: Database schema mapping and documentation
- Table-to-API endpoint mappings
- DDL documentation cross-references
- Schema evolution tracking

**Expected Key Fields**: mapping_id, table_name, api_endpoint, ddl_file_path, documentation_status

### 5. procedure_column_mapping  
**Purpose**: Stored procedure and column relationship mapping
- Database procedure documentation
- Column usage tracking across procedures
- API-to-procedure mapping

**Expected Key Fields**: mapping_id, procedure_name, column_name, table_name, usage_type

### 6. scrypto_complete_mapping
**Purpose**: Complete system architecture mapping
- Full system component relationships  
- Cross-service integration mapping
- System dependency tracking

**Expected Key Fields**: mapping_id, component_name, dependencies, integration_points, documentation_path

### 7. scrypto_core_rules
**Purpose**: Business rule definitions and enforcement
- Core business logic documentation
- Rule validation criteria
- Business constraint definitions

**Expected Key Fields**: rule_id, rule_name, description, validation_logic, enforcement_level

### 8. scrypto_data_journey  
**Purpose**: Data flow documentation and tracking
- Data transformation pipelines
- Process flow documentation
- Data lifecycle management

**Expected Key Fields**: journey_id, source_table, destination_table, transformation_rules, process_type

### 9. scrypto_developer_guide
**Purpose**: Developer documentation and guides
- Implementation guidelines  
- Code standards and patterns
- Architecture decision records

**Expected Key Fields**: guide_id, topic, content, category, last_updated, author

### 10. scrypto_quick_reference
**Purpose**: Quick reference guide for developers
- API endpoint quick reference
- Common query patterns
- Development shortcuts and tips

**Expected Key Fields**: reference_id, category, title, content, tags, usage_frequency

---

## 🏗️ SYSTEM INFRASTRUCTURE TABLES

### 11. sidebar_structure
**Purpose**: Application navigation structure configuration
- Menu hierarchy and organization
- Navigation permissions and access control
- Dynamic UI configuration

**Expected Key Fields**: structure_id, menu_item, parent_id, order_index, permissions, route_path

### 12. document_categories  
**Purpose**: Document classification and categorization system
- Document type definitions
- Category hierarchy management
- Document organization rules

**Expected Key Fields**: category_id, category_name, parent_category, description, allowed_types

---

## 🧪 TESTING & UTILITY TABLES

### 13. simple_test_table
**Purpose**: Development testing and validation
- Simple test data storage
- Development environment testing
- Feature validation and debugging

**Expected Key Fields**: test_id, test_name, test_data, expected_result, actual_result

### 14. standard_abbreviations
**Purpose**: Medical and system abbreviation dictionary  
- Standardized abbreviation definitions
- Medical terminology lookup
- System-wide abbreviation consistency

**Expected Key Fields**: abbreviation_id, abbreviation, full_text, category, medical_context

### 15. task_items
**Purpose**: General task management system
- Individual task tracking
- Task assignment and status
- Work item organization

**Expected Key Fields**: item_id, title, description, status, assigned_to, priority, due_date

### 16. task_summary  
**Purpose**: Task management summary and reporting
- Task completion metrics
- Progress tracking and reporting
- Team productivity analysis

**Expected Key Fields**: summary_id, period, total_tasks, completed_tasks, in_progress_tasks, team_metrics

### 17. test__simple__notes
**Purpose**: Simple note-taking for testing and development
- Development notes and observations
- Test case documentation
- Quick reference annotations

**Expected Key Fields**: note_id, title, content, category, created_by, tags

---

## 🔗 PATIENT CARE NETWORK TABLES

### 18. patient__carenet__caregivers
**Purpose**: Healthcare professional network for patients
- Doctor and specialist assignments
- Healthcare provider relationships
- Professional care coordination

**Expected Key Fields**: caregiver_id, user_id, provider_name, specialty, contact_info, is_primary

### 19. patient__carenet__caretakers  
**Purpose**: Personal care support network
- Family member care roles
- Personal support network
- Non-professional caregiver tracking

**Expected Key Fields**: caretaker_id, user_id, caretaker_name, relationship, contact_info, care_role

---

## 🧪 PATIENT LAB RESULTS TABLE

### 20. patient__labresults__results
**Purpose**: Laboratory test results and tracking
- Lab test results storage
- Historical test data
- Results trend analysis

**Expected Key Fields**: result_id, user_id, test_name, test_value, reference_range, result_date, lab_provider

---

## 💊 REMAINING PRESCRIPTION TABLES

### 21. patient__presc__medications
**Purpose**: Prescription medication details  
- Medication information from prescriptions
- Dosage and administration details
- Prescription medication tracking

**Expected Key Fields**: medication_id, user_id, prescription_id, medication_name, dosage, frequency, instructions

### 22. patient__presc__scans
**Purpose**: Prescription scan management
- Prescription image storage
- OCR processing results
- Scan quality and validation

**Expected Key Fields**: scan_id, user_id, prescription_id, image_url, ocr_status, scan_quality, processed_at

---

## 🔒 SECURITY IMPLEMENTATION PATTERNS

### **User-Scoped Tables** (All patient__ tables)
```sql
-- Standard RLS Pattern:
CREATE POLICY "policy_name" ON table_name 
  FOR SELECT USING (user_id = auth.uid());
```

### **System Tables** (Non-patient tables)  
```sql
-- Public read access with admin write:
CREATE POLICY "public_read" ON table_name 
  FOR SELECT USING (true);
  
CREATE POLICY "admin_write" ON table_name 
  FOR ALL USING (auth.role() = 'admin');
```

---

## 🎯 API INTEGRATION PATTERNS

### **Patient Care Network**
```
/api/patient/care-network/caregivers → patient__carenet__caregivers
/api/patient/care-network/caretakers → patient__carenet__caretakers
```

### **Patient Lab Results**
```  
/api/patient/lab-results/results → patient__labresults__results
```

### **Remaining Prescription Tables**
```
/api/patient/prescriptions/medications → patient__presc__medications  
/api/patient/prescriptions/scans → patient__presc__scans
```

### **System Configuration**
```
/api/system/navigation → sidebar_structure
/api/system/abbreviations → standard_abbreviations
/api/system/documentation → scrypto_developer_guide
```

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

### **Security Requirements**
1. **Patient tables** require RLS with `user_id = auth.uid()`
2. **System tables** need role-based access control
3. **Documentation tables** may be publicly readable

### **Data Patterns**  
4. **JSONB usage** for flexible configuration storage
5. **Hierarchical relationships** in navigation and categories
6. **Audit trails** for system configuration changes

### **Performance Considerations**
7. **Indexing** on user_id for all patient tables
8. **Caching** for frequently accessed system configuration
9. **Partitioning** consideration for large result sets

---

## 📱 FRONTEND INTEGRATION EXAMPLES

### **Care Network Management**
```typescript
interface CareGiver {
  caregiver_id: string;
  provider_name: string;
  specialty: string;
  contact_info: string;
  is_primary: boolean;
}

const { data: caregivers } = useQuery({
  queryKey: ['care-network', 'caregivers'],
  queryFn: () => supabase.from('patient__carenet__caregivers').select('*')
});
```

### **Lab Results Dashboard**
```typescript  
interface LabResult {
  result_id: string;
  test_name: string;
  test_value: number;
  reference_range: string;
  result_date: string;
  lab_provider: string;
}

const { data: labResults } = useQuery({
  queryKey: ['lab-results'],
  queryFn: () => supabase
    .from('patient__labresults__results')
    .select('*')
    .order('result_date', { ascending: false })
});
```

---

**INTEGRATION STATUS**: ✅ Ready for systematic implementation  
**SECURITY STATUS**: ⚠️ Requires role-based access configuration  
**DOCUMENTATION STATUS**: ✅ Complete architectural overview provided  

---

**CONCLUSION**: These 22 tables represent the remaining system infrastructure, development workflow, and patient support functionality. Implement security policies based on table type (patient-scoped vs. system-wide) and ensure proper API endpoint mapping for frontend integration.