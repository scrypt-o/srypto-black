import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function AppointmentsPage() {
  // Auth enforced by middleware
  
  const appointmentsConfig = {
    title: 'Appointments',
    subtitle: 'Schedule & manage visits',
    description: 'View upcoming appointments, schedule new visits, and manage your healthcare calendar.',
    tiles: [
      {
        id: 'upcoming',
        title: 'Upcoming Appointments',
        description: 'Scheduled visits and consultations',
        icon: 'Calendar',
        href: '/patient/appointments/upcoming',
        variant: 'highlighted' as const,
        color: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
      },
      {
        id: 'schedule',
        title: 'Schedule New',
        description: 'Book a new appointment',
        icon: 'CalendarPlus',
        href: '/patient/appointments/schedule',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'history',
        title: 'Visit History',
        description: 'Past appointments and notes',
        icon: 'History',
        href: '/patient/appointments/history',
        variant: 'default' as const,
        color: 'bg-gray-50 hover:bg-gray-100 border-gray-200'
      },
      {
        id: 'telehealth',
        title: 'Telehealth',
        description: 'Virtual consultations',
        icon: 'Video',
        href: '/patient/appointments/telehealth',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Appointments"
      headerSubtitle="Schedule & manage visits"
      tileConfig={appointmentsConfig}
    />
  )
}
