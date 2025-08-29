import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'
import { patientNavItems } from '@/config/patientNav'

export default function FamilyHistoryPage() {
  // Auth enforced by middleware

  const config: TileGridLayoutProps = {
    title: 'Medical History',
    subtitle: 'In progress',
    description: '',
    tiles: [],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Medical History"
      headerSubtitle="In progress"
      tileConfig={config}
      contentHeading="Family History"
      contentSubheading="In progress"
    />
  )
}
