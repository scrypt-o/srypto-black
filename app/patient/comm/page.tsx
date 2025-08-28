import React from 'react'
export const dynamic = 'force-dynamic'
import { requireUser } from '@/lib/supabase-server'
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default async function CommunicationsPage() {
  const _user = await requireUser()
  
  const communicationsConfig = {
    title: 'Messages',
    subtitle: 'Alerts & notifications',
    description: 'Manage communications with your healthcare providers and view important alerts.',
    tiles: [
      {
        id: 'inbox',
        title: 'Inbox',
        description: 'Messages from providers',
        icon: 'MessageCircle',
        href: '/patient/comm/inbox',
        variant: 'highlighted' as const,
        color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
      },
      {
        id: 'alerts',
        title: 'Health Alerts',
        description: 'Important health notifications',
        icon: 'Bell',
        href: '/patient/comm/alerts',
        variant: 'default' as const,
        color: 'bg-red-50 hover:bg-red-100 border-red-200'
      },
      {
        id: 'compose',
        title: 'Compose Message',
        description: 'Send message to provider',
        icon: 'Send',
        href: '/patient/comm/compose',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'history',
        title: 'Message History',
        description: 'Past communications archive',
        icon: 'Archive',
        href: '/patient/comm/history',
        variant: 'default' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Messages"
      headerSubtitle="Alerts & notifications"
      tileConfig={communicationsConfig}
    />
  )
}