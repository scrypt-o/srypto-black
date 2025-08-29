import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function PrescriptionsPage() {
  // Auth enforced by middleware
  
  const prescriptionsConfig = {
    title: 'Prescriptions',
    subtitle: 'Scan and manage scripts',
    description: 'Upload, scan, and manage your prescription documents digitally.',
    tiles: [
      {
        id: 'scan',
        title: 'Scan Prescription',
        description: 'Upload or scan a new prescription',
        icon: 'QrCode',
        href: '/patient/presc/scan',
        variant: 'highlighted' as const,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
      },
      {
        id: 'active',
        title: 'Active Prescriptions',
        description: 'View current prescriptions',
        icon: 'FileText',
        href: '/patient/presc/active',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'history',
        title: 'Prescription History',
        description: 'Past prescriptions archive',
        icon: 'Archive',
        href: '/patient/presc/history',
        variant: 'default' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      },
      {
        id: 'refills',
        title: 'Refill Requests',
        description: 'Request prescription refills',
        icon: 'RefreshCw',
        href: '/patient/presc/refills',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Prescriptions"
      headerSubtitle="Scan and manage scripts"
      tileConfig={prescriptionsConfig}
    />
  )
}
