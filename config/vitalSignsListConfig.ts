import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { VitalSignRow, VitalStatus } from '@/schemas/vitalSigns'
import { getOverallVitalStatus, MeasurementContextEnum } from '@/schemas/vitalSigns'
import { useDeleteVitalSign } from '@/hooks/usePatientVitalSigns'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Vital sign-specific list item interface
interface VitalSignItem extends ListItem {
  vital_sign_id: string
  measurement_date: string | null
  measurement_context: string | null
  created_at: string
}

// Format vital sign reading for display
const formatVitalSignTitle = (row: VitalSignRow): string => {
  const measurements: string[] = []
  
  // Blood pressure
  if (row.systolic_bp && row.diastolic_bp) {
    measurements.push(`BP: ${row.systolic_bp}/${row.diastolic_bp}`)
  }
  
  // Heart rate
  if (row.heart_rate) {
    measurements.push(`HR: ${row.heart_rate}`)
  }
  
  // Temperature
  if (row.temperature) {
    measurements.push(`Temp: ${row.temperature}°C`)
  }
  
  // Oxygen saturation
  if (row.oxygen_saturation) {
    measurements.push(`O2: ${row.oxygen_saturation}%`)
  }
  
  // Respiratory rate
  if (row.respiratory_rate) {
    measurements.push(`RR: ${row.respiratory_rate}`)
  }
  
  // Blood glucose
  if (row.blood_glucose) {
    measurements.push(`Glucose: ${row.blood_glucose}`)
  }
  
  return measurements.length > 0 ? measurements.join(' | ') : 'Vital Signs Reading'
}

// Map vital status to UI severity levels (vital sign-specific business logic)
const mapSeverity = (status: VitalStatus): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  const statusMap: Record<VitalStatus, 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'> = {
    'critical': 'critical',
    'high': 'severe',
    'elevated': 'moderate',
    'low': 'mild',
    'normal': 'normal'
  }
  
  return statusMap[status] || 'normal'
}

// Transform database row to list item (vital sign-specific field mappings)
const transformRowToItem = (row: VitalSignRow): VitalSignItem => ({
  id: row.vital_sign_id,
  vital_sign_id: row.vital_sign_id,
  title: formatVitalSignTitle(row),
  letter: 'VS', // Default letter for vital signs
  severity: mapSeverity(getOverallVitalStatus(row)),
  thirdColumn: row.measurement_date || '',
  measurement_date: row.measurement_date,
  measurement_context: row.measurement_context,
  created_at: row.created_at,
  data: row
})

// Export configuration (vital sign-specific)
const exportRowMapper = (item: VitalSignItem): string[] => {
  const data = item.data
  return [
    data?.systolic_bp ? `${data.systolic_bp}/${data.diastolic_bp}` : '',
    data?.heart_rate?.toString() || '',
    data?.temperature?.toString() || '',
    data?.oxygen_saturation?.toString() || '',
    data?.respiratory_rate?.toString() || '',
    data?.blood_glucose?.toString() || '',
    item.measurement_context || '',
    item.measurement_date || '',
    new Date(item.created_at).toLocaleDateString()
  ]
}

// Complete configuration object - everything vital sign-specific in one place
export const vitalSignsListConfig: ListFeatureConfig<VitalSignRow, VitalSignItem> = {
  // Entity identification (from DDL)
  entityName: 'vital sign',
  entityNamePlural: 'vital signs',
  
  // Routing (from URL structure)
  basePath: '/patient/vitality/vital-signs',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapSeverity,
  
  // Filtering (from DDL enums and fields)
  filterFields: [
    {
      key: 'measurement_context',
      label: 'Context',
      options: MeasurementContextEnum.options.map(opt => ({
        value: opt,
        label: opt.replace('_', ' ')
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteVitalSign
  },
  
  // Display customization
  searchPlaceholder: 'Search vital signs...',
  pageTitle: 'Vital Signs',
  thirdColumnLabel: 'Date Measured',
  exportFilename: (date) => `vital-signs-${date}.csv`,
  exportHeaders: ['Blood Pressure', 'Heart Rate', 'Temperature', 'O2 Sat', 'Resp Rate', 'Glucose', 'Context', 'Date Measured', 'Date Added'],
  exportRowMapper
}

export type { VitalSignItem }