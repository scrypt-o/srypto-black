'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  VitalSignRow, 
  VitalSignCreateInput, 
  VitalSignUpdateInput,
  VitalSignListResponse 
} from '@/schemas/vitalSigns'

// Query keys for TanStack Query
export const VitalSignKeys = {
  all: ['vitalSigns'] as const,
  list: (params?: { 
    page?: number; 
    pageSize?: number; 
    search?: string; 
    measurement_context?: string;
    date_from?: string;
    date_to?: string;
  }) => ['vitalSigns', 'list', params] as const,
  detail: (id: string) => ['vitalSigns', 'detail', id] as const,
}

// Hook to fetch list of vital signs
export function useVitalSignsList(params?: { 
  page?: number; 
  pageSize?: number; 
  search?: string;
  measurement_context?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'measurement_date' | 'systolic_bp' | 'heart_rate' | 'temperature'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page || 1),
    pageSize: String(params?.pageSize || 20),
    ...(params?.search && { search: params.search }),
    ...(params?.measurement_context && { measurement_context: params.measurement_context }),
    ...(params?.date_from && { date_from: params.date_from }),
    ...(params?.date_to && { date_to: params.date_to }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<VitalSignListResponse>({
    queryKey: VitalSignKeys.list(params),
    queryFn: async () => {
      const response = await fetch(`/api/patient/vitality/vital-signs?${queryString}`, {
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

// Hook to fetch single vital sign reading by ID
export function useVitalSignById(id: string) {
  return useQuery<VitalSignRow>({
    queryKey: VitalSignKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/patient/vitality/vital-signs/${id}`, {
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

// Hook to create new vital sign reading
export function useCreateVitalSign() {
  const queryClient = useQueryClient()
  
  return useMutation<VitalSignRow, Error, VitalSignCreateInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/patient/vitality/vital-signs', {
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
        console.log('Vital sign created successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] })
    },
  })
}

// Hook to update existing vital sign reading
export function useUpdateVitalSign() {
  const queryClient = useQueryClient()
  
  return useMutation<VitalSignRow, Error, { id: string; data: VitalSignUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/vitality/vital-signs/${id}`, {
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
        console.log('Vital sign updated successfully:', data)
      }
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] })
      if (data && typeof data === 'object' && 'vital_sign_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'detail', (data as any).vital_sign_id] })
      }
    },
  })
}

// Hook to delete vital sign reading
export function useDeleteVitalSign() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/vitality/vital-signs/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: (_, id) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Vital sign deleted successfully:', id)
      }
      queryClient.invalidateQueries({ queryKey: ['vitalSigns'] })
      queryClient.invalidateQueries({ queryKey: ['vitalSigns', 'detail', id] })
    },
  })
}