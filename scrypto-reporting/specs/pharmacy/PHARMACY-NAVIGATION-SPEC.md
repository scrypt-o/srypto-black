# Pharmacy Navigation Specification

**Date**: 2025-08-31  
**Status**: MVP Implementation  
**Purpose**: Define pharmacy sidebar navigation and homepage structure

---

## Overview

The pharmacy navigation system is a **direct clone** of the patient navigation system, following identical patterns, layouts, and architectural standards. The only differences are the specific navigation items and context switching.

## Architecture Alignment

### Foundation
- **Exact same structure** as `PatientSidebar` component
- **Same styling patterns** - blue theme, hover states, active states
- **Same responsive behavior** - mobile/desktop handling
- **Same component hierarchy** - follows established Scrypto patterns

### Navigation Config
- **Clone**: `config/patientNav.ts` → `config/pharmacyNav.ts`
- **Same structure**: Groups, items, icons, hrefs, descriptions
- **Replace content**: Remove patient items, add pharmacy items

## Pharmacy Navigation Items

Based on pharmacy portal specification, organize by functional groups:

### Core Sections
```typescript
// config/pharmacyNav.ts structure
{
  id: 'dashboard',
  title: 'Dashboard', 
  description: 'Pharmacy overview and metrics',
  icon: 'LayoutDashboard',
  href: '/pharmacy'
}

// Prescription Management Group
{
  id: 'prescriptions',
  title: 'Prescriptions',
  items: [
    { id: 'inbox', title: 'Inbox', href: '/pharmacy/prescriptions/inbox' },
    { id: 'reviewing', title: 'Reviewing', href: '/pharmacy/prescriptions/reviewing' },
    { id: 'verified', title: 'Verified', href: '/pharmacy/prescriptions/verified' },
    { id: 'quoted', title: 'Quoted', href: '/pharmacy/prescriptions/quoted' }
  ]
}

// Pharmacy Operations Group  
{
  id: 'operations',
  title: 'Operations',
  items: [
    { id: 'staff', title: 'Staff Management', href: '/pharmacy/staff' },
    { id: 'inventory', title: 'Inventory', href: '/pharmacy/inventory' },
    { id: 'pos', title: 'Point of Sale', href: '/pharmacy/pos' }
  ]
}

// Reports & Settings Group
{
  id: 'reports',
  title: 'Reports', 
  items: [
    { id: 'analytics', title: 'Analytics', href: '/pharmacy/reports' },
    { id: 'settings', title: 'Settings', href: '/pharmacy/settings' }
  ]
}
```

## Context Switching

### Patient Sidebar Addition
- **Add link at bottom** (above logout): "Switch to Pharmacy App"
- **Target**: Always `/pharmacy` (pharmacy homepage)
- **Styling**: Same as other sidebar links
- **Icon**: `Building2` or `Pill`

### Pharmacy Sidebar Addition  
- **Add link at bottom** (above logout): "Switch to Patient App"
- **Target**: Always `/patient` (patient homepage)  
- **Styling**: Same as other sidebar links
- **Icon**: `User` or `Heart`

---

## Pharmacy Homepage Specification

### Foundation
- **Exact clone** of patient homepage structure
- **Same tile-based layout** using `TilePageLayout`
- **Same responsive grid** - 3 columns desktop, 1 column mobile
- **Same component patterns** - `VerticalTile` components

### Tile Structure
Based on pharmacy portal specification dashboard:

```typescript
// Prescription Management Tiles
{
  title: 'Inbox',
  description: 'New prescriptions to review',
  count: '12',
  urgent: '3',
  href: '/pharmacy/prescriptions/inbox',
  icon: 'Inbox'
}

{
  title: 'Reviewing', 
  description: 'Currently being processed',
  count: '5',
  overdue: '1', 
  href: '/pharmacy/prescriptions/reviewing',
  icon: 'Eye'
}

{
  title: 'Verified',
  description: 'Ready for quotation',
  count: '8',
  today: '15',
  href: '/pharmacy/prescriptions/verified', 
  icon: 'CheckCircle'
}

// Operations Tiles
{
  title: 'Staff Management',
  description: 'Active staff and assignments',
  count: '8 online',
  efficiency: '94%',
  href: '/pharmacy/staff',
  icon: 'Users'
}

{
  title: 'Inventory',
  description: 'Stock levels and alerts', 
  lowStock: '15 items',
  status: 'normal',
  href: '/pharmacy/inventory',
  icon: 'Package'
}

{
  title: 'Daily Sales',
  description: 'Today\'s revenue',
  amount: 'R 12,450',
  growth: '+8%',
  href: '/pharmacy/pos',
  icon: 'DollarSign'
}
```

### Tile Specifications
- **Same dimensions**: 200px × 150px minimum
- **Same hover effects**: Subtle elevation
- **Same badge overlays**: Counts, urgent items, status indicators
- **Same color coding**: Red (urgent), Amber (attention), Green (good), Blue (neutral)

---

## Component Structure

### Files to Create
```
config/pharmacyNav.ts           # Navigation configuration
components/layouts/PharmacySidebar.tsx    # Sidebar component  
app/pharmacy/page.tsx           # Homepage
```

### Implementation Pattern
1. **Copy** `PatientSidebar.tsx` → `PharmacySidebar.tsx`
2. **Replace** `patientNavItems` with `pharmacyNavItems`  
3. **Add** context switch link at bottom
4. **Copy** patient homepage structure for pharmacy homepage
5. **Replace** patient tiles with pharmacy tiles
6. **Update** `PageShell` to detect `/pharmacy/*` routes and use `PharmacySidebar`

---

## Route Context Detection

### Layout Logic
```typescript
// In PageShell component
const isPharmacyRoute = pathname.startsWith('/pharmacy')
const sidebarComponent = isPharmacyRoute ? PharmacySidebar : PatientSidebar
```

### Always Start Patient
- **Default login destination**: `/patient` (patient homepage)
- **Pharmacy access**: Via "Switch to Pharmacy App" link
- **No role-based routing**: MVP keeps it simple

---

## Standards Compliance

### Scrypto Architecture
- ✅ **Three-layer naming**: `pharmacy/{group}/{item}`
- ✅ **Component patterns**: Same as patient implementation  
- ✅ **Styling standards**: Blue theme, consistent spacing
- ✅ **Mobile responsiveness**: Same breakpoints and behavior
- ✅ **Navigation patterns**: Identical UX paradigms

### Security Considerations
- **No authentication changes**: Uses same auth system
- **No role enforcement**: MVP allows access to both contexts
- **Context isolation**: Pharmacy sidebar only shows pharmacy items
- **Future-ready**: Easy evolution to proper role-based access

---

**IMPLEMENTATION RULE**: Clone patient patterns exactly, replace content only. This ensures consistency and leverages all existing Scrypto architectural investments while providing clean context separation for MVP testing.