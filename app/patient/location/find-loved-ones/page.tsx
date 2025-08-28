import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function FindLovedOnesPage() {
  await requireUser()

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

