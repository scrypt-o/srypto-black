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
        title: 'Profile',
        description: 'Personal details and preferences',
        icon: 'User',
        href: '/patient/persinfo/profile',
        variant: 'highlighted' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      },
      {
        id: 'medical-aid',
        title: 'Medical Aid',
        description: 'Scheme and membership details',
        icon: 'ShieldHeart',
        href: '/patient/persinfo/medical-aid',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      },
      {
        id: 'addresses',
        title: 'Addresses',
        description: 'Home and postal addresses',
        icon: 'MapPin',
        href: '/patient/persinfo/addresses',
        variant: 'default' as const,
        color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Identity and medical documents',
        icon: 'FileText',
        href: '/patient/persinfo/documents',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'emergency-contacts',
        title: 'Emergency Contacts',
        description: 'Important contact information',
        icon: 'PhoneCall',
        href: '/patient/persinfo/emergency-contacts',
        variant: 'default' as const,
        color: 'bg-red-50 hover:bg-red-100 border-red-200'
      },
      {
        id: 'dependents',
        title: 'Dependents',
        description: 'Family members and dependents',
        icon: 'Users',
        href: '/patient/persinfo/dependents',
        variant: 'default' as const,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
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
