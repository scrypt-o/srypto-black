import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function MedicalConditionsPage() {
  await requireUser()

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
      contentHeading="Conditions"
      contentSubheading="In progress"
    />
  )
}

