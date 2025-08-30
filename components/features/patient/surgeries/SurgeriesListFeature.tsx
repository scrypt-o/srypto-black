'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { surgeriesListConfig } from '@/config/surgeriesListConfig'
import type { SurgeryRow } from '@/schemas/surgeries'

type SortBy = 'created_at' | 'surgery_name' | 'surgery_date' | 'surgery_type' | 'outcome'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  surgery_type?: string
  outcome?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface SurgeriesListFeatureProps {
  initialData: SurgeryRow[]
  total: number
  initialState: ListState
}

export default function SurgeriesListFeature(props: SurgeriesListFeatureProps) {
  return <GenericListFeature {...props} config={surgeriesListConfig} />
}

export type { SurgeriesListFeatureProps }