import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import { patientNavItems } from '@/config/patientNav'
import React from 'react'
import UISettingsClient from '@/components/features/settings/UISettingsClient'

export const dynamic = 'force-dynamic'

export default function UISettingsPage() {
  return (
    <DetailPageLayout sidebarItems={patientNavItems} headerTitle="Settings">
      <div className="p-4">
        <UISettingsClient />
      </div>
    </DetailPageLayout>
  )
}
