'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  EmergencyContactRow, 
  EmergencyContactCreateInput, 
  EmergencyContactUpdateInput,
  EmergencyContactListResponse 
} from '@/schemas/emergencyContacts'

// Query keys for TanStack Query
export const EmergencyContactKeys = {
  all: ['emergency-contacts'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; relationship?: string; is_primary?: boolean }) => 
    ['emergency-contacts', 'list', params] as const,
  detail: (id: string) => ['emergency-contacts', 'detail', id] as const,
}

// Hook to fetch list of emergency contacts
export function useEmergencyContactsList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  relationship?: string;
  is_primary?: boolean;
  sort_by?: 'created_at' | 'name' | 'relationship' | 'is_primary'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.relationship && { relationship: params.relationship }),
    ...(params?.is_primary !== undefined && { is_primary: String(params.is_primary) }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<EmergencyContactListResponse>({
    queryKey: EmergencyContactKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/persinfo/emergency-contacts?${queryString}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
  })
}

// Hook to fetch single emergency contact by ID
export function useEmergencyContactById(id: string) {
  return useQuery<EmergencyContactRow>({
    queryKey: EmergencyContactKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/persinfo/emergency-contacts/${id}`, {
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook to create new emergency contact
export function useCreateEmergencyContact() {
  const queryClient = useQueryClient()
  
  return useMutation<EmergencyContactRow, Error, EmergencyContactCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/persinfo/emergency-contacts', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Emergency contact created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] })
    },
  })
}

// Hook to update existing emergency contact
export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient()
  
  return useMutation<EmergencyContactRow, Error, { id: string; data: EmergencyContactUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/persinfo/emergency-contacts/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Emergency contact updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] })
      if (data && typeof data === 'object' && 'contact_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['emergency-contacts', 'detail', (data as any).contact_id] })
      }
    },
  })
}

// Hook to delete emergency contact
export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/persinfo/emergency-contacts/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Emergency contact deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] })
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts', 'detail', id] })
    },
  })
}