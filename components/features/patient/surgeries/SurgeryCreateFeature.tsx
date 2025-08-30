'use client'

import GenericDetailFeature from '@/components/layouts/GenericDetailFeature'
import { surgeriesDetailConfig } from '@/config/surgeriesDetailConfig'
import type { SurgeryRow } from '@/schemas/surgeries'

export default function SurgeryCreateFeature() {
  // Create empty surgery object for new surgery form
  const emptySurgery: SurgeryRow = {
    surgery_id: '',
    user_id: '',
    surgery_name: null,
    surgery_type: null,
    surgery_date: null,
    hospital_name: null,
    surgeon_name: null,
    surgeon_practice_number: null,
    anesthetist_name: null,
    procedure_code: null,
    complications: null,
    recovery_notes: null,
    outcome: null,
    related_condition_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  return <GenericDetailFeature data={emptySurgery} config={surgeriesDetailConfig} />
}