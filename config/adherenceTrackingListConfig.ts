import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Adherence tracking row type  
interface AdherenceTrackingRow {
  adherence_id: string
  user_id: string
  medication_id: string | null
  medication_name: string | null
  scheduled_time: string | null
  actual_time: string | null
  status: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  is_active: boolean | null
}

// Adherence tracking list item interface
interface AdherenceTrackingItem extends ListItem {
  adherence_id: string
  medication_name: string | null
  scheduled_time: string | null
  actual_time: string | null
  status: string | null
  created_at: string
}

// Map adherence status to UI severity levels
const mapAdherenceStatus = (status: string | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!status) return 'normal'
  
  switch (status.toLowerCase()) {
    case 'taken': return 'normal'      // Green - taken on time
    case 'taken_late': return 'mild'   // Blue - taken but late
    case 'taken_early': return 'mild'  // Blue - taken but early
    case 'missed': return 'severe'     // Orange - missed dose
    case 'skipped': return 'moderate'  // Yellow - intentionally skipped
    default: return 'normal'
  }
}

// Transform database row to list item
const transformRowToItem = (row: AdherenceTrackingRow): AdherenceTrackingItem => ({
  id: row.adherence_id,
  adherence_id: row.adherence_id,
  title: row.medication_name || 'Unknown Medication',
  letter: row.medication_name?.slice(0, 2).toUpperCase() || 'AD',
  severity: mapAdherenceStatus(row.status),
  medication_name: row.medication_name,
  scheduled_time: row.scheduled_time,
  actual_time: row.actual_time,
  status: row.status,
  created_at: row.created_at,
  thirdColumn: row.status || 'Unknown',
  data: row
})

// Export configuration
const exportRowMapper = (item: AdherenceTrackingItem): string[] => [
  item.medication_name || '',
  item.scheduled_time || '',
  item.actual_time || '',
  item.status || '',
  new Date(item.created_at).toLocaleDateString()
]

// Filter fields for adherence analysis
const filterFields = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'taken', label: 'Taken' },
      { value: 'taken_late', label: 'Taken Late' },
      { value: 'taken_early', label: 'Taken Early' },
      { value: 'missed', label: 'Missed' },
      { value: 'skipped', label: 'Skipped' }
    ]
  }
]

// Delete hook for adherence records
const useDeleteAdherenceRecord = () => ({
  mutateAsync: async (id: string) => {
    const response = await fetch(`/api/patient/medications/adherence/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    })
    if (!response.ok) throw new Error('Delete failed')
  },
  isPending: false
})

// Complete configuration object
export const adherenceTrackingListConfig: ListFeatureConfig<AdherenceTrackingRow, AdherenceTrackingItem> = {
  // Entity identification
  entityName: 'adherence record',
  entityNamePlural: 'adherence tracking',
  
  // Routing
  basePath: '/patient/medications/adherence',
  
  // Data transformation
  transformRowToItem,
  severityMapping: mapAdherenceStatus,
  
  // Filtering
  filterFields,
  
  // Hooks
  hooks: {
    useDelete: useDeleteAdherenceRecord
  },
  
  // Display customization
  searchPlaceholder: 'Search adherence records...',
  pageTitle: 'Medication Adherence',
  thirdColumnLabel: 'Status',
  exportFilename: (date) => `medication-adherence-${date}.csv`,
  exportHeaders: ['Medication', 'Scheduled', 'Actual', 'Status', 'Recorded'],
  exportRowMapper
}

export type { AdherenceTrackingItem, AdherenceTrackingRow }