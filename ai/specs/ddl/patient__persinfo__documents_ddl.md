# Table: patient__persinfo__documents - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient document storage table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__documents
```

### Primary Key
```sql
document_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `document_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `file_name` | `text` | YES | `null` | Original filename of uploaded document |
| `file_type` | `text` | YES | `null` | MIME type/file extension |
| `file_url` | `text` | YES | `null` | **SENSITIVE** Storage URL/path |
| `file_size` | `bigint` | YES | `null` | File size in bytes |
| `description` | `text` | YES | `null` | User-provided description |
| `category` | `text` | YES | `null` | Document category/classification |
| `uploaded_at` | `timestamp with time zone` | YES | `now()` | Upload timestamp |
| `is_confidential` | `boolean` | YES | `false` | Confidential document flag |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__documents
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- **MASKS FILE URLS** for non-owner access
- Document metadata without direct file access

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- `file_size` CHECK: > 0 AND <= 50MB (52428800 bytes)
- `category` CHECK: IN ('id-document', 'medical-record', 'insurance', 'prescription', 'lab-result', 'imaging', 'consent-form', 'other')
- `file_type` CHECK: Allowed MIME types for security
- Index on (user_id, category) for efficient category queries

---

## 🎯 FILTER CONDITIONS

### For User's Own Documents
```sql
WHERE user_id = auth.uid()
```

### For Active Documents Only
```sql
WHERE user_id = auth.uid() 
  AND is_active = true
```

### For Document Category
```sql
WHERE user_id = auth.uid() 
  AND category = 'medical-record'
  AND is_active = true
```

### For Confidential Documents
```sql
WHERE user_id = auth.uid() 
  AND is_confidential = true
  AND is_active = true
```

---

## ✅ VALIDATION RULES

### Required Fields
- `document_id` (auto-generated)
- `user_id` (from auth.uid())

### File Security
- **Maximum file size**: 50MB per document
- **Allowed file types**: PDF, JPG, PNG, DOCX, TXT
- **Virus scanning** required on upload
- **Encrypted storage** for all file contents

### Document Categories
1. **id-document**: ID cards, passports, driver's licenses
2. **medical-record**: Medical reports, doctor notes
3. **insurance**: Medical aid cards, insurance documents
4. **prescription**: Prescription scripts, medication lists
5. **lab-result**: Blood tests, pathology reports
6. **imaging**: X-rays, MRI, CT scans, ultrasounds
7. **consent-form**: Medical consent, privacy agreements
8. **other**: Miscellaneous healthcare documents

### Sensitive Data Fields
- `file_url` - Storage path/URL (encrypt at rest)
- `file_name` - May contain sensitive info (encrypt metadata)
- All uploaded documents are considered **HIGHLY SENSITIVE PHI**

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__documents`
2. **The view name is**: `v_patient__persinfo__documents`
3. **CONTAINS HIGHLY SENSITIVE PHI DOCUMENTS** - Must be encrypted at rest
4. **File storage security** - URLs must be time-limited and encrypted
5. **Document retention** policies must be implemented
6. **Audit logging** required for all document access
7. **GDPR/POPIA compliance** with right to erasure
8. **HIPAA compliance** for medical documents

---

## 🔧 API INTEGRATION POINTS

### GET User Documents List
```
/api/patient/personal-info/documents
→ SELECT document_id, file_name, description, category, uploaded_at 
  FROM v_patient__persinfo__documents WHERE user_id = auth.uid()
```

### UPLOAD New Document
```
/api/patient/personal-info/documents/upload
→ INSERT INTO patient__persinfo__documents + File storage
```

### GET Document Download URL
```
/api/patient/personal-info/documents/{document_id}/download
→ Generate time-limited signed URL for file access
```

### DELETE Document
```
/api/patient/personal-info/documents/{document_id}
→ UPDATE patient__persinfo__documents SET is_active = false + File cleanup
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **PUBLIC**: Document categories, file types
- **INTERNAL**: File names, descriptions, upload dates
- **CONFIDENTIAL**: All document contents, file URLs
- **RESTRICTED**: Medical records, ID documents, insurance documents

### Access Controls
- **Owner**: Full read/write/delete access
- **Healthcare Provider**: Read access to relevant medical documents only
- **System**: No direct file access - use service accounts with audit trails

### File Storage Security
- **Encrypted at rest**: All files encrypted using AES-256
- **Time-limited URLs**: Download links expire after 15 minutes
- **Access logging**: All document access logged with user, timestamp, IP
- **Virus scanning**: All uploads scanned before storage
- **Backup encryption**: Backup files also encrypted

### Compliance Requirements
- **HIPAA**: Healthcare document protection (US)
- **POPIA**: Personal information protection (South Africa)
- **GDPR**: EU data protection compliance
- **Medical device regulations**: For medical imaging documents
- **Retention policies**: Automatic deletion after legal retention periods

### Document Security Features
- **Digital signatures**: Support for signed documents
- **Version control**: Track document updates and changes
- **Watermarking**: Add patient/timestamp watermarks
- **OCR text extraction**: For searchable document contents (encrypted)

---

## 🔄 DOCUMENT LIFECYCLE

### Upload Process
1. File validation (type, size, virus scan)
2. Encryption and secure storage
3. Metadata extraction and storage
4. Audit log entry creation

### Access Process
1. User authentication and authorization
2. Generate time-limited signed URL
3. Log access attempt with full audit trail
4. Serve encrypted file with decryption

### Deletion Process
1. Soft delete (set is_active = false)
2. Schedule physical file deletion (30-day grace period)
3. Audit log entry for deletion
4. Compliance verification for retention policies

---

**CONCLUSION**: Secure document storage table for sensitive patient healthcare documents with comprehensive encryption, access controls, audit logging, and compliance features for medical data protection.