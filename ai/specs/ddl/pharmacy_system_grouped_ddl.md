# Pharmacy System Tables Group - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for pharmacy ecosystem tables

---

## 📊 OVERVIEW

### Tables Covered (7 tables)
- Pharmacy directory and profiles
- Staff management
- Prescription workflow and quotes
- Assignment and queue management
- Status tracking and history

### Core Workflow
1. Patient submits prescription
2. System broadcasts to pharmacy network
3. Pharmacies provide quotes
4. Patient selects pharmacy
5. Fulfillment and status tracking

---

## 🏪 PHARMACY BUSINESS TABLES

### 1. pharmacies_directory (34 columns)
```sql
pharmacy_id | uuid NOT NULL (PRIMARY KEY)
name | character varying NOT NULL
chain_name | character varying NULL
branch_code | character varying NULL
address_line1 | character varying NOT NULL
address_line2 | character varying NULL
city | character varying NOT NULL
province | character varying NOT NULL
postal_code | character varying NULL
country | character varying NULL
latitude | numeric NULL
longitude | numeric NULL
phone | character varying NULL
email | character varying NULL
website_url | character varying NULL
operating_hours | jsonb NULL
services | jsonb NULL
features | jsonb NULL
payment_methods | jsonb NULL
is_24_hour | boolean NULL
has_delivery | boolean NULL
has_wheelchair_access | boolean NULL
has_parking | boolean NULL
rating | numeric NULL
review_count | integer NULL
is_active | boolean NULL
created_at | timestamp with time zone NULL
updated_at | timestamp with time zone NULL
delivery_available | boolean NULL
parking_available | boolean NULL
average_rating | numeric NULL
total_reviews | integer NULL
services_offered | ARRAY NULL
accepts_medical_aids | ARRAY NULL
```
**Purpose**: Master directory of all pharmacies with location, services, and capabilities

### 2. pharmacy_profiles (21 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
user_id | uuid NULL → auth.users(id)
pharmacy_name | text NOT NULL
pharmacy_id | text NOT NULL
address_line1 | text NULL
address_line2 | text NULL
city | text NULL
province | text NULL
postal_code | text NULL
phone | text NULL
email | text NULL
is_active | boolean NULL
created_at | timestamp with time zone NULL
registration_number | character varying NULL
owner_name | character varying NULL
country | character varying NULL
website | character varying NULL
latitude | numeric NULL
longitude | numeric NULL
operating_hours | jsonb NULL
updated_at | timestamp with time zone NULL
```
**Purpose**: Pharmacy business profiles for management and authentication

### 3. pharmacy_staff_profiles (19 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
user_id | uuid NOT NULL → auth.users(id)
pharmacy_id | uuid NULL → pharmacy_profiles(id)
first_name | character varying NOT NULL
last_name | character varying NOT NULL
initials | character varying NULL
gender | character varying NULL
id_number | character varying NULL **SENSITIVE**
date_of_birth | date NULL **SENSITIVE**
role | character varying NOT NULL
registration_number | character varying NULL **PROFESSIONAL**
qualification | character varying NULL
phone | character varying NULL
email | character varying NULL
is_active | boolean NULL
start_date | date NULL
end_date | date NULL
created_at | timestamp with time zone NOT NULL
updated_at | timestamp with time zone NOT NULL
```
**Purpose**: Pharmacy staff management with professional credentials

---

## 💰 QUOTE & PRICING TABLES

### 4. pharmacy_quotes (12 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
prescription_id | uuid NULL → patient__presc__prescriptions(prescription_id)
pharmacy_id | text NOT NULL → pharmacies_directory(pharmacy_id)
medications | jsonb NOT NULL
total_amount | numeric NULL
medical_aid_amount | numeric NULL
co_payment | numeric NULL
delivery_fee | numeric NULL
notes | text NULL
valid_until | timestamp with time zone NULL
status | text NULL
created_at | timestamp with time zone NULL
```
**Purpose**: Pharmacy quotes for prescriptions with pricing breakdown

---

## 🔄 WORKFLOW & QUEUE TABLES

### 5. pharmacy_assignment_requests (10 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
user_id | uuid NOT NULL → auth.users(id)
pharmacy_id | uuid NOT NULL → pharmacies_directory(pharmacy_id)
status | character varying NULL
requested_at | timestamp with time zone NULL
reviewed_at | timestamp with time zone NULL
reviewed_by | uuid NULL → auth.users(id)
review_notes | text NULL
created_at | timestamp with time zone NULL
updated_at | timestamp with time zone NULL
```
**Purpose**: Patient requests for pharmacy assignment/switching

