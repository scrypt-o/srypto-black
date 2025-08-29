import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'
import { PatientHomeConfig } from './config'

export default function PatientHomePage() {
  // Server-side authentication check
  // Auth enforced by middleware
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Home"
      contentHeading="Welcome to Scrypto"
      contentSubheading="Your medical hub"
      headingIcons={[
        { id: 'notifications', icon: 'Bell', href: '/patient/comm', ariaLabel: 'Notifications' },
        { id: 'alerts', icon: 'AlertOctagon', href: '/patient/comm', ariaLabel: 'Alerts' },
        { id: 'messages', icon: 'Mail', href: '/patient/comm', ariaLabel: 'Messages' },
      ]}
      tileOrientation="vertical"
      tileConfig={PatientHomeConfig}
    />
  )
}
