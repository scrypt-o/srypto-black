import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function FamilyHistoryPage() {
  // Auth enforced by middleware

  const config = {
    title: 'Medical History',
    subtitle: 'In progress',
    description: '',
    tiles: [] as any[],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Medical History"
      headerSubtitle="In progress"
      tileConfig={config as any}
      contentHeading="Family History"
      contentSubheading="In progress"
    />
  )
}
