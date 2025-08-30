'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  AllergyRow, 
  AllergyCreateInput, 
  AllergyUpdateInput,
  AllergyListResponse 
} from '@/schemas/allergies'

// Query keys for TanStack Query
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

  return useQuery<AllergyListResponse>({
    queryKey: AllergyKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/allergies?${queryString}`, {
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

// Hook to fetch single allergy by ID
export function useAllergyById(id: string) {
  return useQuery<AllergyRow>({
    queryKey: AllergyKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
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

// Hook to create new allergy
export function useCreateAllergy() {
  const queryClient = useQueryClient()
  
  return useMutation<AllergyRow, Error, AllergyCreateInput>({
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
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
    },
  })
}

// Hook to update existing allergy
export function useUpdateAllergy() {
  const queryClient = useQueryClient()
  
  return useMutation<AllergyRow, Error, { id: string; data: AllergyUpdateInput }>({
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
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
      if (data && typeof data === 'object' && 'allergy_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['allergies', 'detail', (data as any).allergy_id] })
      }
    },
  })
}

// Hook to delete allergy
export function useDeleteAllergy() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/medical-history/allergies/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      console.log('Allergy deleted successfully:', id)
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
      queryClient.invalidateQueries({ queryKey: ['allergies', 'detail', id] })
    },
  })
}