import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Active medication row type (from expected DDL)
interface ActiveMedicationRow {
  medication_id: string
  user_id: string
  medication_name: string | null
  dosage: string | null
  frequency: string | null
  route: string | null
  start_date: string | null
  end_date: string | null
  prescriber: string | null
  status: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  is_active: boolean | null
}

// Active medication list item interface
interface ActiveMedicationItem extends ListItem {
  medication_id: string
  medication_name: string | null
  dosage: string | null
  frequency: string | null
  route: string | null
  status: string | null
  created_at: string
}

// Map medication status to UI severity levels
const mapStatus = (status: string | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!status) return 'normal'
  
  switch (status.toLowerCase()) {
    case 'active': return 'normal'        // Green - currently taking
    case 'paused': return 'mild'         // Blue - temporarily stopped
    case 'completed': return 'moderate'   // Yellow - finished course
    case 'discontinued': return 'severe'  // Orange - stopped due to issues
    default: return 'normal'
  }
}

// Transform database row to list item (active medication field mappings)
const transformRowToItem = (row: ActiveMedicationRow): ActiveMedicationItem => ({
  id: row.medication_id,
  medication_id: row.medication_id,
  title: row.medication_name || 'Unknown Medication',
  letter: row.medication_name?.slice(0, 2).toUpperCase() || 'MX',
  severity: mapStatus(row.status),
  medication_name: row.medication_name,
  dosage: row.dosage,
  frequency: row.frequency,
  route: row.route,
  status: row.status,
  created_at: row.created_at,
  thirdColumn: row.frequency || 'As needed',
  data: row
})

// Export configuration (medication-specific)
const exportRowMapper = (item: ActiveMedicationItem): string[] => [
  item.medication_name || '',
  item.dosage || '',
  item.frequency || '',
  item.route || '',
  item.status || '',
  new Date(item.created_at).toLocaleDateString()
]

// Filter fields for medication management
const filterFields = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'paused', label: 'Paused' },
      { value: 'completed', label: 'Completed' },
      { value: 'discontinued', label: 'Discontinued' }
    ]
  },
  {
    key: 'route',
    label: 'Route',
    options: [
      { value: 'oral', label: 'Oral' },
      { value: 'topical', label: 'Topical' },
      { value: 'injection', label: 'Injection' },
      { value: 'inhaled', label: 'Inhaled' },
      { value: 'sublingual', label: 'Sublingual' }
    ]
  }
]

// Mock delete hook (implement based on business rules)
const useDeleteActiveMedication = () => ({
  mutateAsync: async (id: string) => {
    const response = await fetch(`/api/patient/medications/active/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    })
    if (!response.ok) throw new Error('Delete failed')
  },
  isPending: false
})

// Complete configuration object
export const activeMedicationsListConfig: ListFeatureConfig<ActiveMedicationRow, ActiveMedicationItem> = {
  // Entity identification
  entityName: 'medication',
  entityNamePlural: 'medications',
  
  // Routing
  basePath: '/patient/medications/active',
  
  // Data transformation
  transformRowToItem,
  severityMapping: mapStatus,
  
  // Filtering
  filterFields,
  
  // Hooks  
  hooks: {
    useDelete: useDeleteActiveMedication
  },
  
  // Display customization
  searchPlaceholder: 'Search medications...',
  pageTitle: 'Active Medications',
  thirdColumnLabel: 'Frequency',
  exportFilename: (date) => `active-medications-${date}.csv`,
  exportHeaders: ['Medication', 'Dosage', 'Frequency', 'Route', 'Status', 'Started'],
  exportRowMapper
}

export type { ActiveMedicationItem, ActiveMedicationRow }