import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock query runtime with simple orchestrator
const invalidateQueries = jest.fn()
const useMutation = jest.fn((config: any) => ({
  mutateAsync: async (arg: any) => {
    const res = await config.mutationFn(arg)
    config.onSuccess?.(res, arg)
    return res
  },
  isPending: false,
}))

jest.mock('@/lib/query/runtime', () => ({
  useMutation: (cfg: any) => useMutation(cfg),
  invalidateQueries: (args: any) => invalidateQueries(args),
}))

// Mock ApiError for error path
const fromResponse = jest.fn(async (resp: any) => ({ status: resp.status, message: 'ApiError' }))
jest.mock('@/lib/api-error', () => ({ ApiError: { fromResponse: (r: any) => fromResponse(r) } }))

import { useCreateAllergy, useUpdateAllergy } from '@/hooks/usePatientAllergies'

describe('Allergies hooks', () => {
  beforeEach(() => {
    invalidateQueries.mockClear()
    useMutation.mockClear()
  })

  it('useCreateAllergy succeeds and invalidates queries', async () => {
    // Mock fetch success
    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ allergy_id: 'a1' }) }))
    const m = useCreateAllergy()
    const res = await m.mutateAsync({ allergen: 'Peanuts', allergen_type: 'food', severity: 'mild' } as any)
    expect(res.allergy_id).toBe('a1')
    expect(invalidateQueries).toHaveBeenCalledWith(['allergies'])
  })

  it('useUpdateAllergy succeeds and invalidates queries including detail', async () => {
    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ allergy_id: 'a2', severity: 'severe' }) }))
    const m = useUpdateAllergy()
    const res = await m.mutateAsync({ id: 'a2', data: { severity: 'severe' } } as any)
    expect(res.allergy_id).toBe('a2')
    // broad invalidation + specific detail invalidation
    expect(invalidateQueries).toHaveBeenCalledWith(['allergies'])
    expect(invalidateQueries).toHaveBeenCalledWith(['allergies', 'detail', 'a2'])
  })

  it('useCreateAllergy throws ApiError on non-2xx', async () => {
    // @ts-ignore
    global.fetch = jest.fn(async () => ({ ok: false, status: 422 }))
    const m = useCreateAllergy()
    await expect(m.mutateAsync({} as any)).rejects.toEqual({ status: 422, message: 'ApiError' })
  })
})

