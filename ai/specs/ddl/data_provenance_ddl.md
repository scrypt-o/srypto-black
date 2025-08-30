# Data Provenance Table - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: Track data source lineage and import history for all patient data

---

## 📊 TABLE OVERVIEW

### data_provenance
**Purpose**: Track origin, source, and import details for all patient data records  
**Type**: Audit/Tracking Table  
**Records**: One entry per imported/created data record  
**Security**: User-scoped with RLS enforcement  
**Criticality**: HIGH - Essential for data integrity and compliance

---

## 📋 COMPLETE COLUMN STRUCTURE (10 columns)

```sql
CREATE TABLE data_provenance (
    provenance_id     UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,
    table_name        TEXT NULL,
    record_id         UUID NULL,
    source_type       TEXT NULL,
    source_details    TEXT NULL,
    imported_at       TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    created_at        TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
    is_active         BOOLEAN NULL DEFAULT true
);
```

---

## 📝 COLUMN DEFINITIONS

### 🔑 **IDENTIFIERS**
- **`provenance_id`** (UUID, NOT NULL, PRIMARY KEY)  
  - Auto-generated UUID for each provenance record
  - Default: gen_random_uuid()
  - Unique identifier for this lineage entry

- **`user_id`** (UUID, NOT NULL)  
  - Links to auth.users(id)  
  - Patient/user this data belongs to
  - **Critical for RLS filtering**

- **`record_id`** (UUID, NULL)  
  - Primary key of the actual data record
  - Links to the record this provenance tracks
  - NULL for bulk operations or deleted records

### 📂 **SOURCE TRACKING**
- **`table_name`** (TEXT, NULL)  
  - Name of table containing the tracked record
  - Examples: 'patient__medhist__allergies', 'patient__persinfo__profile'
  - Used for cross-table queries and reporting

- **`source_type`** (TEXT, NULL)  
  - Type/method of data acquisition
  - Values: 'manual_entry', 'import_csv', 'api_sync', 'ocr_extraction', 'migration'
  - Critical for understanding data reliability

- **`source_details`** (TEXT, NULL)  
  - Additional details about data source
  - JSON format for structured information
  - Examples: file names, API endpoints, user actions

### ⏰ **TIMESTAMP TRACKING**
- **`imported_at`** (TIMESTAMP WITH TIME ZONE, NULL)  
  - When the data was originally imported/created
  - Default: now()
  - Different from created_at for historical imports

- **`created_at`** (TIMESTAMP WITH TIME ZONE, NULL)  
  - When this provenance record was created
  - Default: now()
  - Audit trail for provenance tracking itself

- **`updated_at`** (TIMESTAMP WITH TIME ZONE, NULL)  
  - When this provenance record was last modified
  - Default: now()
  - Updated via triggers on modifications

### 🔄 **STATUS TRACKING**
- **`is_active`** (BOOLEAN, NULL)  
  - Active status of this provenance record
  - Default: true
  - FALSE for soft-deleted or invalidated lineage

---

## 🔗 RELATIONSHIPS

### **Foreign Key References**
- **user_id** → auth.users(id) (Patient ownership)
- **record_id** → [dynamic] (Links to various patient table records)
- **table_name** → Describes which table contains the record

### **Source Tables** (All patient tables)
```sql
-- Examples of linked records
patient__medhist__allergies(allergy_id) ← record_id
patient__persinfo__profile(profile_id) ← record_id  
patient__presc__prescriptions(prescription_id) ← record_id
```

---

## 🔒 SECURITY IMPLEMENTATION

### **Row Level Security (RLS)**
```sql
-- Enable RLS on table
ALTER TABLE data_provenance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see provenance for their own data
CREATE POLICY "Users can view their own data provenance" 
  ON data_provenance FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: System can insert provenance records
CREATE POLICY "System can track data provenance" 
  ON data_provenance FOR INSERT 
  WITH CHECK (user_id = auth.uid());
```

### **View-Based Access Pattern**
```sql
-- Secure view for API access
CREATE VIEW v_data_provenance AS
SELECT 
    provenance_id,
    table_name,
    record_id,
    source_type,
    source_details,
    imported_at,
    created_at,
    is_active
FROM data_provenance
WHERE user_id = auth.uid() AND is_active = true
ORDER BY created_at DESC;
```

---

## 🎯 API INTEGRATION

### **REST Endpoint Pattern**
```
GET /api/patient/data/provenance
→ SELECT * FROM v_data_provenance

GET /api/patient/data/provenance/:table_name
→ SELECT * FROM v_data_provenance WHERE table_name = :table_name

GET /api/patient/data/provenance/record/:record_id
→ SELECT * FROM v_data_provenance WHERE record_id = :record_id
```

### **Common Query Patterns**
```sql
-- Data sources for a specific table
SELECT source_type, COUNT(*) 
FROM v_data_provenance 
WHERE table_name = 'patient__medhist__allergies' 
GROUP BY source_type;

-- Recent imports (last 30 days)
SELECT * FROM v_data_provenance 
WHERE imported_at >= NOW() - INTERVAL '30 days'
ORDER BY imported_at DESC;

-- Find provenance for specific record
SELECT * FROM v_data_provenance 
WHERE record_id = 'uuid-here';
```

