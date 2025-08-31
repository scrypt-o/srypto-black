import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Prescription row type (from DDL)
interface PrescriptionRow {
  prescription_id: string
  user_id: string
  image_url: string | null
  patient_name: string | null
  patient_surname: string | null
  dr_name: string | null
  dr_surname: string | null
  prescription_date: string | null
  condition_diagnosed: string | null
  medications_prescribed: any
  scan_quality_score: number | null
  status: string | null
  created_at: string
  updated_at: string | null
  is_active: boolean | null
}

// Prescription list item interface
interface PrescriptionItem extends ListItem {
  prescription_id: string
  patient_name: string | null
  condition_diagnosed: string | null
  prescription_date: string | null
  scan_quality_score: number | null
  status: string | null
  created_at: string
}

// Map prescription confidence to UI severity levels
const mapConfidence = (score: number | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!score) return 'normal'
  
  if (score >= 90) return 'normal'      // High confidence = normal (green)
  if (score >= 75) return 'mild'       // Good confidence = mild (blue)  
  if (score >= 60) return 'moderate'   // Medium confidence = moderate (yellow)
  if (score >= 40) return 'severe'     // Low confidence = severe (orange)
  return 'critical'                    // Very low confidence = critical (red)
}

// Transform database row to list item (prescription-specific field mappings)
const transformRowToItem = (row: PrescriptionRow): PrescriptionItem => ({
  id: row.prescription_id,
  prescription_id: row.prescription_id,
  title: `${row.patient_name || ''} ${row.patient_surname || ''}`.trim() || 'Prescription',
  letter: (row.patient_name?.slice(0, 1) || '') + (row.patient_surname?.slice(0, 1) || '') || 'RX',
  severity: mapConfidence(row.scan_quality_score),
  patient_name: row.patient_name,
  condition_diagnosed: row.condition_diagnosed,
  prescription_date: row.prescription_date,
  scan_quality_score: row.scan_quality_score,
  status: row.status,
  created_at: row.created_at,
  thirdColumn: row.prescription_date || row.created_at,
  data: row
})

// Export configuration (prescription-specific)
const exportRowMapper = (item: PrescriptionItem): string[] => [
  item.title,
  item.condition_diagnosed || '',
  item.prescription_date || '',
  item.scan_quality_score?.toString() || '',
  item.status || '',
  new Date(item.created_at).toLocaleDateString()
]

// Filter fields (from DDL status and confidence)
const filterFields = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'processed', label: 'Processed' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'completed', label: 'Completed' }
    ]
  }
]

// No delete hook - prescriptions cannot be deleted per specs
const mockDeleteHook = () => ({
  mutateAsync: async (id: string) => {
    throw new Error('Prescriptions cannot be deleted')
  },
  isPending: false
})

// Complete configuration object
export const prescriptionsListConfig: ListFeatureConfig<PrescriptionRow, PrescriptionItem> = {
  // Entity identification (from DDL)
  entityName: 'prescription',
  entityNamePlural: 'prescriptions',
  
  // Routing (from URL structure)
  basePath: '/patient/presc/active',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapConfidence,
  
  // Filtering (from status field)
  filterFields,
  
  // No delete functionality for prescriptions
  hooks: {
    useDelete: mockDeleteHook
  },
  
  // Display customization
  searchPlaceholder: 'Search prescriptions...',
  pageTitle: 'My Prescriptions',
  thirdColumnLabel: 'Date',
  exportFilename: (date) => `prescriptions-${date}.csv`,
  exportHeaders: ['Patient', 'Condition', 'Date', 'Confidence', 'Status', 'Scanned'],
  exportRowMapper
}

export type { PrescriptionItem, PrescriptionRow }