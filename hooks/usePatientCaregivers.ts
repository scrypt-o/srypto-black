import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CaregiverRow, CaregiverCreateInput, CaregiverUpdateInput } from '@/schemas/caregivers'
import { ApiError } from '@/lib/api-error'

// Fetch all caregivers
export function useCaregivers() {
  return useQuery<CaregiverRow[], Error>({
    queryKey: ['caregivers'],
    queryFn: async () => {
      const response = await fetch('/api/patient/carenet/caregivers', {
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
  })
}

// Fetch single caregiver
export function useCaregiver(id: string | null) {
  return useQuery<CaregiverRow, Error>({
    queryKey: ['caregivers', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Caregiver ID is required')
      
      const response = await fetch(`/api/patient/carenet/caregivers/${id}`, {
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

// Create new caregiver
export function useCreateCaregiver() {
  const queryClient = useQueryClient()
  
  return useMutation<CaregiverRow, Error, CaregiverCreateInput>({
    mutationFn: async (data: CaregiverCreateInput) => {
      const response = await fetch('/api/patient/carenet/caregivers', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch caregivers list
      queryClient.invalidateQueries({ queryKey: ['caregivers'] })
    },
  })
}

// Update existing caregiver
export function useUpdateCaregiver() {
  const queryClient = useQueryClient()
  
  return useMutation<CaregiverRow, Error, { id: string; data: CaregiverUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/patient/carenet/caregivers/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch caregivers list and detail
      queryClient.invalidateQueries({ queryKey: ['caregivers'] })
      queryClient.invalidateQueries({ queryKey: ['caregivers', 'detail', data.caregiver_id] })
    },
  })
}

// Delete caregiver (soft delete)
export function useDeleteCaregiver() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/patient/carenet/caregivers/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      
      if (!response.ok) {
        throw await ApiError.fromResponse(response)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch caregivers list
      queryClient.invalidateQueries({ queryKey: ['caregivers'] })
    },
  })
}

// Delete multiple caregivers
export function useDeleteMultipleCaregivers() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      // Delete each caregiver individually
      const promises = ids.map(id =>
        fetch(`/api/patient/carenet/caregivers/${id}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        })
      )
      
      const responses = await Promise.all(promises)
      
      // Check if all requests succeeded
      for (const response of responses) {
        if (!response.ok) {
          throw await ApiError.fromResponse(response)
        }
      }
    },
    onSuccess: () => {
      // Invalidate and refetch caregivers list
      queryClient.invalidateQueries({ queryKey: ['caregivers'] })
    },
  })
}

// Helper hook to get emergency contacts only
export function useEmergencyContacts() {
  const { data: caregivers, ...rest } = useCaregivers()
  
  const emergencyContacts = caregivers?.filter(caregiver => 
    caregiver.emergency_contact && caregiver.emergency_contact !== 'none'
  ).sort((a, b) => {
    // Sort by emergency contact priority
    const priorityOrder = { 'primary': 1, 'secondary': 2, 'tertiary': 3 }
    const aPriority = priorityOrder[a.emergency_contact as keyof typeof priorityOrder] || 4
    const bPriority = priorityOrder[b.emergency_contact as keyof typeof priorityOrder] || 4
    return aPriority - bPriority
  })
  
  return {
    ...rest,
    data: emergencyContacts,
  }
}

// Helper hook to get caregivers with full access
export function useFullAccessCaregivers() {
  const { data: caregivers, ...rest } = useCaregivers()
  
  const fullAccessCaregivers = caregivers?.filter(caregiver => 
    caregiver.access_level === 'full'
  )
  
  return {
    ...rest,
    data: fullAccessCaregivers,
  }
}