---

## 📱 FRONTEND INTEGRATION

### **Data Lineage Component**
```typescript
interface DataProvenance {
  provenance_id: string;
  table_name: string;
  record_id: string;
  source_type: 'manual_entry' | 'import_csv' | 'api_sync' | 'ocr_extraction' | 'migration';
  source_details?: string;
  imported_at: string;
  created_at: string;
}

// Hook for data provenance
const { data: provenance } = useQuery({
  queryKey: ['data-provenance', recordId],
  queryFn: () => supabase
    .from('v_data_provenance')
    .select('*')
    .eq('record_id', recordId)
    .single()
});
```

### **Source Type Display**
```typescript
const sourceTypeLabels = {
  'manual_entry': 'Manually Entered',
  'import_csv': 'CSV Import',
  'api_sync': 'API Synchronization', 
  'ocr_extraction': 'OCR Extraction',
  'migration': 'Data Migration'
};
```

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

### **Automatic Tracking Strategy**
1. **Trigger-Based**: Create triggers on all patient tables to auto-insert provenance
2. **Source Context**: Always capture source context during data operations
3. **Bulk Operations**: Handle mass imports with appropriate source_details

### **Data Compliance Requirements**
4. **GDPR Article 5**: Data provenance supports "accountability" principle
5. **Medical Records**: Essential for medical data audit trails
6. **Data Retention**: Provenance records may have longer retention than source data

### **Performance Considerations**
7. **Indexing**: Index on (user_id, table_name, record_id, imported_at)
8. **Partitioning**: Consider partitioning by month for large datasets
9. **Cleanup**: Regular cleanup of orphaned provenance records

---

## 🔧 MAINTENANCE QUERIES

### **Health Check Queries**
```sql
-- Verify all records have valid user_id
SELECT COUNT(*) FROM data_provenance WHERE user_id IS NULL;

-- Find orphaned provenance records (records no longer exist)
SELECT p.* FROM data_provenance p
LEFT JOIN patient__medhist__allergies a ON p.record_id = a.allergy_id 
WHERE p.table_name = 'patient__medhist__allergies' AND a.allergy_id IS NULL;

-- Source type distribution
SELECT source_type, COUNT(*) FROM data_provenance GROUP BY source_type;
```

### **Data Quality Queries**
```sql
-- Find records without provenance tracking
SELECT 'patient__medhist__allergies' as table_name, COUNT(*) as untracked_count
FROM patient__medhist__allergies a
LEFT JOIN data_provenance p ON p.record_id = a.allergy_id
WHERE p.provenance_id IS NULL;
```

### **Cleanup Operations**
```sql
-- Soft delete orphaned provenance records
UPDATE data_provenance SET is_active = false 
WHERE record_id NOT IN (
  SELECT allergy_id FROM patient__medhist__allergies 
  WHERE allergy_id IS NOT NULL
) AND table_name = 'patient__medhist__allergies';
```

---

## 🔄 AUTOMATED TRIGGERS

### **Insert Trigger Template**
```sql
-- Example trigger for automatic provenance tracking
CREATE OR REPLACE FUNCTION track_data_provenance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO data_provenance (
    user_id,
    table_name,
    record_id,
    source_type,
    source_details,
    imported_at
  ) VALUES (
    NEW.user_id,
    TG_TABLE_NAME,
    NEW.allergy_id, -- Replace with actual primary key
    COALESCE(current_setting('app.source_type', true), 'manual_entry'),
    current_setting('app.source_details', true),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to patient tables
CREATE TRIGGER track_allergy_provenance
  AFTER INSERT ON patient__medhist__allergies
  FOR EACH ROW EXECUTE FUNCTION track_data_provenance();
```

---

## 📊 REPORTING CAPABILITIES

### **Data Quality Reports**
```sql
-- Data source reliability by table
SELECT 
  table_name,
  source_type,
  COUNT(*) as record_count,
  MIN(imported_at) as earliest_import,
  MAX(imported_at) as latest_import
FROM data_provenance 
WHERE is_active = true
GROUP BY table_name, source_type
ORDER BY table_name, record_count DESC;
```

### **Import History Dashboard**
```sql
-- Monthly import statistics
SELECT 
  DATE_TRUNC('month', imported_at) as import_month,
  source_type,
  COUNT(*) as records_imported
FROM data_provenance 
WHERE imported_at >= NOW() - INTERVAL '12 months'
GROUP BY import_month, source_type
ORDER BY import_month DESC, records_imported DESC;
```

---

**INTEGRATION STATUS**: ✅ Ready for implementation  
**SECURITY STATUS**: ✅ RLS required and implemented  
**COMPLIANCE STATUS**: ✅ GDPR Article 5 support  
**AUTOMATION STATUS**: ⚠️ Requires trigger implementation  

---

**CRITICAL**: This table is fundamental for data governance, compliance, and quality assurance. Implement automatic tracking triggers for all patient data tables to ensure complete data lineage coverage.