import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ConditionRow, Severity, CurrentStatus } from '@/schemas/conditions'
import { SeverityEnum, CurrentStatusEnum } from '@/schemas/conditions'
import { useDeleteCondition } from '@/hooks/usePatientConditions'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Condition-specific list item interface
interface ConditionItem extends ListItem {
  condition_id: string
  condition_name: string
  current_status: string | null
  created_at: string
}

// Map database severity to UI severity levels (condition-specific business logic)
const mapSeverity = (severity: any): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!severity) return 'normal'
  
  const severityMap: Record<Severity, 'critical' | 'severe' | 'moderate' | 'mild'> = {
    'critical': 'critical',
    'severe': 'severe', 
    'moderate': 'moderate',
    'mild': 'mild'
  }
  
  return severityMap[severity as Severity] || 'normal'
}

// Transform database row to list item (condition-specific field mappings)
const transformRowToItem = (row: ConditionRow): ConditionItem => ({
  id: row.condition_id,
  condition_id: row.condition_id,
  title: row.condition_name || 'Unknown Condition',
  letter: row.condition_name?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.severity),
  condition_name: row.condition_name || '',
  current_status: row.current_status,
  created_at: row.created_at,
  data: row
})

// Export configuration (condition-specific)
const exportRowMapper = (item: ConditionItem): string[] => [
  item.condition_name,
  (item.data?.severity as string | undefined) || '',
  item.current_status || '',
  (item.data?.treatment as string | undefined) || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything condition-specific in one place
export const conditionsListConfig: ListFeatureConfig<ConditionRow, ConditionItem> = {
  // Entity identification (from DDL)
  entityName: 'condition',
  entityNamePlural: 'conditions',
  
  // Routing (from URL structure)
  basePath: '/patient/medhist/conditions',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapSeverity,
  
  // Filtering (from DDL enums)
  filterFields: [
    {
      key: 'severity',
      label: 'Severity',
      options: SeverityEnum.options.map(opt => ({
        value: opt,
        label: opt
      }))
    },
    {
      key: 'current_status',
      label: 'Status', 
      options: CurrentStatusEnum.options.map(opt => ({
        value: opt,
        label: opt
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteCondition
  },
  
  // Display customization
  searchPlaceholder: 'Search conditions...',
  pageTitle: 'Medical Conditions',
  thirdColumnLabel: 'Date Added',
  exportFilename: (date) => `conditions-${date}.csv`,
  exportHeaders: ['Condition', 'Severity', 'Status', 'Treatment', 'Date Added'],
  exportRowMapper
}

export type { ConditionItem }