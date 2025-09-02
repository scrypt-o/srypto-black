import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import type { TileGridLayoutProps } from '@/components/layouts/TileGridLayout'
import { patientNavItems } from '@/config/patientNav'

export default function FindLovedOnesPage() {
  // Auth enforced by middleware

  const config: TileGridLayoutProps = {
    title: 'Location',
    subtitle: 'Tools and services near you',
    description: 'Find nearby pharmacies and medical services.',
    tiles: [
      {
        id: 'nearest-services',
        title: 'Nearest Services',
        description: 'Find pharmacies and medical services near you',
        icon: 'MapPin',
        href: '/patient/location/nearest-services',
        variant: 'highlighted' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      },
    ],
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Location"
      headerSubtitle="Find nearby services"
      tileConfig={config}
      contentHeading="Location Services"
      contentSubheading="Maps and nearby searches"
    />
  )
}
