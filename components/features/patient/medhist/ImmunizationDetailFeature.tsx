'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { immunizationsDetailConfig } from '@/config/immunizationsDetailConfig'

interface ImmunizationDetailFeatureProps {
  immunization: any
}

export default function ImmunizationDetailFeature({ immunization }: ImmunizationDetailFeatureProps) {
  return <GenericDetailFeature data={immunization} config={immunizationsDetailConfig} />
}