import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { SurgeryRow, Outcome } from '@/schemas/surgeries'
import { SurgeryTypeEnum, OutcomeEnum } from '@/schemas/surgeries'
import { useDeleteSurgery } from '@/hooks/usePatientSurgeries'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Surgery-specific list item interface
interface SurgeryItem extends ListItem {
  surgery_id: string
  surgery_name: string
  surgery_type: string | null
  surgeon_name: string | null
  surgery_date: string | null
  created_at: string
}

// Map database outcome to UI severity levels (surgery-specific business logic)
const mapSeverity = (outcome: Outcome | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!outcome) return 'normal'
  
  const outcomeMap: Record<Outcome, 'critical' | 'severe' | 'moderate' | 'mild'> = {
    'failed': 'critical',
    'complications': 'severe',
    'partial_success': 'moderate',
    'successful': 'mild'
  }
  
  return outcomeMap[outcome] || 'normal'
}

// Transform database row to list item (surgery-specific field mappings)
const transformRowToItem = (row: SurgeryRow): SurgeryItem => ({
  id: row.surgery_id,
  surgery_id: row.surgery_id,
  title: row.surgery_name || 'Unknown Surgery',
  letter: row.surgery_name?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.outcome),
  surgery_name: row.surgery_name || '',
  surgery_type: row.surgery_type,
  surgeon_name: row.surgeon_name,
  surgery_date: row.surgery_date,
  created_at: row.created_at,
  data: row
})

// Export configuration (surgery-specific)
const exportRowMapper = (item: SurgeryItem): string[] => [
  item.surgery_name,
  item.surgery_type || '',
  item.surgeon_name || '',
  item.surgery_date ? new Date(item.surgery_date).toLocaleDateString() : '',
  (item.data?.outcome as string | undefined) || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything surgery-specific in one place
export const surgeriesListConfig: ListFeatureConfig<SurgeryRow, SurgeryItem> = {
  // Entity identification (from DDL)
  entityName: 'surgery',
  entityNamePlural: 'surgeries',
  
  // Routing (from URL structure)
  basePath: '/patient/medhist/surgeries',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapSeverity,
  
  // Filtering (from DDL enums)
  filterFields: [
    {
      key: 'outcome',
      label: 'Outcome',
      options: OutcomeEnum.options.map(opt => ({
        value: opt,
        label: opt.replace('_', ' ')
      }))
    },
    {
      key: 'surgery_type', 
      label: 'Type',
      options: SurgeryTypeEnum.options.map(opt => ({
        value: opt,
        label: opt
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteSurgery
  },
  
  // Display customization
  searchPlaceholder: 'Search surgeries...',
  pageTitle: 'Surgeries',
  thirdColumnLabel: 'Date Added',
  exportFilename: (date) => `surgeries-${date}.csv`,
  exportHeaders: ['Surgery', 'Type', 'Surgeon', 'Date', 'Outcome', 'Date Added'],
  exportRowMapper
}

export type { SurgeryItem }