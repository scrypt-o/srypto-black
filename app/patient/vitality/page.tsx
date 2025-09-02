import React from 'react'
export const dynamic = 'force-dynamic'
 
import TilePageLayout from '@/components/layouts/TilePageLayout'
import { patientNavItems } from '@/config/patientNav'

export default function VitalityPage() {
  // Auth enforced by middleware
  
  const vitalityConfig = {
    title: 'Vitality',
    subtitle: 'Health metrics & wellness',
    description: 'Track your vital signs, health metrics, and wellness goals.',
    tiles: [
      {
        id: 'vitals',
        title: 'Vital Signs',
        description: 'Blood pressure, heart rate, temperature',
        icon: 'Heart',
        href: '/patient/vitality/vital-signs',
        variant: 'highlighted' as const,
        color: 'bg-rose-50 hover:bg-rose-100 border-rose-200'
      },
      {
        id: 'metrics',
        title: 'Health Metrics',
        description: 'Weight, BMI, glucose levels',
        icon: 'TrendingUp',
        href: '/patient/vitality/metrics',
        variant: 'default' as const,
        color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
      },
      {
        id: 'wellness',
        title: 'Wellness Goals',
        description: 'Track health and fitness goals',
        icon: 'Target',
        href: '/patient/vitality/wellness',
        variant: 'default' as const,
        color: 'bg-green-50 hover:bg-green-100 border-green-200'
      },
      {
        id: 'activity',
        title: 'Activity Tracking',
        description: 'Exercise and physical activity',
        icon: 'Activity',
        href: '/patient/vitality/activity',
        variant: 'default' as const,
        color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
      }
    ]
  }
  
  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Vitality"
      headerSubtitle="Health metrics & wellness"
      tileConfig={vitalityConfig as any}
    />
  )
}
