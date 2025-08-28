import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function MedicalHistoryPage() {
  // Server-side authentication check
  const _user = await requireUser()

  const medHistConfig = {
    title: 'Medical History',
    subtitle: 'Allergies',
    description: 'Manage your allergies and reactions.',
    tiles: [
      {
        id: 'allergies',
        title: 'Allergies',
        description: 'Track allergic reactions and sensitivities',
        icon: 'AlertTriangle',
        href: '/patient/medhist/allergies',
        variant: 'default' as const,
        accent: 'blue' as const
      }
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Medical History"
      headerSubtitle="Allergies"
      tileConfig={medHistConfig}
      style="glass"
      accent="healthcare"
    />
  )
}
