'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  ImmunizationRow, 
  ImmunizationCreateInput, 
  ImmunizationUpdateInput,
  ImmunizationListResponse 
} from '@/schemas/immunizations'

// Query keys for TanStack Query
export const ImmunizationKeys = {
  all: ['immunizations'] as const,
  list: (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    site?: string; 
    route?: string; 
    start_date?: string; 
    end_date?: string 
  }) => ['immunizations', 'list', params] as const,
  detail: (id: string) => ['immunizations', 'detail', id] as const,
}

// Hook to fetch list of immunizations
export function useImmunizationsList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  site?: string;
  route?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'created_at' | 'vaccine_name' | 'date_given' | 'provider_name'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.site && { site: params.site }),
    ...(params?.route && { route: params.route }),
    ...(params?.start_date && { start_date: params.start_date }),
    ...(params?.end_date && { end_date: params.end_date }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<ImmunizationListResponse>({
    queryKey: ImmunizationKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/immunizations?${queryString}`, {
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

// Hook to fetch single immunization by ID
export function useImmunizationById(id: string) {
  return useQuery<ImmunizationRow>({
    queryKey: ImmunizationKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/medical-history/immunizations/${id}`, {
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

// Hook to create new immunization
export function useCreateImmunization() {
  const queryClient = useQueryClient()
  
  return useMutation<ImmunizationRow, Error, ImmunizationCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/medical-history/immunizations', {
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
        console.log('Immunization created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['immunizations'] })
    },
  })
}

// Hook to update existing immunization
export function useUpdateImmunization() {
  const queryClient = useQueryClient()
  
  return useMutation<ImmunizationRow, Error, { id: string; data: ImmunizationUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/medical-history/immunizations/${id}`, {
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
        console.log('Immunization updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['immunizations'] })
      if (data && typeof data === 'object' && 'immunization_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['immunizations', 'detail', (data as any).immunization_id] })
      }
    },
  })
}

// Hook to delete immunization
export function useDeleteImmunization() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/medical-history/immunizations/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Immunization deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['immunizations'] })
      queryClient.invalidateQueries({ queryKey: ['immunizations', 'detail', id] })
    },
  })
}