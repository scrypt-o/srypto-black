'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { caregiversDetailConfig } from '@/config/caregiversDetailConfig'
import type { CaregiverRow } from '@/schemas/caregivers'

export default function CaregiverCreateFeature() {
  // Use GenericDetailFeature with empty data for creation mode
  const emptyCaregiver = {} as CaregiverRow
  return <GenericDetailFeature data={emptyCaregiver} config={caregiversDetailConfig} />
}
