'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { prescriptionsListConfig } from '@/config/prescriptionsListConfig'
import type { PrescriptionRow } from '@/config/prescriptionsListConfig'

interface ListState {
  page: number
  pageSize: number
  search?: string
  status?: string
  sort_by: string
  sort_dir: string
}

interface PrescriptionsListFeatureProps {
  initialData: PrescriptionRow[]
  total: number
  initialState: ListState
}

export default function PrescriptionsListFeature(props: PrescriptionsListFeatureProps) {
  return <GenericListFeature {...props} config={prescriptionsListConfig} />
}

export type { PrescriptionsListFeatureProps }