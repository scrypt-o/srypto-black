'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { medicationHistoryListConfig } from '@/config/medicationHistoryListConfig'
import type { MedicationHistoryRow } from '@/config/medicationHistoryListConfig'

interface ListState {
  page: number
  pageSize: number
  search?: string
  effectiveness?: string
  sort_by: string
  sort_dir: string
}

interface MedicationHistoryListFeatureProps {
  initialData: MedicationHistoryRow[]
  total: number
  initialState: ListState
}

export default function MedicationHistoryListFeature(props: MedicationHistoryListFeatureProps) {
  return <GenericListFeature {...props} config={medicationHistoryListConfig} />
}

export type { MedicationHistoryListFeatureProps }