'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type { 
  ConditionRow, 
  ConditionCreateInput, 
  ConditionUpdateInput,
  ConditionListResponse 
} from '@/schemas/conditions'

// Query keys for cache management (TanStack compatibility)
export const ConditionKeys = {
  all: ['conditions'] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string; severity?: string; current_status?: string }) => 
    ['conditions', 'list', params] as const,
  detail: (id: string) => ['conditions', 'detail', id] as const,
}

// Hook to fetch list of conditions
export function useConditionsList(params?: { page?: number; pageSize?: number; search?: string; severity?: string; current_status?: string }) {
  return useQuery({
    queryKey: ConditionKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.severity) searchParams.set('severity', params.severity)
      if (params?.current_status) searchParams.set('current_status', params.current_status)

      const res = await fetch(`/api/patient/medical-history/conditions?${searchParams}`)
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json() as Promise<ConditionListResponse>
    },
  })
}

// Hook to fetch single condition by ID
export function useConditionById(id: string) {
  return useQuery({
    queryKey: ConditionKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/patient/medical-history/conditions/${id}`)
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json() as Promise<ConditionRow>
    },
    enabled: !!id,
  })
}

// Hook to create a new condition
export function useCreateCondition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ConditionCreateInput) => {
      const res = await fetch('/api/patient/medical-history/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json() as Promise<ConditionRow>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ConditionKeys.all })
    },
  })
}

// Hook to update an existing condition
export function useUpdateCondition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ConditionUpdateInput }) => {
      const res = await fetch(`/api/patient/medical-history/conditions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json() as Promise<ConditionRow>
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ConditionKeys.all })
      queryClient.invalidateQueries({ queryKey: ConditionKeys.detail(id) })
    },
  })
}

// Hook to delete a condition (soft delete)
export function useDeleteCondition() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/patient/medical-history/conditions/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json()
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ConditionKeys.all })
      queryClient.invalidateQueries({ queryKey: ConditionKeys.detail(id) })
    },
  })
}