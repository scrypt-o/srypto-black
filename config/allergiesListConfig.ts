import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { AllergyRow, Severity } from '@/schemas/allergies'
import { AllergenTypeEnum, SeverityEnum } from '@/schemas/allergies'
import { useDeleteAllergy } from '@/hooks/usePatientAllergies'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Allergy-specific list item interface
interface AllergyItem extends ListItem {
  allergy_id: string
  allergen: string
  allergen_type: string | null
  reaction: string | null
  created_at: string
}

// Map database severity to UI severity levels (allergy-specific business logic)
const mapSeverity = (severity: Severity | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!severity) return 'normal'
  
  const severityMap: Record<Severity, 'critical' | 'severe' | 'moderate' | 'mild'> = {
    'life_threatening': 'critical',
    'severe': 'severe',
    'moderate': 'moderate',
    'mild': 'mild'
  }
  
  return severityMap[severity] || 'normal'
}

// Transform database row to list item (allergy-specific field mappings)
const transformRowToItem = (row: AllergyRow): AllergyItem => ({
  id: row.allergy_id,
  allergy_id: row.allergy_id,
  title: row.allergen || 'Unknown',
  letter: row.allergen?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.severity),
  allergen: row.allergen || '',
  allergen_type: row.allergen_type,
  reaction: row.reaction,
  created_at: row.created_at,
  data: row
})

// Export configuration (allergy-specific)
const exportRowMapper = (item: AllergyItem): string[] => [
  item.allergen,
  (item.data?.severity as string | undefined) || '',
  item.allergen_type || '',
  item.reaction || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything allergy-specific in one place
export const allergiesListConfig: ListFeatureConfig<AllergyRow, AllergyItem> = {
  // Entity identification (from DDL)
  entityName: 'allergy',
  entityNamePlural: 'allergies',
  
  // Routing (from URL structure)
  basePath: '/patient/medhist/allergies',
  
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
        label: opt.replace('_', ' ')
      }))
    },
    {
      key: 'allergen_type', 
      label: 'Type',
      options: AllergenTypeEnum.options.map(opt => ({
        value: opt,
        label: opt
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteAllergy
  },
  
  // Display customization
  searchPlaceholder: 'Search allergies...',
  pageTitle: 'Allergies',
  thirdColumnLabel: 'Date Added',
  exportFilename: (date) => `allergies-${date}.csv`,
  exportHeaders: ['Allergen', 'Severity', 'Type', 'Reaction', 'Date Added'],
  exportRowMapper
}

export type { AllergyItem }