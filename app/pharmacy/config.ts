// Complete Pharmacy Portal Home Configuration
export const PharmacyHomeConfig = {
  // Remove grid-level header/description; we use the AppHeader instead
  title: '',
  // Pharmacy dashboard tiles based on pharmacy portal specification
  tiles: [
    {
      id: 'inbox',
      title: 'Inbox',
      description: 'New prescriptions to review',
      status: { text: '12 new · 3 urgent', tone: 'warning' as const },
      icon: 'Inbox',
      href: '/pharmacy/prescriptions/inbox',
      variant: 'highlighted' as const,
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      id: 'reviewing',
      title: 'Reviewing',
      description: 'Currently being processed',
      status: { text: '5 active · 1 overdue', tone: 'info' as const },
      icon: 'Eye',
      href: '/pharmacy/prescriptions/reviewing',
      variant: 'default' as const,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'verified',
      title: 'Verified',
      description: 'Ready for quotation',
      status: { text: '8 ready · 15 today', tone: 'success' as const },
      icon: 'CheckCircle',
      href: '/pharmacy/prescriptions/verified',
      variant: 'default' as const,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'quoted',
      title: 'Quoted',
      description: 'Awaiting patient response',
      status: { text: '6 sent · 2 expire 2h', tone: 'warning' as const },
      icon: 'FileBarChart',
      href: '/pharmacy/prescriptions/quoted',
      variant: 'default' as const,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
    },
    {
      id: 'accepted',
      title: 'Accepted',
      description: 'Ready for dispensing',
      status: { text: '3 payment · 5 dispensing', tone: 'info' as const },
      icon: 'CheckCircle2',
      href: '/pharmacy/prescriptions/accepted',
      variant: 'default' as const,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      id: 'staff',
      title: 'Staff Management',
      description: 'Active staff and assignments',
      status: { text: '8 online · 94% efficiency', tone: 'success' as const },
      icon: 'Users',
      href: '/pharmacy/staff',
      variant: 'default' as const,
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    },
    {
      id: 'inventory',
      title: 'Inventory',
      description: 'Stock levels and alerts',
      status: { text: '15 low stock items', tone: 'warning' as const },
      icon: 'Package',
      href: '/pharmacy/inventory',
      variant: 'default' as const,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
      id: 'pos',
      title: 'Point of Sale',
      description: 'Daily sales and transactions',
      status: { text: 'R 12,450 · +8% vs yesterday', tone: 'success' as const },
      icon: 'CreditCard',
      href: '/pharmacy/pos',
      variant: 'default' as const,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Performance and reports',
      status: { text: 'All metrics trending up', tone: 'success' as const },
      icon: 'TrendingUp',
      href: '/pharmacy/reports/analytics',
      variant: 'default' as const,
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      id: 'deals',
      title: 'Deals & Specials',
      description: 'Manage pharmacy specials',
      status: { text: '5 active · 2 expiring soon', tone: 'info' as const },
      icon: 'BadgePercent',
      href: '/pharmacy/deals',
      variant: 'default' as const,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      id: 'customers',
      title: 'Customers',
      description: 'Patient profiles and loyalty',
      icon: 'Users',
      href: '/pharmacy/customers',
      disabled: true,
      variant: 'subtle' as const
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Pharmacy configuration',
      icon: 'Settings',
      href: '/pharmacy/settings',
      variant: 'default' as const,
      color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
    }
  ],
  // No quick actions on home grid
  quickActions: []
}