'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  DependentRow, 
  DependentCreateInput, 
  DependentUpdateInput,
  DependentListResponse 
} from '@/schemas/dependents'

// Query keys for TanStack Query
export const DependentKeys = {
  all: ['dependents'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; relationship?: string; citizenship?: string }) => 
    ['dependents', 'list', params] as const,
  detail: (id: string) => ['dependents', 'detail', id] as const,
}

// Hook to fetch list of dependents
export function useDependentsList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  relationship?: string;
  citizenship?: string;
  sort_by?: 'created_at' | 'full_name' | 'relationship' | 'date_of_birth'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.relationship && { relationship: params.relationship }),
    ...(params?.citizenship && { citizenship: params.citizenship }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<DependentListResponse>({
    queryKey: DependentKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/personal-info/dependents?${queryString}`, {
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

// Hook to fetch single dependent by ID
export function useDependentById(id: string) {
  return useQuery<DependentRow>({
    queryKey: DependentKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/personal-info/dependents/${id}`, {
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

// Hook to create new dependent
export function useCreateDependent() {
  const queryClient = useQueryClient()
  
  return useMutation<DependentRow, Error, DependentCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/personal-info/dependents', {
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
        console.log('Dependent created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['dependents'] })
    },
  })
}

// Hook to update existing dependent
export function useUpdateDependent() {
  const queryClient = useQueryClient()
  
  return useMutation<DependentRow, Error, { id: string; data: DependentUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/personal-info/dependents/${id}`, {
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
        console.log('Dependent updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['dependents'] })
      if (data && typeof data === 'object' && 'dependent_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['dependents', 'detail', (data as any).dependent_id] })
      }
    },
  })
}

// Hook to delete dependent
export function useDeleteDependent() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/personal-info/dependents/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Dependent deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['dependents'] })
      queryClient.invalidateQueries({ queryKey: ['dependents', 'detail', id] })
    },
  })
}