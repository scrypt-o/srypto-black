'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { familyHistoryDetailConfig } from '@/config/familyHistoryDetailConfig'
import type { FamilyHistoryRow } from '@/schemas/family-history'

export type FamilyHistoryDetailFeatureProps = {
  familyHistory: FamilyHistoryRow
}

export default function FamilyHistoryDetailFeature({ familyHistory }: FamilyHistoryDetailFeatureProps) {
  return <GenericDetailFeature data={familyHistory} config={familyHistoryDetailConfig} />
}