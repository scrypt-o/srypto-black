'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { familyHistoryListConfig } from '@/config/familyHistoryListConfig'
import type { FamilyHistoryRow } from '@/schemas/family-history'

type SortBy = 'created_at' | 'relative' | 'condition' | 'relationship'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  relationship?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface FamilyHistoryListFeatureProps {
  initialData: FamilyHistoryRow[]
  total: number
  initialState: ListState
}

export default function FamilyHistoryListFeature(props: FamilyHistoryListFeatureProps) {
  return <GenericListFeature {...props} config={familyHistoryListConfig} />
}

export type { FamilyHistoryListFeatureProps }