import type { NavItem } from '@/components/layouts/PatientSidebar'

// Sidebar index order (static; no links wired)
export const patientNavItems: NavItem[] = [
  // Home (no active highlight even when current)
  { id: 'home', label: 'Home', icon: 'Home', href: '/patient' },

  // Communications
  {
    id: 'communications',
    label: 'Communications',
    icon: 'MessageSquare',
    type: 'group',
    children: [
      { id: 'alerts', label: 'Alerts', icon: 'AlertOctagon', href: '/patient/comm/alerts' },
      { id: 'messages', label: 'Messages', icon: 'Mail', href: '/patient/comm/inbox' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/patient/comm/notifications' },
    ],
  },

  // Personal Information
  {
    id: 'personal-info',
    label: 'Personal Information',
    icon: 'User',
    type: 'group',
    href: '/patient/persinfo',
    children: [
      { id: 'profile', label: 'Profile', icon: 'IdCard', href: '/patient/persinfo/profile' },
      { id: 'medical-aid', label: 'Medical Aid', icon: 'ShieldHeart', href: '/patient/persinfo/medical-aid' },
      { id: 'addresses', label: 'Addresses', icon: 'MapPin', href: '/patient/persinfo/addresses' },
      { id: 'documents', label: 'Documents', icon: 'FileText', href: '/patient/persinfo/documents' },
      { id: 'emergency-contacts', label: 'Emergency Contacts', icon: 'PhoneCall', href: '/patient/persinfo/emergency-contacts' },
      { id: 'dependents', label: 'Dependents', icon: 'Users', href: '/patient/persinfo/dependents' },
    ],
  },

  // Prescriptions
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'FileText',
    type: 'group',
    href: '/patient/presc',
    children: [
      { id: 'scan-prescription', label: 'Scan Prescription', icon: 'Scan', href: '/patient/presc/scan' },
      { id: 'my-prescriptions', label: 'My Prescriptions', icon: 'FilePrescription', href: '/patient/presc/active' },
      { id: 'prescription-medications', label: 'Prescription Medications', icon: 'Syringe' },
    ],
  },

  // Medications
  {
    id: 'medications',
    label: 'Medications',
    icon: 'Pill',
    type: 'group',
    href: '/patient/medications',
    children: [
      { id: 'my-medications', label: 'My Medications', icon: 'Pill', href: '/patient/medications/active' },
      { id: 'medication-history', label: 'Medication History', icon: 'History', href: '/patient/medications/history' },
      { id: 'medication-adherence', label: 'Medication Adherence', icon: 'CheckCircle2', href: '/patient/medications/adherence' },
    ],
  },

  // Vitality
  {
    id: 'vitality',
    label: 'Vitality',
    icon: 'Heart',
    type: 'group',
    href: '/patient/vitality',
    children: [
      { id: 'body-measurements', label: 'Body Measurements', icon: 'Ruler' },
      { id: 'sleep-tracking', label: 'Sleep Tracking', icon: 'Moon' },
      { id: 'nutrition-diet', label: 'Nutrition & Diet', icon: 'UtensilsCrossed' },
      { id: 'reproductive-health', label: 'Reproductive Health', icon: 'Baby' },
      { id: 'mental-health', label: 'Mental Health', icon: 'Brain' },
      { id: 'vital-signs', label: 'Vital Signs', icon: 'ActivitySquare', href: '/patient/vitality/vital-signs' },
      { id: 'activity-fitness', label: 'Activity & Fitness', icon: 'Dumbbell' },
    ],
  },

  // Care Network
  {
    id: 'care-network',
    label: 'Care Network',
    icon: 'UsersRound',
    type: 'group',
    // No landing page yet; only children
    children: [
      { id: 'caregivers', label: 'Caregivers', icon: 'UserCheck', href: '/patient/care-network/caregivers' },
      { id: 'caretakers', label: 'Caretakers', icon: 'User' },
    ],
  },

  // Medical History
  {
    id: 'medhist',
    label: 'Medical History',
    icon: 'HeartPulse',
    type: 'group',
    href: '/patient/medhist',
    children: [
      { id: 'allergies', label: 'Allergies', icon: 'AlertTriangle', href: '/patient/medhist/allergies' },
      { id: 'medical-conditions', label: 'Medical Conditions', icon: 'Stethoscope', href: '/patient/medhist/conditions' },
      { id: 'immunizations', label: 'Immunizations', icon: 'Syringe', href: '/patient/medhist/immunizations' },
      { id: 'surgeries', label: 'Surgeries', icon: 'Hospital', href: '/patient/medhist/surgeries' },
      { id: 'family-history', label: 'Family History', icon: 'Users', href: '/patient/medhist/family-history' },
    ],
  },

  // Lab Results
  {
    id: 'lab-results',
    label: 'Lab Results',
    icon: 'FlaskRound',
    type: 'group',
    href: '/patient/labresults',
    children: [
      { id: 'view-results', label: 'View Results', icon: 'FileBarChart2' },
    ],
  },

  // Location
  {
    id: 'location',
    label: 'Location',
    icon: 'Map',
    type: 'group',
    children: [
      { id: 'healthcare-map', label: 'Healthcare Map', icon: 'MapPinned' },
      { id: 'nearest-services', label: 'Nearest Services', icon: 'Navigation' },
      { id: 'find-loved-ones', label: 'Find Loved Ones', icon: 'LocateFixed' },
    ],
  },

  // Deals
  {
    id: 'deals',
    label: 'Deals',
    icon: 'BadgePercent',
    type: 'group',
    children: [
      { id: 'pharmacy-specials', label: 'Pharmacy Specials', icon: 'Tag' },
    ],
  },

  // Rewards
  {
    id: 'rewards',
    label: 'Rewards',
    icon: 'Trophy',
    type: 'group',
    children: [
      { id: 'rewards-dashboard', label: 'Rewards Dashboard', icon: 'Award' },
    ],
  },

  // Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    type: 'link',
    href: '/patient/settings/ui',
  },
]
