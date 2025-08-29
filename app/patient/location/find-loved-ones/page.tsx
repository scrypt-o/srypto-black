import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'
import { patientNavItems } from '@/config/patientNav'

export default function FindLovedOnesPage() {
  // Auth enforced by middleware

  const config: TileGridLayoutProps = {
    title: 'Location',
    subtitle: 'In progress',
    description: '',
    tiles: [],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Location"
      headerSubtitle="In progress"
      tileConfig={config}
      contentHeading="Find my loved ones"
      contentSubheading="In progress"
    />
  )
}
