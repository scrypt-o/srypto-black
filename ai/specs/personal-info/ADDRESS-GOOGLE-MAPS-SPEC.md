# Address Management with Google Maps Integration - Specification

**Date**: 2025-09-01  
**Status**: Specification Only (Implementation Pending)  
**Purpose**: Document proper address functionality with Google Places autocomplete

---

## 🎯 **FUNCTIONALITY OVERVIEW (From Legacy System)**

### **Smart Address Forms with Google Integration**
Based on legacy implementation analysis, addresses should include:

#### **Google Places Autocomplete**
- **Address suggestions**: Real-time autocomplete while user types
- **Address validation**: Verify addresses using Google Places API  
- **Auto-population**: Fill multiple fields from single autocomplete selection
- **South African support**: Proper suburb, city, province recognition

#### **Dynamic Form Logic**
```typescript
// Conditional field display based on user selections
live_in_complex === 'yes' → Show complex_no, complex_name fields
postal_same_as_home === 'no' → Show separate postal address fields
delivery_same_as_home === 'no' → Show separate delivery address fields
```

#### **Address Types Management**
- **Home Address**: Primary residence (always required)
- **Postal Address**: Mailing address (optional, can default to home)
- **Delivery Address**: Package delivery (optional, can default to home)

---

## 📋 **TECHNICAL SPECIFICATIONS**

### **Google Places API Integration**
```typescript
// Address autocomplete component
interface AddressAutocompleteProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
  placeholder: string
  defaultValue?: string
  className?: string
}

// Place selection handler
const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
  const components = place.address_components
  
  // Parse Google address components to form fields
  const addressData = {
    street_no: getComponent(components, 'street_number'),
    street_name: getComponent(components, 'route'),
    suburb: getComponent(components, 'sublocality_level_1'),
    city: getComponent(components, 'locality'),
    province: getComponent(components, 'administrative_area_level_1'),
    postal_code: getComponent(components, 'postal_code'),
    country: getComponent(components, 'country')
  }
  
  // Auto-populate form fields
  updateFormFields(addressData)
}
```

### **Dynamic Field Configuration**
```typescript
// Form field definitions with conditional logic
export function getAddressFields(formData?: Partial<PatientAddress>): FieldConfig[] {
  const liveInComplex = formData?.live_in_complex === 'yes'
  const postalDifferent = formData?.postal_same_as_home === 'no'
  const deliveryDifferent = formData?.delivery_same_as_home === 'no'
  
  return [
    // Home Address Section (always visible)
    { key: 'home_street_autocomplete', type: 'google_autocomplete', label: 'Home Address' },
    { key: 'home_street_no', type: 'text', label: 'Street Number' },
    { key: 'home_street_name', type: 'text', label: 'Street Name' },
    
    // Complex fields (conditional)
    { 
      key: 'live_in_complex', 
      type: 'select', 
      label: 'Live in Complex?',
      options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
    { key: 'complex_no', type: 'text', label: 'Unit Number', required: liveInComplex },
    { key: 'complex_name', type: 'text', label: 'Complex Name', required: liveInComplex },
    
    // Postal address toggle
    {
      key: 'postal_same_as_home',
      type: 'select',
      label: 'Postal Same as Home?', 
      options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    },
    
    // Postal fields (conditional)
    ...(postalDifferent ? [
      { key: 'postal_street_autocomplete', type: 'google_autocomplete', label: 'Postal Address' },
      { key: 'postal_street_no', type: 'text', label: 'Postal Street Number' },
      // ... other postal fields
    ] : []),
    
    // Delivery fields (conditional)
    ...(deliveryDifferent ? [
      { key: 'delivery_street_autocomplete', type: 'google_autocomplete', label: 'Delivery Address' },
      // ... other delivery fields  
    ] : [])
  ]
}
```

### **Address Component Architecture**
```typescript
// Enhanced address form with Google Maps
components/features/addresses/
├── AddressAutocompleteInput.tsx    # Google Places autocomplete input
├── DynamicAddressForm.tsx          # Form with conditional fields
├── AddressMapPreview.tsx           # Map showing selected address
└── AddressValidation.tsx           # Google validation service

// Address management pages  
app/patient/persinfo/addresses/
├── page.tsx                        # Address tiles hub
├── home/page.tsx                   # Home address form with autocomplete
├── postal/page.tsx                 # Postal address form with autocomplete  
└── delivery/page.tsx               # Delivery address form with autocomplete
```

---

## 🚀 **IMPLEMENTATION REQUIREMENTS**

### **Google Maps Setup**
```typescript
// Required environment variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Already configured
GOOGLE_PLACES_API_ENABLED=true     # Enable Places API
```

### **Component Enhancement Plan**
1. **AddressAutocompleteInput**: Google Places autocomplete component
2. **Dynamic field logic**: Show/hide fields based on selections  
3. **Address validation**: Verify addresses using Google services
4. **Map preview**: Show selected address on map for confirmation
5. **Smart defaults**: Auto-populate fields from Google selection

### **User Experience Improvements**
- **Faster address entry**: Autocomplete reduces typing
- **Address accuracy**: Google validation ensures correct addresses
- **Visual confirmation**: Map preview shows exact location
- **Smart forms**: Fields appear/disappear based on user choices
- **Mobile optimization**: Touch-friendly autocomplete interface

---

## 🔒 **PRIVACY & COMPLIANCE**

### **Data Protection**
- **Address autocomplete**: Google API calls from client-side only
- **No data sharing**: Addresses not sent to Google after selection
- **User control**: Manual override of autocomplete suggestions
- **GDPR compliance**: User consent for location-based features

### **South African Addressing**
- **Local standards**: Support for suburb, province, postal code formats
- **Complex addressing**: Unit numbers and complex names for estates
- **Delivery optimization**: Accurate addresses for pharmacy deliveries

---

## ⚠️ **IMPLEMENTATION NOTES**

### **Current State**
**Working**: Basic address forms with manual entry
**Missing**: Google autocomplete, dynamic fields, map integration, address validation

### **Enhancement Plan**
**Phase 1**: Add Google Places autocomplete to existing forms
**Phase 2**: Implement dynamic field logic and smart defaults
**Phase 3**: Add map preview and address validation
**Phase 4**: Integrate with pharmacy delivery distance calculations

### **Integration Points**
- **Location services**: Address coordinates for pharmacy proximity  
- **Delivery management**: Accurate addresses for order fulfillment
- **User experience**: Faster, more accurate address entry

**This specification documents the complete address functionality** based on legacy system analysis, ready for implementation when address enhancement is prioritized.

---

**SPECIFICATION COMPLETE - NO CODE CONTAMINATION**
This document only specifies functionality, no implementation until approved.