'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { vitalSignsListConfig } from '@/config/vitalSignsListConfig'
import type { VitalSignRow } from '@/schemas/vitalSigns'

type SortBy = 'created_at' | 'measurement_date' | 'systolic_bp' | 'heart_rate' | 'temperature'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  measurement_context?: string
  date_from?: string
  date_to?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface VitalSignsListFeatureProps {
  initialData: VitalSignRow[]
  total: number
  initialState: ListState
}

export default function VitalSignsListFeature(props: VitalSignsListFeatureProps) {
  return <GenericListFeature {...props} config={vitalSignsListConfig} />
}

export type { VitalSignsListFeatureProps }