# Table: patient__persinfo__address - DDL Documentation

**Date Generated**: 25/08/2025  
**Source**: Supabase Database - LIVE DDL  
**Purpose**: EXACT column names and data types for patient address information table

---

## 🎯 TABLE STRUCTURE

### Table Name
```sql
patient__persinfo__address
```

### Primary Key
```sql
address_id (UUID, NOT NULL, DEFAULT: gen_random_uuid())
```

### Foreign Keys
```sql
user_id → auth.users(id) (UUID, NOT NULL)
```

---

## 📋 EXACT COLUMN DEFINITIONS

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| `address_id` | `uuid` | **NO** | `gen_random_uuid()` | **PRIMARY KEY** |
| `user_id` | `uuid` | **NO** | `null` | **FOREIGN KEY** → auth.users(id) |
| `home_city` | `text` | YES | `null` | Home address city |
| `home_province` | `text` | YES | `null` | Home address province/state |
| `home_postal_code` | `text` | YES | `null` | Home address postal code |
| `postal_same_as_home` | `text` | YES | `true` | Flag if postal same as home |
| `postal_city` | `text` | YES | `null` | Postal address city |
| `postal_province` | `text` | YES | `null` | Postal address province/state |
| `postal_postal_code` | `text` | YES | `null` | Postal address postal code |
| `created_at` | `timestamp with time zone` | YES | `now()` | Record creation timestamp |
| `updated_at` | `timestamp with time zone` | YES | `now()` | Last update timestamp |
| `home_street_no` | `text` | YES | `null` | Home street number |
| `home_street_name` | `text` | YES | `null` | Home street name |
| `home_suburb` | `text` | YES | `null` | Home suburb/neighborhood |
| `home_country` | `text` | YES | `null` | Home country |
| `postal_street_no` | `text` | YES | `null` | Postal street number |
| `postal_street_name` | `text` | YES | `null` | Postal street name |
| `postal_suburb` | `text` | YES | `null` | Postal suburb/neighborhood |
| `postal_country` | `text` | YES | `null` | Postal country |
| `live_in_complex` | `boolean` | YES | `false` | Living in complex/estate flag |
| `complex_no` | `text` | YES | `null` | Complex/unit number |
| `complex_name` | `text` | YES | `null` | Complex/estate name |
| `is_active` | `boolean` | YES | `true` | Soft delete flag |
| `delivery_same_as_home` | `boolean` | YES | `true` | Flag if delivery same as home |
| `delivery_street_no` | `text` | YES | `null` | Delivery street number |
| `delivery_street_name` | `text` | YES | `null` | Delivery street name |
| `delivery_suburb` | `text` | YES | `null` | Delivery suburb/neighborhood |
| `delivery_city` | `text` | YES | `null` | Delivery address city |
| `delivery_province` | `text` | YES | `null` | Delivery address province/state |
| `delivery_postal_code` | `text` | YES | `null` | Delivery address postal code |
| `delivery_country` | `text` | YES | `null` | Delivery country |
| `delivery_complex_no` | `text` | YES | `null` | Delivery complex/unit number |
| `delivery_complex_name` | `text` | YES | `null` | Delivery complex/estate name |
| `home_full_address` | `text` | YES | `null` | **COMPUTED** Full home address |
| `postal_full_address` | `text` | YES | `null` | **COMPUTED** Full postal address |
| `delivery_full_address` | `text` | YES | `null` | **COMPUTED** Full delivery address |
| `home_address1` | `text` | YES | `null` | Home address line 1 |
| `home_address2` | `text` | YES | `null` | Home address line 2 |
| `postal_address1` | `text` | YES | `null` | Postal address line 1 |
| `postal_address2` | `text` | YES | `null` | Postal address line 2 |
| `delivery_address1` | `text` | YES | `null` | Delivery address line 1 |
| `delivery_address2` | `text` | YES | `null` | Delivery address line 2 |

---

## 🔍 VIEW DEFINITION

### View Name
```sql
v_patient__persinfo__address
```

### View Purpose
- User-filtered reads (WHERE user_id = auth.uid())
- RLS security boundary
- API read operations use this view ONLY
- Handles address privacy and data masking

---

## 🔐 CONSTRAINTS & INDEXES

### Expected Constraints (business logic)
- Unique constraint on (user_id) - one address record per user
- `postal_same_as_home` CHECK: IN ('true', 'false') or boolean conversion
- `delivery_same_as_home` boolean constraint
- Address validation for required fields when not using defaults

---

## 🎯 FILTER CONDITIONS

### For User's Own Address
```sql
WHERE user_id = auth.uid()
```

### For Complete Address Check
```sql
WHERE user_id = auth.uid() 
  AND (home_city IS NOT NULL OR postal_city IS NOT NULL OR delivery_city IS NOT NULL)
```

---

## ✅ VALIDATION RULES

### Required Fields
- `address_id` (auto-generated)
- `user_id` (from auth.uid())

### Address Types
1. **Home Address**: Primary residence
2. **Postal Address**: Mail delivery (can be same as home)
3. **Delivery Address**: Package/prescription delivery (can be same as home)

### Sensitive Data Fields
- All address components contain **SENSITIVE PII**
- Must be encrypted at rest for privacy compliance
- Location data can be used for proximity services

### Address Completion Logic
- When `postal_same_as_home = true`: Use home address for postal
- When `delivery_same_as_home = true`: Use home address for delivery
- Full address fields are computed from components

---

## 🚨 CRITICAL NOTES

1. **The table name is**: `patient__persinfo__address`
2. **The view name is**: `v_patient__persinfo__address`
3. **CONTAINS SENSITIVE LOCATION DATA** - Must be encrypted at rest
4. **Three address types** supported: Home, Postal, Delivery
5. **Complex/Estate support** for South African addressing
6. **Address computation** from components to full address strings
7. **GDPR/POPIA compliance required** for location data

---

## 🔧 API INTEGRATION POINTS

### GET User Address
```
/api/patient/personal-info/address
→ SELECT * FROM v_patient__persinfo__address WHERE user_id = auth.uid()
```

### UPDATE Address
```
/api/patient/personal-info/address
→ UPDATE patient__persinfo__address SET ... WHERE user_id = auth.uid()
```

### Address Validation
```
→ Validate postal codes, provinces, and address components
```

---

## 🛡️ SECURITY & PRIVACY

### Data Classification
- **INTERNAL**: Country, province/state information
- **CONFIDENTIAL**: All street addresses, postal codes, complex details
- **RESTRICTED**: Location-based proximity data

### Access Controls
- **Owner**: Full read/write access
- **Healthcare Provider**: Limited access for delivery purposes
- **System**: No direct access - use service accounts

### Address Privacy
- Addresses used for pharmacy/service proximity
- Location data never shared with third parties
- Complex/estate information for accurate delivery

---

**CONCLUSION**: Comprehensive address management table supporting South African addressing standards with multiple address types, privacy controls, and delivery optimization features.