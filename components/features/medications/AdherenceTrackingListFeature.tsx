'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { adherenceTrackingListConfig } from '@/config/adherenceTrackingListConfig'
import type { AdherenceTrackingRow } from '@/config/adherenceTrackingListConfig'

interface ListState {
  page: number
  pageSize: number
  search?: string
  status?: string
  sort_by: string
  sort_dir: string
}

interface AdherenceTrackingListFeatureProps {
  initialData: AdherenceTrackingRow[]
  total: number
  initialState: ListState
}

export default function AdherenceTrackingListFeature(props: AdherenceTrackingListFeatureProps) {
  return <GenericListFeature {...props} config={adherenceTrackingListConfig} />
}

export type { AdherenceTrackingListFeatureProps }