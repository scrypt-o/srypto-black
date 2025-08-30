import type { ListFeatureConfig } from '@/components/layouts/GenericListFeature'
import type { CaregiverRow, CaregiverItem } from '@/schemas/caregivers'
import { RelationshipEnum, AccessLevelEnum, EmergencyContactEnum, mapAccessLevelToSeverity } from '@/schemas/caregivers'
import { useDeleteCaregiver } from '@/hooks/usePatientCaregivers'

export const caregiversListConfig: ListFeatureConfig<CaregiverRow, CaregiverItem> = {
  entityName: 'caregiver',
  entityNamePlural: 'caregivers',
  basePath: '/patient/care-network/caregivers',
  
  transformRowToItem: (row: CaregiverRow): CaregiverItem => {
    // Create full name from available parts
    const nameParts = [row.first_name, row.last_name].filter(Boolean)
    const fullName = nameParts.join(' ') || 'Unknown Caregiver'
    
    // Create initials from first and last name
    const firstInitial = row.first_name?.slice(0, 1)?.toUpperCase() || ''
    const lastInitial = row.last_name?.slice(0, 1)?.toUpperCase() || ''
    const initials = (firstInitial + lastInitial) || '??'
    
    return {
      id: row.caregiver_id,
      title: fullName,
      letter: initials,
      severity: mapAccessLevelToSeverity(row.access_level),
      thirdColumn: row.relationship || 'Not specified',
      data: row
    }
  },
  
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
      key: 'access_level',
      label: 'Access Level', 
      options: AccessLevelEnum.options.map(opt => ({ 
        value: opt, 
        label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
      }))
    },
    {
      key: 'emergency_contact',
      label: 'Emergency Contact',
      options: EmergencyContactEnum.options.map(opt => ({
        value: opt,
        label: opt.charAt(0).toUpperCase() + opt.slice(1)
      }))
    }
  ],
  
  hooks: { 
    useDelete: useDeleteCaregiver 
  },
  
  searchPlaceholder: 'Search caregivers by name, relationship...',
  pageTitle: 'Caregivers',
  thirdColumnLabel: 'Relationship'
}