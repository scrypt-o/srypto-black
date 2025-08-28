import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function ChatPage() {
  await requireUser()

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

