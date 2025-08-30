'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { allergiesDetailConfig } from '@/config/allergiesDetailConfig'
import type { AllergyRow } from '@/schemas/allergies'

export type AllergyDetailFeatureProps = {
  allergy: AllergyRow
}

export default function AllergyDetailFeature({ allergy }: AllergyDetailFeatureProps) {
  return <GenericDetailFeature data={allergy} config={allergiesDetailConfig} />
}