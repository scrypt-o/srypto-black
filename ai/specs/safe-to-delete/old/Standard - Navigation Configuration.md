# Navigation Configuration Standard

## Summary
Centralized navigation configuration for consistent menu structures across the application. Defines all routes, icons, labels, and hierarchy.

## Structure

### Location
```
/config/
  patientNav.ts   # Patient portal navigation
  adminNav.ts     # Admin portal navigation (future)
```

### NavItem Type
```typescript
type NavItem = {
  id: string
  label: string
  icon?: keyof typeof Icons | string  // Lucide icon name
  href?: string                       // Route path
  type?: 'link' | 'group'            // Default 'link'
  children?: NavItem[]                // For groups
  badge?: string | number             // Optional badge
}
```

## Patient Navigation Structure

Based on the 11 domain groups from init.md:

1. **Personal Information** (`persinfo`)
   - Profile, Addresses, Documents
   - Emergency Contacts, Dependents, Medical Aid

2. **Medical History** (`medhist`)
   - Allergies, Conditions, Immunizations
   - Surgeries, Family History

3. **Prescriptions** (`presc`)
   - My Prescriptions, Scan Prescription, History

4. **Medications**
   - Active Medications, Medication History, Adherence

5. **Vitality**
   - Body Measurements, Sleep, Nutrition, Mental Health

6. **Care Network** (`carenet`)
   - Caregivers, Caretakers

7. **Location Services** (`location`)
   - Healthcare Map, Nearest Services, Find Loved Ones

8. **Communication** (`comm`)
   - Messages, Alerts, Notifications

9. **Lab Results** (`labresults`)

10. **Pharmacy Deals** (`deals`)

11. **Rewards**

## Icon Mapping

All icons use Lucide React names:
- Home, User, UserCircle, MapPin
- FileText, Phone, Users, Shield
- Heart, Activity, AlertTriangle
- Syringe, Scissors, GitBranch
- Pill, Camera, History, Package
- CheckSquare, Clock, TrendingUp
- Ruler, Moon, Apple, Brain
- UserPlus, UserCheck, Map, Navigation
- Search, MessageSquare, Mail, Bell
- BellDot, TestTube2, Tag, Award

## Usage

```typescript
import { patientNavItems } from '@/config/patientNav'
import PatientSidebar from '@/components/nav/PatientSidebar'

<PatientSidebar items={patientNavItems} />
```

## Consistency Rules
1. All paths follow pattern: `/patient/[domain]/[feature]`
2. Icon names must exist in lucide-react
3. Groups have children, links have href
4. Badges for notification counts
5. IDs match route segments for easy lookup