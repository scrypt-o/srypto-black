import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function MedicalHistoryPage() {
  // Server-side authentication check
  // Auth enforced by middleware

  const medHistConfig = {
    title: 'Medical History',
    subtitle: 'Your records',
    description: 'Allergies, conditions, immunizations, surgeries, and family history.',
    tiles: [
      {
        id: 'allergies',
        title: 'Allergies',
        description: 'Track allergic reactions and sensitivities',
        icon: 'AlertTriangle',
        href: '/patient/medhist/allergies',
        variant: 'default' as const,
        accent: 'blue' as const
      },
      {
        id: 'medical-conditions',
        title: 'Conditions',
        description: 'Diagnosed conditions and statuses',
        icon: 'Stethoscope',
        href: '/patient/medhist/medical-conditions',
        variant: 'default' as const,
        accent: 'blue' as const
      },
      {
        id: 'immunizations',
        title: 'Immunizations',
        description: 'Vaccinations and boosters',
        icon: 'Syringe',
        href: '/patient/medhist/immunizations',
        variant: 'default' as const,
        accent: 'blue' as const
      },
      {
        id: 'surgeries',
        title: 'Surgeries',
        description: 'Past procedures and operations',
        icon: 'Hospital',
        href: '/patient/medhist/surgeries',
        variant: 'default' as const,
        accent: 'blue' as const
      },
      {
        id: 'family-history',
        title: 'Family History',
        description: 'Family medical background',
        icon: 'Users',
        href: '/patient/medhist/family-history',
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
