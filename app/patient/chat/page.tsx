import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function ChatPage() {
  // Auth enforced by middleware

  const config = {
    title: 'Assistant',
    subtitle: '',
    description: '',
    tiles: [] as any[],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Assistant"
      headerSubtitle=""
      tileConfig={config as any}
      contentHeading="Assistant"
      contentSubheading=""
    />
  )
}
