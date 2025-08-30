'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { dependentsDetailConfig } from '@/config/dependentsDetailConfig'
import type { DependentRow } from '@/schemas/dependents'

export type DependentDetailFeatureProps = {
  dependent: DependentRow
}

export default function DependentDetailFeature({ dependent }: DependentDetailFeatureProps) {
  return <GenericDetailFeature data={dependent} config={dependentsDetailConfig} />
}