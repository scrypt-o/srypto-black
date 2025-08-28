'use client'

import React from 'react'

/**
 * Query Facade - Simple fetch wrapper that mimics TanStack Query API
 * This allows us to swap in TanStack later without changing any components
 * Includes basic cache invalidation system for mutation updates
 */

// Cache registry to track active queries and their refetch functions
const queryCache = new Map<string, Set<() => void>>()

// Invalidate queries matching a key pattern
export function invalidateQueries(keyPattern: any[]) {
  const patternString = JSON.stringify(keyPattern)
  console.log('🔄 Invalidating queries with pattern:', patternString)
  console.log('📦 Current cache keys:', Array.from(queryCache.keys()))
  
  let invalidatedCount = 0
  
  // Find all cache keys that match or start with this pattern
  for (const [cacheKey, refetchFunctions] of queryCache) {
    try {
      const cacheKeyArray = JSON.parse(cacheKey)
      
      // Check if cache key starts with the pattern
      const matches = keyPattern.every((patternItem, index) => {
        return index < cacheKeyArray.length && 
               JSON.stringify(cacheKeyArray[index]) === JSON.stringify(patternItem)
      })
      
      console.log(`🔍 Checking key ${cacheKey}: matches=${matches}`)
      
      if (matches) {
        console.log(`✅ Invalidating cache key: ${cacheKey}`)
        refetchFunctions.forEach(refetch => refetch())
        invalidatedCount++
      }
    } catch (error) {
      console.error(`❌ Error parsing cache key ${cacheKey}:`, error)
    }
  }
  
  console.log(`🎯 Total queries invalidated: ${invalidatedCount}`)
}

// Query client interface for TanStack Query compatibility
export interface QueryClient {
  invalidateQueries: (options: { queryKey: any[] }) => void
}

export const queryClient: QueryClient = {
  invalidateQueries: ({ queryKey }) => invalidateQueries(queryKey)
}

// Query hook that mimics TanStack's useQuery
export function useQuery<T>(
  key: unknown[], 
  fn: () => Promise<T>
) {
  const [data, setData] = React.useState<T | undefined>(undefined)
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState(true)
  
  const refetch = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await fn()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [fn])
  
  // Register this query's refetch function for cache invalidation
  React.useEffect(() => {
    const keyString = JSON.stringify(key)
    if (!queryCache.has(keyString)) {
      queryCache.set(keyString, new Set())
    }
    queryCache.get(keyString)!.add(refetch)
    
    // Cleanup when component unmounts or key changes
    return () => {
      queryCache.get(keyString)?.delete(refetch)
      if (queryCache.get(keyString)?.size === 0) {
        queryCache.delete(keyString)
      }
    }
  }, [JSON.stringify(key), refetch])

  React.useEffect(() => {
    refetch()
  }, [JSON.stringify(key)])
  
  return {
    data,
    error,
    isLoading: loading,
    isFetching: loading,
    refetch
  }
}

// Mutation hook that mimics TanStack's useMutation
export function useMutation<TVariables, TResult>(
  opts: {
    mutationFn: (variables: TVariables) => Promise<TResult>
    onSuccess?: (result: TResult, variables: TVariables) => void
    onError?: (error: Error) => void
  }
) {
  const [pending, setPending] = React.useState(false)
  
  const mutate = async (
    variables: TVariables,
    callbacks?: {
      onSuccess?: (result: TResult, variables: TVariables) => void
      onError?: (error: Error) => void
    }
  ) => {
    setPending(true)
    try {
      const result = await opts.mutationFn(variables)
      opts.onSuccess?.(result, variables)
      callbacks?.onSuccess?.(result, variables)
    } catch (e) {
      const error = e as Error
      opts.onError?.(error)
      callbacks?.onError?.(error)
    } finally {
      setPending(false)
    }
  }

  // mutateAsync returns a promise that resolves with the result
  // or rejects with the error
  const mutateAsync = async (variables: TVariables) => {
    setPending(true)
    try {
      const result = await opts.mutationFn(variables)
      opts.onSuccess?.(result, variables)
      return result
    } catch (e) {
      const error = e as Error
      opts.onError?.(error)
      throw error
    } finally {
      setPending(false)
    }
  }
  
  return {
    mutate,
    mutateAsync,
    isPending: pending
  }
}