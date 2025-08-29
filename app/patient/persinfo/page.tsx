import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function PersonalInfoPage() {
  // Auth enforced by middleware
  
  const personalInfoConfig = {
    title: 'Personal Information',
    subtitle: 'Profile, contacts, documents',
    description: 'Manage your personal information, emergency contacts, and important documents.',
    tiles: [
      {
        id: 'profile',
        title: 'My Profile',
        description: 'Personal details and preferences',
        icon: 'User',
        href: '/patient/persinfo/profile',
        variant: 'highlighted' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      },
      {
        id: 'emergency',
        title: 'Emergency Contacts',
        description: 'Important contact information',
        icon: 'Phone',
        href: '/patient/persinfo/emergency',
        variant: 'default' as const,
        color: 'bg-red-50 hover:bg-red-100 border-red-200'
      },
      {
        id: 'insurance',
        title: 'Insurance Information',
        description: 'Coverage and policy details',
        icon: 'Shield',
        href: '/patient/persinfo/insurance',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Important medical documents',
        icon: 'FileText',
        href: '/patient/persinfo/documents',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Personal Information"
      headerSubtitle="Profile, contacts, documents"
      tileConfig={personalInfoConfig}
    />
  )
}
