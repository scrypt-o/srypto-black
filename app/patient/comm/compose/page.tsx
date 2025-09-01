import React from 'react'
export const dynamic = 'force-dynamic'

import { patientNavItems } from '@/config/patientNav'
import DetailPageLayout from '@/components/layouts/DetailPageLayout'
import ComposeMessage from '@/components/features/comm/ComposeMessage'

export default function ComposePage() {
  return (
    <DetailPageLayout
      sidebarItems={patientNavItems}
      headerTitle="Compose Message"
      headerSubtitle="Messages"
    >
      <div className="p-4">
        <ComposeMessage />
      </div>
    </DetailPageLayout>
  )
}

