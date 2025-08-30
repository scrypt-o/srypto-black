'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { emergencyContactsListConfig } from '@/config/emergencyContactsListConfig'
import type { EmergencyContactRow } from '@/schemas/emergencyContacts'

type SortBy = 'created_at' | 'name' | 'relationship' | 'is_primary'
type SortDir = 'asc' | 'desc'

interface ListState {
  page: number
  pageSize: number
  search?: string
  relationship?: string
  is_primary?: boolean
  sort_by: SortBy
  sort_dir: SortDir
}

interface EmergencyContactsListFeatureProps {
  initialData: EmergencyContactRow[]
  total: number
  initialState: ListState
}

export default function EmergencyContactsListFeature(props: EmergencyContactsListFeatureProps) {
  return <GenericListFeature {...props} config={emergencyContactsListConfig} />
}

export type { EmergencyContactsListFeatureProps }