### 6. prescription_pharmacy_queue (10 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
prescription_id | uuid NULL → patient__presc__prescriptions(prescription_id)
pharmacy_id | text NOT NULL → pharmacies_directory(pharmacy_id)
patient_profile_id | uuid NULL → patient__persinfo__profile(profile_id)
status | text NULL
notified_at | timestamp with time zone NULL
viewed_at | timestamp with time zone NULL
quoted_at | timestamp with time zone NULL
created_at | timestamp with time zone NULL
distance_km | numeric NULL
```
**Purpose**: Prescription fulfillment queue for pharmacy processing

### 7. prescription_flows (6 columns)
```sql
prescription_id | uuid NOT NULL (PRIMARY KEY) → patient__presc__prescriptions(prescription_id)
current_state | text NOT NULL
state_data | jsonb NULL
state_history | ARRAY NULL
created_at | timestamp with time zone NULL
updated_at | timestamp with time zone NULL
```
**Purpose**: State machine tracking for prescription workflow

---

## 📈 AUDIT & HISTORY TABLES

### 8. prescription_status_history (8 columns)
```sql
id | uuid NOT NULL (PRIMARY KEY)
prescription_id | uuid NOT NULL → patient__presc__prescriptions(prescription_id)
old_status | text NULL
new_status | text NOT NULL
changed_by | uuid NOT NULL → auth.users(id)
changed_at | timestamp with time zone NOT NULL
notes | text NULL
created_at | timestamp with time zone NOT NULL
```
**Purpose**: Complete audit trail of prescription status changes

---

## 🔍 BUSINESS LOGIC

### Pharmacy Discovery
```sql
-- Find nearby pharmacies
SELECT * FROM pharmacies_directory 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND is_active = true
ORDER BY calculate_distance(user_lat, user_lng, latitude, longitude);
```

### Quote Management
```sql
-- Active quotes for prescription
SELECT * FROM pharmacy_quotes 
WHERE prescription_id = ? 
  AND valid_until > NOW() 
  AND status = 'active';
```

### Workflow States
- **submitted** - Prescription submitted to system
- **broadcast** - Sent to pharmacy network
- **quoted** - Pharmacies provided quotes
- **assigned** - Patient selected pharmacy
- **dispensing** - Pharmacy preparing medication
- **ready** - Ready for collection/delivery
- **completed** - Fulfilled successfully

---

## 🎯 API INTEGRATION POINTS

### Pharmacy Discovery
```
/api/pharmacies/nearby?lat={lat}&lng={lng}&radius={km}
→ Find pharmacies within radius
```

### Quote Management
```
/api/prescriptions/{id}/quotes
→ Get all quotes for prescription

/api/pharmacies/{id}/quotes
→ Submit quote for prescription
```

### Workflow Management
```
/api/prescriptions/{id}/status
→ Update prescription status

/api/prescriptions/{id}/assign?pharmacy_id={id}
→ Assign prescription to pharmacy
```

---

## 🔐 SECURITY CONSIDERATIONS

### Data Classification
- **PUBLIC**: Pharmacy directory information (name, address, hours)
- **BUSINESS**: Quotes, pricing, payment information
- **SENSITIVE**: Staff personal information, professional numbers
- **AUDIT**: All status changes and workflow history

### Access Controls
- **Patient**: Read pharmacy directory, view their quotes
- **Pharmacy Staff**: Manage their pharmacy's quotes and queue
- **System Admin**: Full access for management
- **API**: Automated workflow processing

### Privacy & Compliance
- Staff `id_number` and `date_of_birth` are PII
- Professional `registration_number` validation required
- Quote pricing subject to business confidentiality
- Audit trails for compliance and disputes

---

## 📊 PERFORMANCE CONSIDERATIONS

### Geographic Indexing
- Spatial indexes on pharmacy `latitude`/`longitude`
- Distance calculation optimization
- Location-based query performance

### Queue Management
- Index on `prescription_id` and `status` for queue processing
- Time-based indexes for SLA monitoring
- Efficient state machine transitions

### Audit Optimization
- Partition `prescription_status_history` by date
- Archive old workflow data
- Optimize status change queries

---

## 🚨 CRITICAL NOTES

1. **COMPLEX ECOSYSTEM** - Multiple stakeholders and workflows
2. **REAL-TIME PROCESSING** - Quote management and queue processing
3. **GEOGRAPHIC SERVICES** - Distance calculations and delivery zones
4. **PROFESSIONAL VALIDATION** - Staff credentials and pharmacy licensing
5. **AUDIT COMPLIANCE** - Complete status change tracking
6. **FINANCIAL DATA** - Pricing, medical aid, and payment processing

---

**CONCLUSION**: Comprehensive pharmacy ecosystem enabling prescription fulfillment through automated discovery, competitive quoting, efficient queue management, and complete audit tracking for optimal patient care and business operations.