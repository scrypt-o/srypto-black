'use client'

import GenericListFeature from '@/components/layouts/GenericListFeature'
import { immunizationsListConfig } from '@/config/immunizationsListConfig'

interface ImmunizationsListFeatureProps {
  initialData: any[]
  total: number
  initialState: any
}

export default function ImmunizationsListFeature(props: ImmunizationsListFeatureProps) {
  return <GenericListFeature {...props} config={immunizationsListConfig} />
}