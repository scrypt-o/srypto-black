import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Medication history row type (legacy records)
interface MedicationHistoryRow {
  history_id: string
  user_id: string
  medication_name: string | null
  taken_period: string | null
  reason: string | null
  effectiveness: string | null
  side_effects: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  is_active: boolean | null
}

// Medication history list item interface
interface MedicationHistoryItem extends ListItem {
  history_id: string
  medication_name: string | null
  taken_period: string | null
  reason: string | null
  effectiveness: string | null
  created_at: string
}

// Map effectiveness to UI severity levels
const mapEffectiveness = (effectiveness: string | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!effectiveness) return 'normal'
  
  switch (effectiveness.toLowerCase()) {
    case 'very_effective': return 'normal'     // Green - worked well
    case 'effective': return 'mild'           // Blue - worked okay
    case 'somewhat_effective': return 'moderate' // Yellow - mixed results
    case 'not_effective': return 'severe'     // Orange - didn't work
    case 'adverse_reaction': return 'critical' // Red - bad reaction
    default: return 'normal'
  }
}

// Transform database row to list item
const transformRowToItem = (row: MedicationHistoryRow): MedicationHistoryItem => ({
  id: row.history_id,
  history_id: row.history_id,
  title: row.medication_name || 'Unknown Medication',
  letter: row.medication_name?.slice(0, 2).toUpperCase() || 'MH',
  severity: mapEffectiveness(row.effectiveness),
  medication_name: row.medication_name,
  taken_period: row.taken_period,
  reason: row.reason,
  effectiveness: row.effectiveness,
  created_at: row.created_at,
  thirdColumn: row.taken_period || 'Unknown period',
  data: row
})

// Export configuration
const exportRowMapper = (item: MedicationHistoryItem): string[] => [
  item.medication_name || '',
  item.taken_period || '',
  item.reason || '',
  item.effectiveness || '',
  new Date(item.created_at).toLocaleDateString()
]

// Filter fields for history records
const filterFields = [
  {
    key: 'effectiveness',
    label: 'Effectiveness',
    options: [
      { value: 'very_effective', label: 'Very Effective' },
      { value: 'effective', label: 'Effective' },
      { value: 'somewhat_effective', label: 'Somewhat Effective' },
      { value: 'not_effective', label: 'Not Effective' },
      { value: 'adverse_reaction', label: 'Adverse Reaction' }
    ]
  }
]

// Delete hook for history records
const useDeleteMedicationHistory = () => ({
  mutateAsync: async (id: string) => {
    const response = await fetch(`/api/patient/medications/history/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    })
    if (!response.ok) throw new Error('Delete failed')
  },
  isPending: false
})

// Complete configuration object
export const medicationHistoryListConfig: ListFeatureConfig<MedicationHistoryRow, MedicationHistoryItem> = {
  // Entity identification
  entityName: 'medication history record',
  entityNamePlural: 'medication history',
  
  // Routing
  basePath: '/patient/medications/history',
  
  // Data transformation
  transformRowToItem,
  severityMapping: mapEffectiveness,
  
  // Filtering
  filterFields,
  
  // Hooks
  hooks: {
    useDelete: useDeleteMedicationHistory
  },
  
  // Display customization
  searchPlaceholder: 'Search medication history...',
  pageTitle: 'Medication History',
  thirdColumnLabel: 'Period Taken',
  exportFilename: (date) => `medication-history-${date}.csv`,
  exportHeaders: ['Medication', 'Period Taken', 'Reason', 'Effectiveness', 'Recorded'],
  exportRowMapper
}

export type { MedicationHistoryItem, MedicationHistoryRow }