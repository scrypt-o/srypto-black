import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function LabResultsPage() {
  // Auth enforced by middleware
  
  const labResultsConfig = {
    title: 'Lab Results',
    subtitle: 'Test results & reports',
    description: 'View and track your laboratory test results and diagnostic reports.',
    tiles: [
      {
        id: 'recent',
        title: 'Recent Results',
        description: 'Latest test results',
        icon: 'TestTube',
        href: '/patient/labresults/recent',
        variant: 'highlighted' as const,
        color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
      },
      {
        id: 'blood',
        title: 'Blood Work',
        description: 'Complete blood count and panels',
        icon: 'Droplet',
        href: '/patient/labresults/blood',
        variant: 'default' as const,
        color: 'bg-red-50 hover:bg-red-100 border-red-200'
      },
      {
        id: 'imaging',
        title: 'Imaging Results',
        description: 'X-rays, MRIs, CT scans',
        icon: 'FileImage',
        href: '/patient/labresults/imaging',
        variant: 'default' as const,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
      },
      {
        id: 'history',
        title: 'Test History',
        description: 'All past test results',
        icon: 'History',
        href: '/patient/labresults/history',
        variant: 'default' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Lab Results"
      headerSubtitle="Test results & reports"
      tileConfig={labResultsConfig}
    />
  )
}
