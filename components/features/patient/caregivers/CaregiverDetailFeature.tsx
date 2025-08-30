'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { caregiversDetailConfig } from '@/config/caregiversDetailConfig'
import type { CaregiverRow } from '@/schemas/caregivers'

export type CaregiverDetailFeatureProps = {
  caregiver: CaregiverRow
}

export default function CaregiverDetailFeature({ caregiver }: CaregiverDetailFeatureProps) {
  return <GenericDetailFeature data={caregiver} config={caregiversDetailConfig} />
}
