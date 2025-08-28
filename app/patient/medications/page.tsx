import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function MedicationsPage() {
  const _user = await requireUser()
  
  const medicationsConfig = {
    title: 'Medications',
    subtitle: 'Active prescriptions & adherence',
    description: 'View and manage your current medications, track adherence, and review medication history.',
    tiles: [
      {
        id: 'active',
        title: 'Active Medications',
        description: 'Currently prescribed medications',
        icon: 'Pill',
        href: '/patient/medications/active',
        variant: 'highlighted' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'history',
        title: 'Medication History',
        description: 'Past prescriptions and changes',
        icon: 'History',
        href: '/patient/medications/history',
        variant: 'default' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      },
      {
        id: 'adherence',
        title: 'Adherence Tracking',
        description: 'Monitor medication compliance',
        icon: 'CheckCircle',
        href: '/patient/medications/adherence',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      },
      {
        id: 'interactions',
        title: 'Drug Interactions',
        description: 'Check for potential interactions',
        icon: 'AlertTriangle',
        href: '/patient/medications/interactions',
        variant: 'default' as const,
        color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Medications"
      headerSubtitle="Active prescriptions & adherence"
      tileConfig={medicationsConfig}
    />
  )
}