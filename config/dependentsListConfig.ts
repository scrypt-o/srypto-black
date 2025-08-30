import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { DependentRow, Relationship } from '@/schemas/dependents'
import { RelationshipEnum } from '@/schemas/dependents'
import { useDeleteDependent } from '@/hooks/usePatientDependents'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Dependent-specific list item interface
interface DependentItem extends ListItem {
  dependent_id: string
  full_name: string
  relationship: string | null
  date_of_birth: string | null
  created_at: string
}

// Map database relationship to UI severity levels (dependent-specific business logic)
const mapSeverity = (relationship: Relationship | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!relationship) return 'normal'
  
  // For dependents, we'll use relationship importance as "severity"
  const relationshipMap: Record<Relationship, 'critical' | 'severe' | 'moderate' | 'mild' | 'normal'> = {
    'spouse': 'critical',      // Highest priority
    'child': 'critical',       // Highest priority
    'parent': 'severe',        // High priority
    'guardian': 'severe',      // High priority
    'partner': 'moderate',     // Medium priority
    'sibling': 'mild',         // Lower priority
    'other': 'normal'          // Lowest priority
  }
  
  return relationshipMap[relationship] || 'normal'
}

// Transform database row to list item (dependent-specific field mappings)
const transformRowToItem = (row: DependentRow): DependentItem => ({
  id: row.dependent_id,
  dependent_id: row.dependent_id,
  title: row.full_name || 'Unknown',
  letter: row.full_name?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.relationship as Relationship | null),
  full_name: row.full_name || '',
  relationship: row.relationship,
  date_of_birth: row.date_of_birth,
  created_at: row.created_at,
  data: row
})

// Export configuration (dependent-specific)
const exportRowMapper = (item: DependentItem): string[] => [
  item.full_name,
  item.relationship || '',
  item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString() : '',
  (item.data?.id_number as string | undefined) || '',
  (item.data?.medical_aid_number as string | undefined) || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything dependent-specific in one place
export const dependentsListConfig: ListFeatureConfig<DependentRow, DependentItem> = {
  // Entity identification (from DDL)
  entityName: 'dependent',
  entityNamePlural: 'dependents',
  
  // Routing (from URL structure)
  basePath: '/patient/persinfo/dependents',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapSeverity,
  
  // Filtering (from DDL enums)
  filterFields: [
    {
      key: 'relationship',
      label: 'Relationship',
      options: RelationshipEnum.options.map(opt => ({
        value: opt,
        label: opt.charAt(0).toUpperCase() + opt.slice(1)
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteDependent
  },
  
  // Display customization
  searchPlaceholder: 'Search dependents...',
  pageTitle: 'Dependents',
  thirdColumnLabel: 'Date Added',
  exportFilename: (date) => `dependents-${date}.csv`,
  exportHeaders: ['Full Name', 'Relationship', 'Date of Birth', 'ID Number', 'Medical Aid Number', 'Date Added'],
  exportRowMapper
}

export type { DependentItem }