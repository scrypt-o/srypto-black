'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { caregiversListConfig } from '@/config/caregiversListConfig'
import type { CaregiverRow } from '@/schemas/caregivers'

type SortBy = 'created_at' | 'first_name' | 'last_name' | 'relationship' | 'access_level'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  relationship?: string
  access_level?: string
  emergency_contact?: string
  sort_by: SortBy
  sort_dir: SortDir
}

interface CaregiversListFeatureProps {
  initialData: CaregiverRow[]
  total: number
  initialState: ListState
}

export default function CaregiversListFeature(props: CaregiversListFeatureProps) {
  return <GenericListFeature {...props} config={caregiversListConfig} />
}

export type { CaregiversListFeatureProps }