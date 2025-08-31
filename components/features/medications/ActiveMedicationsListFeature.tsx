'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { activeMedicationsListConfig } from '@/config/activeMedicationsListConfig'
import type { ActiveMedicationRow } from '@/config/activeMedicationsListConfig'

interface ListState {
  page: number
  pageSize: number
  search?: string
  status?: string
  route?: string
  sort_by: string
  sort_dir: string
}

interface ActiveMedicationsListFeatureProps {
  initialData: ActiveMedicationRow[]
  total: number
  initialState: ListState
}

export default function ActiveMedicationsListFeature(props: ActiveMedicationsListFeatureProps) {
  return <GenericListFeature {...props} config={activeMedicationsListConfig} />
}

export type { ActiveMedicationsListFeatureProps }