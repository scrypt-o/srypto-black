import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'
import { PatientHomeConfig } from './config'

export default async function PatientHomePage() {
  // Server-side authentication check
  const _user = await requireUser()
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Home"
      contentHeading="Welcome to Scrypto, your medical hub"
      tileConfig={PatientHomeConfig}
    />
  )
}
