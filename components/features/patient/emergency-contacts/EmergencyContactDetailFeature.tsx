'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { emergencyContactsDetailConfig } from '@/config/emergencyContactsDetailConfig'
import type { EmergencyContactRow } from '@/schemas/emergencyContacts'

export type EmergencyContactDetailFeatureProps = {
  emergencyContact: EmergencyContactRow
}

export default function EmergencyContactDetailFeature({ emergencyContact }: EmergencyContactDetailFeatureProps) {
  return <GenericDetailFeature data={emergencyContact} config={emergencyContactsDetailConfig} />
}