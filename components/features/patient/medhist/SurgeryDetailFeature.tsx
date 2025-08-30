'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { surgeriesDetailConfig } from '@/config/surgeriesDetailConfig'
import type { SurgeryRow } from '@/schemas/surgeries'

export type SurgeryDetailFeatureProps = {
  surgery: SurgeryRow
}

export default function SurgeryDetailFeature({ surgery }: SurgeryDetailFeatureProps) {
  return <GenericDetailFeature data={surgery} config={surgeriesDetailConfig} />
}