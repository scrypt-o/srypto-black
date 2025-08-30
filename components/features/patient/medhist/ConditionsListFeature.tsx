'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { conditionsListConfig } from '@/config/conditionsListConfig'
import type { ConditionRow } from '@/schemas/conditions'

interface ListState {
  page: number
  pageSize: number
  search?: string
  severity?: string
  current_status?: string
  sort_by: string
  sort_dir: string
}

interface ConditionsListFeatureProps {
  initialData: ConditionRow[]
  total: number
  initialState: ListState
}

export default function ConditionsListFeature(props: ConditionsListFeatureProps) {
  return <GenericListFeature {...props} config={conditionsListConfig} />
}

export type { ConditionsListFeatureProps }