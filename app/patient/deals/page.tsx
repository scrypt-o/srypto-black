import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'
import { patientNavItems } from '@/config/patientNav'

export default function DealsPage() {
  // Auth enforced by middleware

  const config: TileGridLayoutProps = {
    title: 'Deals',
    subtitle: 'In progress',
    description: '',
    tiles: [],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Deals"
      headerSubtitle="In progress"
      tileConfig={config}
      contentHeading="Deals"
      contentSubheading="In progress"
    />
  )
}
