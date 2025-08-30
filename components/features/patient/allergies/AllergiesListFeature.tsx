'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { allergiesListConfig } from '@/config/allergiesListConfig'
import type { AllergyRow } from '@/schemas/allergies'

interface ListState {
  page: number
  pageSize: number
  search?: string
  allergen_type?: string
  severity?: string
  sort_by: string
  sort_dir: string
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