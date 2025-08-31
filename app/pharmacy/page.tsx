import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { pharmacyNavItems } from '@/config/pharmacyNav'
import { PharmacyHomeConfig } from './config'

export default function PharmacyHomePage() {
  // Server-side authentication check
  // Auth enforced by middleware
  
  return (
    <TilePageLayout
      sidebarItems={pharmacyNavItems}
      headerTitle="Dashboard"
      contentHeading="Pharmacy Dashboard"
      contentSubheading="Prescription processing and operations center"
      headingIcons={[
        { id: 'notifications', icon: 'Bell', href: '/pharmacy/notifications', ariaLabel: 'Notifications' },
        { id: 'alerts', icon: 'AlertOctagon', href: '/pharmacy/alerts', ariaLabel: 'Alerts' },
        { id: 'reports', icon: 'BarChart3', href: '/pharmacy/reports', ariaLabel: 'Reports' },
      ]}
      tileOrientation="vertical"
      tileConfig={PharmacyHomeConfig}
    />
  )
}