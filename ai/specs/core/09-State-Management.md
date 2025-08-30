# State & Caching — TanStack Query

## Query Management  
- `useQuery`, `useMutation`, `useQueryClient` from `@tanstack/react-query`.
- Keying: namespace by entity (e.g., `['allergies', 'list', params]`, `['allergies', 'detail', id]`).
- Cache invalidation: `queryClient.invalidateQueries({ queryKey: ['allergies'] })` in mutation onSuccess.

## Working Pattern
```ts
// hooks/usePatientAllergies.ts
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
      if (!response.ok) throw await ApiError.fromResponse(response)
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] })
      queryClient.invalidateQueries({ queryKey: ['allergies', 'detail', data.allergy_id] })
    },
  })
}
```

## Query Keys Structure
```ts
export const AllergyKeys = {
  all: ['allergies'] as const,
  list: (params?: ListParams) => ['allergies', 'list', params] as const,
  detail: (id: string) => ['allergies', 'detail', id] as const,
}
```

## Provider Setup
```ts
// app/layout.tsx  
<QueryProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</QueryProvider>
```

## List State
- Server pages provide `initialData` from SSR
- Client components use TanStack Query for mutations and cache management
- URL remains source of truth for filters/search/pagination

## Avoid
- Custom query facades - use TanStack Query directly
- Double-fetching list data on first render (use server initialData)
