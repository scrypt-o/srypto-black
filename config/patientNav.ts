import type { NavItem } from '@/components/layouts/PatientSidebar'

// Sidebar index order (static; no links wired)
export const patientNavItems: NavItem[] = [
  // Home (no active highlight even when current)
  { id: 'home', label: 'Home', icon: 'Home' },

  // Communications
  {
    id: 'communications',
    label: 'Communications',
    icon: 'MessageSquare',
    type: 'group',
    children: [
      { id: 'alerts', label: 'Alerts', icon: 'AlertOctagon' },
      { id: 'messages', label: 'Messages', icon: 'Mail' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    ],
  },

  // Personal Information
  {
    id: 'personal-info',
    label: 'Personal Information',
    icon: 'User',
    type: 'group',
    children: [
      { id: 'profile', label: 'Profile', icon: 'IdCard' },
      { id: 'addresses', label: 'Addresses', icon: 'MapPin' },
      { id: 'medical-aid', label: 'Medical Aid', icon: 'ShieldHeart' },
      { id: 'documents', label: 'Documents', icon: 'FileText' },
      { id: 'emergency-contacts', label: 'Emergency Contacts', icon: 'PhoneCall' },
      { id: 'dependents', label: 'Dependents', icon: 'Users' },
    ],
  },

  // Prescriptions
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'Prescription',
    type: 'group',
    children: [
      { id: 'scan-prescription', label: 'Scan Prescription', icon: 'Scan' },
      { id: 'my-prescriptions', label: 'My Prescriptions', icon: 'FilePrescription' },
      { id: 'prescription-medications', label: 'Prescription Medications', icon: 'Syringe' },
    ],
  },

  // Medications
  {
    id: 'medications',
    label: 'Medications',
    icon: 'Pill',
    type: 'group',
    children: [
      { id: 'my-medications', label: 'My Medications', icon: 'Pill' },
      { id: 'medication-history', label: 'Medication History', icon: 'History' },
      { id: 'medication-adherence', label: 'Medication Adherence', icon: 'CheckCircle2' },
    ],
  },

  // Vitality
  {
    id: 'vitality',
    label: 'Vitality',
    icon: 'Heartbeat',
    type: 'group',
    children: [
      { id: 'body-measurements', label: 'Body Measurements', icon: 'Ruler' },
      { id: 'sleep-tracking', label: 'Sleep Tracking', icon: 'Moon' },
      { id: 'nutrition-diet', label: 'Nutrition & Diet', icon: 'UtensilsCrossed' },
      { id: 'reproductive-health', label: 'Reproductive Health', icon: 'Baby' },
      { id: 'mental-health', label: 'Mental Health', icon: 'Brain' },
      { id: 'vital-signs', label: 'Vital Signs', icon: 'ActivitySquare' },
      { id: 'activity-fitness', label: 'Activity & Fitness', icon: 'Dumbbell' },
    ],
  },

  // Care Network
  {
    id: 'care-network',
    label: 'Care Network',
    icon: 'UsersRound',
    type: 'group',
    children: [
      { id: 'caregivers', label: 'Caregivers', icon: 'UserCheck' },
      { id: 'caretakers', label: 'Caretakers', icon: 'User' },
    ],
  },

  // Medical History
  {
    id: 'medhist',
    label: 'Medical History',
    icon: 'HeartPulse',
    type: 'group',
    children: [
      { id: 'allergies', label: 'Allergies', icon: 'AlertTriangle' },
      { id: 'medical-conditions', label: 'Medical Conditions', icon: 'Stethoscope' },
      { id: 'immunizations', label: 'Immunizations', icon: 'Syringe' },
      { id: 'surgeries', label: 'Surgeries', icon: 'Hospital' },
      { id: 'family-history', label: 'Family History', icon: 'Users' },
    ],
  },

  // Lab Results
  {
    id: 'lab-results',
    label: 'Lab Results',
    icon: 'FlaskRound',
    type: 'group',
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
]
