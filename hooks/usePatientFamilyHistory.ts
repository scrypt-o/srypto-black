'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  FamilyHistoryRow, 
  FamilyHistoryCreateInput, 
  FamilyHistoryUpdateInput,
  FamilyHistoryListResponse 
} from '@/schemas/family-history'

// Query keys for TanStack Query
export const FamilyHistoryKeys = {
  all: ['family-history'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; relationship?: string }) => 
    ['family-history', 'list', params] as const,
  detail: (id: string) => ['family-history', 'detail', id] as const,
}

// Hook to fetch list of family history records
export function useFamilyHistoryList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  relationship?: string;
  sort_by?: 'created_at' | 'relative' | 'condition' | 'relationship'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.relationship && { relationship: params.relationship }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<FamilyHistoryListResponse>({
    queryKey: FamilyHistoryKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/family-history?${queryString}`, {
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

// Hook to fetch single family history record by ID
export function useFamilyHistoryById(id: string) {
  return useQuery<FamilyHistoryRow>({
    queryKey: FamilyHistoryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/family-history/${id}`, {
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

// Hook to create new family history record
export function useCreateFamilyHistory() {
  const queryClient = useQueryClient()
  
  return useMutation<FamilyHistoryRow, Error, FamilyHistoryCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/medical-history/family-history', {
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
        console.log('Family history record created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['family-history'] })
    },
  })
}

// Hook to update existing family history record
export function useUpdateFamilyHistory() {
  const queryClient = useQueryClient()
  
  return useMutation<FamilyHistoryRow, Error, { id: string; data: FamilyHistoryUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/medical-history/family-history/${id}`, {
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
        console.log('Family history record updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['family-history'] })
      if (data && typeof data === 'object' && 'family_history_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['family-history', 'detail', (data as any).family_history_id] })
      }
    },
  })
}

// Hook to delete family history record
export function useDeleteFamilyHistory() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/medical-history/family-history/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Family history record deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['family-history'] })
      queryClient.invalidateQueries({ queryKey: ['family-history', 'detail', id] })
    },
  })
}