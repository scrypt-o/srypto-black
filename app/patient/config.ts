// Complete Patient Portal Home Configuration
export const PatientHomeConfig = {
  // Remove grid-level header/description; we use the AppHeader instead
  title: '',
  subtitle: undefined,
  description: undefined,
  tiles: [
    {
      id: 'medhist',
      title: 'Medical History',
      description: 'Allergies, conditions, immunizations',
      icon: 'Activity',
      href: '/patient/medhist',
      variant: 'highlighted' as const,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'medications',
      title: 'Medications',
      description: 'Active prescriptions & adherence',
      icon: 'Pill',
      href: '/patient/medications',
      variant: 'default' as const,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
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
      id: 'persinfo',
      title: 'Personal Info',
      description: 'Profile, contacts, documents',
      icon: 'User',
      href: '/patient/persinfo',
      variant: 'default' as const,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
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
      id: 'labresults',
      title: 'Lab Results',
      description: 'Test results & reports',
      icon: 'TestTube',
      href: '/patient/labresults',
      variant: 'default' as const,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      id: 'appointments',
      title: 'Appointments',
      description: 'Schedule & manage visits',
      icon: 'Calendar',
      href: '/patient/appointments',
      variant: 'default' as const,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
    },
    {
      id: 'communications',
      title: 'Messages',
      description: 'Alerts & notifications',
      icon: 'MessageCircle',
      href: '/patient/comm',
      variant: 'default' as const,
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    }
  ],
  // Remove quick actions above the grid
  quickActions: []
}
