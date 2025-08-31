/**
 * Google Maps Integration for Location Services
 * Simplified configuration for pharmacy and medical facility location
 */

import { useJsApiLoader } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

export { GOOGLE_MAPS_API_KEY }

// Libraries to load with Google Maps
const LIBRARIES: ("places" | "geometry")[] = ['places', 'geometry']

// Map styling options for medical facilities
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi.business',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'poi.medical',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    }
  ]
}

/**
 * React hook for loading Google Maps
 */
export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    version: 'weekly'
  })

  return {
    isLoaded,
    loadError
  }
}

// Medical facility types for Places API search
export const MEDICAL_PLACE_TYPES = {
  pharmacy: 'pharmacy',
  hospital: 'hospital', 
  doctor: 'doctor',
  dentist: 'dentist',
  health: 'health'
} as const

export type MedicalPlaceType = keyof typeof MEDICAL_PLACE_TYPES

// Calculate distance between two coordinates
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

// Format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

// Search nearby places using Google Places API
export const searchNearbyPlaces = async (
  map: google.maps.Map,
  center: google.maps.LatLngLiteral,
  type: MedicalPlaceType,
  radius: number = 5000
): Promise<google.maps.places.PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map)
    
    const request: google.maps.places.PlaceSearchRequest = {
      location: center,
      radius,
      type: MEDICAL_PLACE_TYPES[type]
    }

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Add distance calculation to each result
        const resultsWithDistance = results.map(place => ({
          ...place,
          distance: place.geometry?.location 
            ? calculateDistance(
                center.lat,
                center.lng,
                place.geometry.location.lat(),
                place.geometry.location.lng()
              )
            : undefined
        }))
        
        // Sort by distance
        resultsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        
        resolve(resultsWithDistance)
      } else {
        reject(new Error(`Places search failed: ${status}`))
      }
    })
  })
}