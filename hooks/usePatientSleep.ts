'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api-error'
import type {
  SleepRow,
  SleepCreateInput,
  SleepUpdateInput,
  SleepListResponse,
} from '@/schemas/sleep'

export const SleepKeys = {
  all: ['sleep'] as const,
  list: (params?: Record<string, unknown>) => ['sleep', 'list', params] as const,
  detail: (id: string) => ['sleep', 'detail', id] as const,
}

export function useSleepList(params?: {
  page?: number
  pageSize?: number
  search?: string
  min_quality?: number
  date_from?: string
  date_to?: string
  sort_by?: 'sleep_date' | 'created_at' | 'sleep_quality_rating'
  sort_dir?: 'asc' | 'desc'
}) {
  const queryString = new URLSearchParams({
    page: String(params?.page ?? 1),
    pageSize: String(params?.pageSize ?? 20),
    ...(params?.search && { search: params.search }),
    ...(params?.min_quality && { min_quality: String(params.min_quality) }),
    ...(params?.date_from && { date_from: params.date_from }),
    ...(params?.date_to && { date_to: params.date_to }),
    ...(params?.sort_by && { sort_by: params.sort_by }),
    ...(params?.sort_dir && { sort_dir: params.sort_dir }),
  }).toString()

  return useQuery<SleepListResponse>({
    queryKey: SleepKeys.list(params),
    queryFn: async () => {
      const res = await fetch(`/api/patient/vitality/sleep?${queryString}`, { credentials: 'same-origin' })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json()
    },
  })
}

export function useSleepById(id: string) {
  return useQuery<SleepRow>({
    queryKey: SleepKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/patient/vitality/sleep/${id}`, { credentials: 'same-origin' })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateSleep() {
  const qc = useQueryClient()
  return useMutation<SleepRow, Error, SleepCreateInput>({
    mutationFn: async (data) => {
      const res = await fetch('/api/patient/vitality/sleep', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SleepKeys.all as any })
    },
  })
}

export function useUpdateSleep() {
  const qc = useQueryClient()
  return useMutation<SleepRow, Error, { id: string; data: SleepUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/patient/vitality/sleep/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await ApiError.fromResponse(res)
      return res.json()
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: SleepKeys.all as any })
      if (row && (row as any).sleep_id) {
        qc.invalidateQueries({ queryKey: SleepKeys.detail((row as any).sleep_id) as any })
      }
    },
  })
}

export function useDeleteSleep() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/patient/vitality/sleep/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) throw await ApiError.fromResponse(res)
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: SleepKeys.all as any })
      qc.invalidateQueries({ queryKey: SleepKeys.detail(id) as any })
    },
  })
}

