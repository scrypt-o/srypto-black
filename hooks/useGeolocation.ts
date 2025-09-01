/**
 * Geolocation hook for getting user's current position
 * Clean implementation for location services
 */

import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  position: GeolocationPosition | null
  loading: boolean
  error: string | null
}

interface UseGeolocationReturn extends GeolocationState {
  retry: () => void
  getCurrentPosition: () => Promise<GeolocationPosition>
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: false,
    error: null
  })

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        options
      )
    })
  }, [])

  const getLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const position = await getCurrentPosition()
      setState(prev => ({ 
        ...prev, 
        position, 
        loading: false, 
        error: null 
      }))
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unable to get your location'
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }))
    }
  }, [getCurrentPosition])

  const retry = useCallback(() => {
    getLocation()
  }, [getLocation])

  // Addresses audit finding: "useGeolocation requests location on mount; spec prefers explicit user consent"
  // Location is now requested explicitly, not automatically on mount

  return {
    ...state,
    retry,
    getCurrentPosition
  }
}