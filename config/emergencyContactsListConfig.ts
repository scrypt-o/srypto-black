import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { EmergencyContactRow, Relationship } from '@/schemas/emergencyContacts'
import { RelationshipEnum } from '@/schemas/emergencyContacts'
import { useDeleteEmergencyContact } from '@/hooks/usePatientEmergencyContacts'
import type { ListItem } from '@/components/layouts/ListViewLayout'

// Emergency contact-specific list item interface
interface EmergencyContactItem extends ListItem {
  contact_id: string
  name: string
  relationship: string | null
  phone: string | null
  email: string | null
  is_primary: boolean | null
  created_at: string
}

// Map is_primary to UI severity levels (emergency contact-specific business logic)
const mapSeverity = (is_primary: boolean | null): 'critical' | 'severe' | 'moderate' | 'mild' | 'normal' => {
  if (is_primary) return 'critical' // Primary contacts are critical
  return 'normal' // Non-primary contacts are normal priority
}

// Transform database row to list item (emergency contact-specific field mappings)
const transformRowToItem = (row: EmergencyContactRow): EmergencyContactItem => ({
  id: row.contact_id,
  contact_id: row.contact_id,
  title: row.name || 'Unknown Contact',
  letter: row.name?.slice(0, 2).toUpperCase() || '??',
  severity: mapSeverity(row.is_primary),
  name: row.name || '',
  relationship: row.relationship,
  phone: row.phone,
  email: row.email,
  is_primary: row.is_primary,
  created_at: row.created_at,
  data: row
})

// Export configuration (emergency contact-specific)
const exportRowMapper = (item: EmergencyContactItem): string[] => [
  item.name,
  item.relationship || '',
  item.phone || '',
  item.email || '',
  item.is_primary ? 'Yes' : 'No',
  new Date(item.created_at).toLocaleDateString()
]

// Complete configuration object - everything emergency contact-specific in one place
export const emergencyContactsListConfig: ListFeatureConfig<EmergencyContactRow, EmergencyContactItem> = {
  // Entity identification (from DDL)
  entityName: 'emergency contact',
  entityNamePlural: 'emergency contacts',
  
  // Routing (from URL structure)
  basePath: '/patient/persinfo/emergency-contacts',
  
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
    },
    {
      key: 'is_primary',
      label: 'Contact Type',
      options: [
        { value: 'true', label: 'Primary Contact' },
        { value: 'false', label: 'Secondary Contact' }
      ]
    }
  ],
  
  // Hooks (from domain-specific hooks file)
  hooks: {
    useDelete: useDeleteEmergencyContact
  },
  
  // Display customization
  searchPlaceholder: 'Search emergency contacts...',
  pageTitle: 'Emergency Contacts',
  thirdColumnLabel: 'Date Added',
  exportFilename: (date) => `emergency-contacts-${date}.csv`,
  exportHeaders: ['Name', 'Relationship', 'Phone', 'Email', 'Primary', 'Date Added'],
  exportRowMapper
}

export type { EmergencyContactItem }