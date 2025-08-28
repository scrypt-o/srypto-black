'use client'

import { useQuery, useMutation, invalidateQueries } from '@/lib/query/runtime'
import { ApiError } from '@/lib/api-error'
import type { 
  AllergyRow, 
  AllergyCreateInput, 
  AllergyUpdateInput,
  AllergyListResponse 
} from '@/schemas/allergies'

// Query keys for cache management (future TanStack compatibility)
export const AllergyKeys = {
  all: ['allergies'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; allergen_type?: string; severity?: string }) => 
    ['allergies', 'list', params] as const,
  detail: (id: string) => ['allergies', 'detail', id] as const,
}

// Hook to fetch list of allergies
export function useAllergiesList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  allergen_type?: string;
  severity?: string;
  sort_by?: 'created_at' | 'allergen' | 'severity' | 'allergen_type'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.allergen_type && { allergen_type: params.allergen_type }),
    ...(params?.severity && { severity: params.severity }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<AllergyListResponse>(
    AllergyKeys.list(params) as unknown as any[],
    async () => {
      const response = await fetch(`/api/patient/medical-history/allergies?${queryString}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    }
  )
}

// Hook to fetch single allergy by ID
export function useAllergyById(id: string) {
  return useQuery<AllergyRow>(
    AllergyKeys.detail(id) as unknown as any[],
    async () => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    }
  )
}

// Hook to create new allergy
export function useCreateAllergy() {
  return useMutation<AllergyCreateInput, AllergyRow>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/medical-history/allergies', {
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
      console.log('Allergy created successfully:', data)
      // Invalidate all allergy-related queries to refresh UI
      invalidateQueries(['allergies'] as unknown as any[])  // This will match all allergy keys
    },
  })
}

// Hook to update existing allergy
export function useUpdateAllergy() {
  return useMutation<{ id: string; data: AllergyUpdateInput }, AllergyRow>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
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
      console.log('Allergy updated successfully:', data)
      // Invalidate all allergy-related queries to refresh UI
      invalidateQueries(['allergies'] as unknown as any[])  // This will match all allergy keys
      // Also invalidate the specific detail record
      if (data && (data as any).allergy_id) {
        invalidateQueries(['allergies', 'detail', (data as any).allergy_id] as unknown as any[])
      }
    },
  })
}

// Hook to delete allergy (soft delete)
export function useDeleteAllergy() {
  return useMutation<string, { success: boolean }>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    onSuccess: (_result, id) => {
      console.log('Allergy deleted successfully')
      // Invalidate all allergy-related queries to refresh UI
      invalidateQueries(['allergies'] as unknown as any[])  // This will match all allergy keys
      // Invalidate the specific detail record
      if (id) {
        invalidateQueries(['allergies', 'detail', id] as unknown as any[])
      }
    },
  })
}
