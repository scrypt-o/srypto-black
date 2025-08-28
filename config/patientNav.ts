import type { NavItem } from '@/components/nav/PatientSidebar'

export const patientNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Patient Home',
    icon: 'Home',
    href: '/patient',
  },
  {
    id: 'medhist',
    label: 'Medical History',
    icon: 'Heart',
    type: 'group',
    children: [
      { id: 'allergies', label: 'Allergies', icon: 'AlertTriangle', href: '/patient/medhist/allergies' },
    ],
  },
]
