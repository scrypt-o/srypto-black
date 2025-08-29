import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function DealsPage() {
  // Auth enforced by middleware

  const config = {
    title: 'Deals',
    subtitle: 'In progress',
    description: '',
    tiles: [] as any[],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Deals"
      headerSubtitle="In progress"
      tileConfig={config as any}
      contentHeading="Deals"
      contentSubheading="In progress"
    />
  )
}
