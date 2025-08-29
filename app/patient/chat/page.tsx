import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'
import { patientNavItems } from '@/config/patientNav'

export default function ChatPage() {
  // Auth enforced by middleware

  const config: TileGridLayoutProps = {
    title: 'Assistant',
    subtitle: '',
    description: '',
    tiles: [],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Assistant"
      headerSubtitle=""
      tileConfig={config}
      contentHeading="Assistant"
      contentSubheading=""
    />
  )
}
