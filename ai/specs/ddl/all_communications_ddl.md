# All Communications Table - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: Unified communications aggregation table for all patient communications

---

## 📊 TABLE OVERVIEW

### all_communications
**Purpose**: Centralized view of all patient communications (alerts, messages, notifications)  
**Type**: Aggregation/View Table  
**Records**: All communication types from various sources  
**Security**: User-scoped with RLS enforcement

---

## 📋 COMPLETE COLUMN STRUCTURE (9 columns)

```sql
CREATE TABLE all_communications (
    id                TEXT NULL,
    type              TEXT NULL,
    title             TEXT NULL, 
    content           TEXT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NULL,
    is_read           BOOLEAN NULL,
    user_id           UUID NULL,
    sender            TEXT NULL,
    subtype           TEXT NULL
);
```

---

## 📝 COLUMN DEFINITIONS

### 🔑 **IDENTIFIERS**
- **`id`** (TEXT, NULL)  
  - Primary identifier from source table
  - May vary by communication type
  - Not guaranteed unique across types

- **`user_id`** (UUID, NULL)  
  - Links to auth.users(id)  
  - Patient/user this communication belongs to
  - **Critical for RLS filtering**

### 📂 **CLASSIFICATION FIELDS**
- **`type`** (TEXT, NULL)  
  - Communication type (alert, message, notification)
  - Maps to source table (alerts, messages, notifications)
  - Used for filtering and routing

- **`subtype`** (TEXT, NULL)  
  - Subclassification within type
  - Alert types: medication, appointment, lab_result
  - Message types: doctor, pharmacy, system
  - Notification types: push, email, sms

### 📄 **CONTENT FIELDS**  
- **`title`** (TEXT, NULL)  
  - Communication headline/subject
  - Brief summary for listing views
  - May be auto-generated for some types

- **`content`** (TEXT, NULL)  
  - Full communication content/body
  - HTML or plain text format
  - May include structured data (JSON)

- **`sender`** (TEXT, NULL)  
  - Communication originator
  - System, doctor name, pharmacy name
  - May be display name or system identifier

### ⏰ **METADATA FIELDS**
- **`created_at`** (TIMESTAMP WITH TIME ZONE, NULL)  
  - When communication was created
  - From original source table
  - Used for chronological sorting

- **`is_read`** (BOOLEAN, NULL)  
  - Read status for user interface
  - NULL = unread, TRUE = read
  - Updated via user interaction

---

## 🔗 RELATIONSHIPS

### **Source Tables** (Union of all communication tables)
- **patient__comm__alerts** → type = 'alert'
- **patient__comm__messages** → type = 'message'  
- **patient__comm__notifications** → type = 'notification'

### **Foreign Key References**
- **user_id** → auth.users(id) (Patient ownership)
- **Implicit references** to source table primary keys via id field

---

## 🔒 SECURITY IMPLEMENTATION

### **Row Level Security (RLS)**
```sql
-- Enable RLS on table
ALTER TABLE all_communications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own communications
CREATE POLICY "Users can view their own communications" 
  ON all_communications FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Users can update read status on their communications
CREATE POLICY "Users can update read status" 
  ON all_communications FOR UPDATE 
  USING (user_id = auth.uid());
```

### **View-Based Access Pattern**
```sql
-- Secure view for API access
CREATE VIEW v_all_communications AS
SELECT id, type, title, content, created_at, is_read, sender, subtype
FROM all_communications
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

---

## 🎯 API INTEGRATION

### **REST Endpoint Pattern**
```
GET /api/patient/communications/all
→ SELECT * FROM v_all_communications

GET /api/patient/communications/all?type=alert
→ SELECT * FROM v_all_communications WHERE type = 'alert'

PUT /api/patient/communications/all/:id/read
→ UPDATE all_communications SET is_read = true WHERE id = :id AND user_id = auth.uid()
```

### **Common Query Patterns**
```sql
-- Unread communications count
SELECT COUNT(*) FROM v_all_communications WHERE is_read IS NULL OR is_read = false;

-- Recent communications (last 7 days)
SELECT * FROM v_all_communications 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Communications by type
SELECT type, COUNT(*) FROM v_all_communications GROUP BY type;
```

---

## 📱 FRONTEND INTEGRATION

### **Communication Feed Component**
```typescript
interface Communication {
  id: string;
  type: 'alert' | 'message' | 'notification';
  subtype?: string;
  title: string;
  content: string;
  sender?: string;
  created_at: string;
  is_read: boolean;
}

// Hook for communications
const { data: communications } = useQuery({
  queryKey: ['communications'],
  queryFn: () => supabase.from('v_all_communications').select('*')
});
```

### **Notification Badge Logic**
```typescript
const unreadCount = communications?.filter(c => !c.is_read).length || 0;
```

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

### **Data Aggregation Strategy**
1. **Union Query**: This table aggregates data from multiple source tables
2. **Real-time Updates**: Changes in source tables should reflect here immediately
3. **Type Consistency**: Ensure consistent type/subtype values across sources

### **Performance Considerations**
4. **Indexing**: Index on (user_id, created_at) for efficient queries
5. **Pagination**: Implement cursor-based pagination for large result sets
6. **Caching**: Consider caching unread counts at user level

### **Data Integrity**
7. **Source Sync**: Maintain consistency with source communication tables
8. **Orphan Prevention**: Handle deletions from source tables gracefully
9. **Type Validation**: Validate type/subtype values against allowed lists

---

## 🔧 MAINTENANCE QUERIES

### **Health Check**
```sql
-- Verify all communications have valid user_id
SELECT COUNT(*) FROM all_communications WHERE user_id IS NULL;

-- Check type distribution
SELECT type, COUNT(*) FROM all_communications GROUP BY type;
```

### **Data Cleanup**
```sql
-- Mark old communications as read (optional)
UPDATE all_communications 
SET is_read = true 
WHERE created_at < NOW() - INTERVAL '90 days' AND is_read IS NULL;
```

---

**INTEGRATION STATUS**: ✅ Ready for implementation  
**SECURITY STATUS**: ✅ RLS required and implemented  
**API STATUS**: ✅ RESTful patterns defined  
**VIEW STATUS**: ✅ Secure view pattern established

---

**CRITICAL**: This table serves as the unified communications hub for all patient interactions. Proper RLS implementation and real-time synchronization with source tables are essential for system functionality.