import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { ImmunizationRow, InjectionSite, AdministrationRoute } from '@/schemas/immunizations'
import { InjectionSiteEnum, AdministrationRouteEnum } from '@/schemas/immunizations'
import { useDeleteImmunization } from '@/hooks/usePatientImmunizations'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Immunization-specific list item interface
interface ImmunizationItem extends ListItem {
  immunization_id: string
  vaccine_name: string
  date_given: string | null
  provider_name: string | null
  created_at: string
}

// Map status to UI severity levels (immunization-specific business logic)
const mapSeverity = (dateGiven: string | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (!dateGiven) return 'normal'
  
  const givenDate = new Date(dateGiven)
  const now = new Date()
  const monthsAgo = (now.getTime() - givenDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  
  // Map by recency (recent = higher priority)
  if (monthsAgo <= 1) return 'critical'  // Very recent
  if (monthsAgo <= 6) return 'moderate'  // Recent
  if (monthsAgo <= 12) return 'mild'     // Within year
  return 'normal'                        // Older
}

// Transform database row to list item (immunization-specific field mappings)
const transformRowToItem = (row: ImmunizationRow): ImmunizationItem => ({
  id: row.immunization_id,
  immunization_id: row.immunization_id,
  title: row.vaccine_name || 'Unknown Vaccine',
  letter: row.vaccine_name?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.date_given),
  vaccine_name: row.vaccine_name || '',
  date_given: row.date_given,
  provider_name: row.provider_name,
  created_at: row.created_at,
  data: row
})

// Export configuration (immunization-specific)
const exportRowMapper = (item: ImmunizationItem): string[] => [
  item.vaccine_name,
  item.date_given ? new Date(item.date_given).toLocaleDateString() : '',
  item.provider_name || '',
  (item.data?.site as string | undefined) || '',
  (item.data?.route as string | undefined) || '',
  (item.data?.batch_number as string | undefined) || '',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything immunization-specific in one place
export const immunizationsListConfig: ListFeatureConfig<ImmunizationRow, ImmunizationItem> = {
  // Entity identification (from DDL)
  entityName: 'immunization',
  entityNamePlural: 'immunizations',
  
  // Routing (from URL structure)
  basePath: '/patient/medhist/immunizations',
  
  // Data transformation (from DDL field mappings)
  transformRowToItem,
  severityMapping: mapSeverity,
  
  // Filtering (from DDL enums)
  filterFields: [
    {
      key: 'site',
      label: 'Site',
      options: InjectionSiteEnum.options.map((opt: string) => ({
        value: opt,
        label: opt.replace('_', ' ')
      }))
    },
    {
      key: 'route', 
      label: 'Route',
      options: AdministrationRouteEnum.options.map((opt: string) => ({
        value: opt,
        label: opt.replace('_', ' ')
      }))
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteImmunization
  },
  
  // Display customization
  searchPlaceholder: 'Search immunizations...',
  pageTitle: 'Immunizations',
  thirdColumnLabel: 'Date Given',
  exportFilename: (date) => `immunizations-${date}.csv`,
  exportHeaders: ['Vaccine', 'Date Given', 'Provider', 'Site', 'Route', 'Batch', 'Date Added'],
  exportRowMapper
}

export type { ImmunizationItem }