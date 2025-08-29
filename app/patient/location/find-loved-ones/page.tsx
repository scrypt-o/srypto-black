import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function FindLovedOnesPage() {
  // Auth enforced by middleware

  const config = {
    title: 'Location',
    subtitle: 'In progress',
    description: '',
    tiles: [] as any[],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Location"
      headerSubtitle="In progress"
      tileConfig={config as any}
      contentHeading="Find my loved ones"
      contentSubheading="In progress"
    />
  )
}
