import type { NavItem } from '@/components/layouts/PatientSidebar'

// Pharmacy sidebar navigation items (clone of patient structure with pharmacy content)
export const pharmacyNavItems: NavItem[] = [
  // Home (no active highlight even when current)
  { id: 'home', label: 'Dashboard', icon: 'LayoutDashboard', href: '/pharmacy' },

  // Prescription Management
  {
    id: 'prescriptions',
    label: 'Prescriptions',
    icon: 'FileText',
    type: 'group',
    children: [
      { id: 'inbox', label: 'Request for Quotes', icon: 'Inbox', href: '/pharmacy/presc/inbox' },
      { id: 'reviewing', label: 'Reviewing', icon: 'Eye', href: '/pharmacy/presc/reviewing' },
      { id: 'verified', label: 'Verified', icon: 'CheckCircle', href: '/pharmacy/presc/verified' },
      { id: 'quoted', label: 'Quoted', icon: 'FileBarChart', href: '/pharmacy/presc/quoted' },
      { id: 'pending', label: 'Pending Response', icon: 'Clock', href: '/pharmacy/presc/pending' },
      { id: 'accepted', label: 'Accepted', icon: 'CheckCircle2', href: '/pharmacy/presc/accepted' },
    ],
  },

  // Communications
  {
    id: 'communications',
    label: 'Communications',
    icon: 'MessageSquare',
    type: 'group',
    children: [
      { id: 'pharm-alerts', label: 'Alerts', icon: 'AlertOctagon', href: '/pharmacy/comm/alerts' },
      { id: 'pharm-messages', label: 'Messages', icon: 'Mail', href: '/pharmacy/comm/inbox' },
      { id: 'pharm-notifications', label: 'Notifications', icon: 'Bell', href: '/pharmacy/comm/notifications' },
    ],
  },

  // Pharmacy Operations
  {
    id: 'operations',
    label: 'Operations',
    icon: 'Building2',
    type: 'group',
    children: [
      { id: 'staff', label: 'Staff Management', icon: 'Users', href: '/pharmacy/staff' },
      { id: 'inventory', label: 'Inventory', icon: 'Package', href: '/pharmacy/inventory' },
      { id: 'pos', label: 'Point of Sale', icon: 'CreditCard', href: '/pharmacy/pos' },
      { id: 'deals', label: 'Deals & Specials', icon: 'BadgePercent', href: '/pharmacy/deals' },
    ],
  },

  // Customer Management
  {
    id: 'customers',
    label: 'Customers',
    icon: 'Users',
    type: 'group',
    children: [
      { id: 'patient-profiles', label: 'Patient Profiles', icon: 'UserCheck' },
      { id: 'communication', label: 'Communication', icon: 'MessageSquare' },
      { id: 'loyalty', label: 'Loyalty Program', icon: 'Trophy' },
    ],
  },

  // Reports & Analytics
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    type: 'group',
    children: [
      { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', href: '/pharmacy/reports/analytics' },
      { id: 'financial', label: 'Financial Reports', icon: 'DollarSign', href: '/pharmacy/reports/financial' },
      { id: 'performance', label: 'Performance', icon: 'Target', href: '/pharmacy/reports/performance' },
      { id: 'compliance', label: 'Compliance', icon: 'ShieldCheck', href: '/pharmacy/reports/compliance' },
    ],
  },

  // Pharmacy Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    type: 'group',
    children: [
      { id: 'pharmacy-profile', label: 'Pharmacy Profile', icon: 'Building', href: '/pharmacy/settings/profile' },
      { id: 'business-hours', label: 'Business Hours', icon: 'Clock', href: '/pharmacy/settings/hours' },
      { id: 'delivery-zones', label: 'Delivery Zones', icon: 'MapPin', href: '/pharmacy/settings/delivery' },
      { id: 'pricing', label: 'Pricing & Margins', icon: 'Calculator', href: '/pharmacy/settings/pricing' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell', href: '/pharmacy/settings/notifications' },
      { id: 'integrations', label: 'Integrations', icon: 'Plug', href: '/pharmacy/settings/integrations' },
    ],
  },
]
