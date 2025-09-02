'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  SurgeryRow, 
  SurgeryCreateInput, 
  SurgeryUpdateInput,
  SurgeryListResponse 
} from '@/schemas/surgeries'

// Query keys for TanStack Query
export const SurgeryKeys = {
  all: ['surgeries'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; surgery_type?: string; outcome?: string }) => 
    ['surgeries', 'list', params] as const,
  detail: (id: string) => ['surgeries', 'detail', id] as const,
}

// Hook to fetch list of surgeries
export function useSurgeriesList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  surgery_type?: string;
  outcome?: string;
  sort_by?: 'created_at' | 'surgery_name' | 'surgery_date' | 'surgery_type' | 'outcome'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.surgery_type && { surgery_type: params.surgery_type }),
    ...(params?.outcome && { outcome: params.outcome }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<SurgeryListResponse>({
    queryKey: SurgeryKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medhist/surgeries?${queryString}`, {
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

// Hook to fetch single surgery by ID
export function useSurgeryById(id: string) {
  return useQuery<SurgeryRow>({
    queryKey: SurgeryKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medhist/surgeries/${id}`, {
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

// Hook to create new surgery
export function useCreateSurgery() {
  const queryClient = useQueryClient()
  
  return useMutation<SurgeryRow, Error, SurgeryCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/medhist/surgeries', {
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
        console.log('Surgery created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['surgeries'] })
    },
  })
}

// Hook to update existing surgery
export function useUpdateSurgery() {
  const queryClient = useQueryClient()
  
  return useMutation<SurgeryRow, Error, { id: string; data: SurgeryUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/medhist/surgeries/${id}`, {
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
        console.log('Surgery updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['surgeries'] })
      if (data && typeof data === 'object' && 'surgery_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['surgeries', 'detail', (data as any).surgery_id] })
      }
    },
  })
}

// Hook to delete surgery
export function useDeleteSurgery() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/medhist/surgeries/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Surgery deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['surgeries'] })
      queryClient.invalidateQueries({ queryKey: ['surgeries', 'detail', id] })
    },
  })
}