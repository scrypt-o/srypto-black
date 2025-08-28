import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'
import { PatientHomeConfig } from './config'

export default async function PatientHomePage() {
  // Server-side authentication check
  const _user = await requireUser()
  
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
