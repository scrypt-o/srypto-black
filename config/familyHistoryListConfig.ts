import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { FamilyHistoryRow, Relationship } from '@/schemas/family-history'
import { RelationshipEnum } from '@/schemas/family-history'
import { useDeleteFamilyHistory } from '@/hooks/usePatientFamilyHistory'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Family history-specific list item interface
interface FamilyHistoryItem extends ListItem {
  family_history_id: string
  relative: string
  condition: string
  relationship: string | null
  age_at_onset: number | null
  created_at: string
}

// Map relationship to readable label (family history-specific business logic)
const mapRelationshipLabel = (relationship: string | null): string => {
  if (!relationship) return 'Unknown'
  
  const relationshipLabelMap: Record<string, string> = {
    'parent': 'Parent',
    'sibling': 'Sibling',
    'grandparent': 'Grandparent',
    'child': 'Child',
    'aunt': 'Aunt',
    'uncle': 'Uncle',
    'cousin': 'Cousin'
  }
  
  return relationshipLabelMap[relationship] || relationship
}

// Map genetic risk assessment to UI severity (family history-specific logic)
const mapGeneticRisk = (relationship: string | null, ageAtOnset: number | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!relationship) return 'normal'
  
  // Basic genetic risk assessment based on relationship closeness and age of onset
  const isCloseRelative = ['parent', 'sibling', 'child'].includes(relationship)
  const isEarlyOnset = ageAtOnset && ageAtOnset < 50
  
  if (isCloseRelative && isEarlyOnset) return 'critical'
  if (isCloseRelative) return 'severe'
  if (['grandparent', 'aunt', 'uncle'].includes(relationship) && isEarlyOnset) return 'moderate'
  if (['grandparent', 'aunt', 'uncle'].includes(relationship)) return 'mild'
  
  return 'normal'
}

// Transform database row to list item (family history-specific field mappings)
const transformRowToItem = (row: FamilyHistoryRow): FamilyHistoryItem => ({
  id: row.family_history_id,
  family_history_id: row.family_history_id,
  title: `${row.relative || 'Unknown'} - ${row.condition || 'Unknown condition'}`,
  letter: row.relative?.slice(0, 2).toUpperCase() || '??',
  severity: mapGeneticRisk(row.relationship, row.age_at_onset),
  thirdColumn: mapRelationshipLabel(row.relationship),
  relative: row.relative || '',
  condition: row.condition || '',
  relationship: row.relationship,
  age_at_onset: row.age_at_onset,
  created_at: row.created_at,
  data: row
})

// Export configuration (family history-specific)
const exportRowMapper = (item: FamilyHistoryItem): string[] => [
  item.relative,
  item.condition,
  mapRelationshipLabel(item.relationship),
  item.age_at_onset?.toString() || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything family history-specific in one place
export const familyHistoryListConfig: ListFeatureConfig<FamilyHistoryRow, FamilyHistoryItem> = {
  // Entity identification (from DDL)
  entityName: 'family history record',
  entityNamePlural: 'family history',
  
  // Routing (from URL structure)
  basePath: '/patient/medhist/family-history',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: (relationship: string | null, ageAtOnset?: number | null) => mapGeneticRisk(relationship, ageAtOnset || null),
  
  // Filtering (from DDL enums)
  filterFields: [
    {
      key: 'relationship',
      label: 'Relationship',
      options: RelationshipEnum.options.map(opt => ({
        value: opt,
        label: mapRelationshipLabel(opt)
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteFamilyHistory
  },
  
  // Display customization
  searchPlaceholder: 'Search family history...',
  pageTitle: 'Family History',
  thirdColumnLabel: 'Relationship',
  exportFilename: (date) => `family-history-${date}.csv`,
  exportHeaders: ['Relative', 'Condition', 'Relationship', 'Age at Onset', 'Date Added'],
  exportRowMapper
}

export type { FamilyHistoryItem }
