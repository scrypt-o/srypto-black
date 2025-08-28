// Complete Patient Portal Home Configuration
export const PatientHomeConfig = {
  // Remove grid-level header/description; we use the AppHeader instead
  title: '',
  // One tile per top-level sidebar item (excluding Home), in exact order
  tiles: [
    {
      id: 'communications',
      title: 'Communications',
      description: 'Alerts, messages, notifications',
      icon: 'MessageSquare',
      href: '/patient/comm',
      variant: 'default' as const,
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    },
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Profile, contacts, documents',
      icon: 'User',
      href: '/patient/persinfo',
      variant: 'default' as const,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      description: 'Scan and manage scripts',
      icon: 'FileText',
      href: '/patient/presc',
      variant: 'default' as const,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      id: 'medications',
      title: 'Medications',
      description: 'Active medications & adherence',
      icon: 'Pill',
      href: '/patient/medications',
      variant: 'default' as const,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'vitality',
      title: 'Vitality',
      description: 'Health metrics & wellness',
      icon: 'Heart',
      href: '/patient/vitality',
      variant: 'default' as const,
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200'
    },
    {
      id: 'care-network',
      title: 'Care Network',
      description: 'Caregivers and caretakers',
      icon: 'UsersRound',
      href: '/patient/care-network',
      disabled: true,
      variant: 'subtle' as const
    },
    {
      id: 'medhist',
      title: 'Medical History',
      description: 'Allergies, conditions, immunizations',
      icon: 'HeartPulse',
      href: '/patient/medhist',
      variant: 'highlighted' as const,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'lab-results',
      title: 'Lab Results',
      description: 'Test results & reports',
      icon: 'FlaskRound',
      href: '/patient/labresults',
      variant: 'default' as const,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      id: 'location',
      title: 'Location',
      description: 'Healthcare map and services',
      icon: 'Map',
      href: '/patient/location',
      disabled: true,
      variant: 'subtle' as const
    },
    {
      id: 'deals',
      title: 'Deals',
      description: 'Pharmacy specials',
      icon: 'BadgePercent',
      href: '/patient/deals',
      disabled: true,
      variant: 'subtle' as const
    },
    {
      id: 'rewards',
      title: 'Rewards',
      description: 'Rewards dashboard',
      icon: 'Trophy',
      href: '/patient/rewards',
      disabled: true,
      variant: 'subtle' as const
    }
  ],
  // No quick actions on home grid
  quickActions: []
}
