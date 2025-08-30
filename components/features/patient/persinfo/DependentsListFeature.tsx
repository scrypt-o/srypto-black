'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { dependentsListConfig } from '@/config/dependentsListConfig'
import type { DependentRow } from '@/schemas/dependents'

type SortBy = 'created_at' | 'full_name' | 'relationship' | 'date_of_birth'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  relationship?: string
  citizenship?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface DependentsListFeatureProps {
  initialData: DependentRow[]
  total: number
  initialState: ListState
}

export default function DependentsListFeature(props: DependentsListFeatureProps) {
  return <GenericListFeature {...props} config={dependentsListConfig} />
}

export type { DependentsListFeatureProps }