'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { allergiesListConfig } from '@/config/allergiesListConfig'
import type { AllergyRow } from '@/schemas/allergies'

type SortBy = 'created_at' | 'allergen' | 'severity' | 'allergen_type'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  allergen_type?: string
  severity?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface AllergiesListFeatureProps {
  initialData: AllergyRow[]
  total: number
  initialState: ListState
}

export default function AllergiesListFeature(props: AllergiesListFeatureProps) {
  return <GenericListFeature {...props} config={allergiesListConfig} />
}

export type { AllergiesListFeatureProps }