/**
 * Centralized Google Services Provider
 * Addresses audit finding: "Central GoogleServicesProvider is spec'd but not implemented"
 */

import { useJsApiLoader } from '@react-google-maps/api'

// Configuration interface
interface GoogleServicesConfig {
  apiKey: string
  libraries: ('places' | 'geometry')[]
  region: string
  enabled: boolean
}

// Service provider class
export class GoogleServicesProvider {
  private static instance: GoogleServicesProvider
  private config: GoogleServicesConfig
  private usageTracker: Map<string, number> = new Map()

  private constructor() {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      libraries: ['places', 'geometry'],
      region: 'ZA',
      enabled: process.env.GOOGLE_PLACES_API_ENABLED === 'true' && !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  }

  public static getInstance(): GoogleServicesProvider {
    if (!GoogleServicesProvider.instance) {
      GoogleServicesProvider.instance = new GoogleServicesProvider()
    }
    return GoogleServicesProvider.instance
  }

  // Feature flag check
  public isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey
  }

  // Centralized Maps loader (eliminates duplicate loaders)
  public useGoogleMaps() {
    const { isLoaded, loadError } = useJsApiLoader({
      id: 'scrypto-google-maps', // Single ID across entire app
      googleMapsApiKey: this.config.apiKey,
      libraries: this.config.libraries,
      version: 'weekly'
    })

    return {
      isLoaded: isLoaded && this.isEnabled(),
      loadError: loadError || (!this.config.enabled ? new Error('Google services disabled') : null),
      isReady: isLoaded && !loadError && this.isEnabled()
    }
  }

  // Places API - Address autocomplete
  public async autocompleteAddress(query: string): Promise<AddressSuggestion[]> {
    if (!this.isEnabled()) {
      throw new Error('Google Places API not enabled')
    }

    try {
      this.trackUsage('places.autocomplete')
      
      return new Promise((resolve, reject) => {
        if (!window.google?.maps?.places) {
          reject(new Error('Google Places API not loaded'))
          return
        }

        const service = new window.google.maps.places.AutocompleteService()
        
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: this.config.region },
            types: ['address']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              const suggestions = predictions.map(p => ({
                id: p.place_id,
                description: p.description,
                terms: p.terms
              }))
              resolve(suggestions)
            } else {
              reject(new Error(`Places autocomplete failed: ${status}`))
            }
          }
        )
      })
    } catch (error) {
      this.handleError('places.autocomplete', error)
      throw error
    }
  }

  // Places API - Get place details
  public async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    if (!this.isEnabled()) {
      throw new Error('Google Places API not enabled')
    }

    try {
      this.trackUsage('places.details')
      
      return new Promise((resolve, reject) => {
        if (!window.google?.maps?.places) {
          reject(new Error('Google Places API not loaded'))
          return
        }

        const map = new window.google.maps.Map(document.createElement('div'))
        const service = new window.google.maps.places.PlacesService(map)
        
        service.getDetails(
          {
            placeId: placeId,
            fields: ['address_components', 'formatted_address', 'geometry', 'name']
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              resolve({
                placeId: placeId,
                formattedAddress: place.formatted_address || '',
                addressComponents: place.address_components || [],
                coordinates: place.geometry?.location ? {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                } : null
              })
            } else {
              reject(new Error(`Place details failed: ${status}`))
            }
          }
        )
      })
    } catch (error) {
      this.handleError('places.details', error)
      throw error
    }
  }

  // Maps API - Search nearby places
  public async searchNearbyPlaces(
    map: google.maps.Map,
    center: google.maps.LatLngLiteral,
    type: string,
    radius: number = 5000
  ): Promise<google.maps.places.PlaceResult[]> {
    if (!this.isEnabled()) {
      throw new Error('Google Places API not enabled')
    }

    try {
      this.trackUsage('places.nearby')
      
      return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(map)
        
        service.nearbySearch(
          {
            location: center,
            radius,
            type: type as any
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results)
            } else {
              reject(new Error(`Nearby search failed: ${status}`))
            }
          }
        )
      })
    } catch (error) {
      this.handleError('places.nearby', error)
      throw error
    }
  }

  // Usage tracking
  private trackUsage(operation: string): void {
    const current = this.usageTracker.get(operation) || 0
    this.usageTracker.set(operation, current + 1)
  }

  // Centralized error handling
  private handleError(operation: string, error: any): void {
    console.error(`Google ${operation} failed:`, error)
    
    // Log to usage tracker for monitoring
    this.trackUsage(`${operation}.error`)
  }

  // Get usage statistics
  public getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.usageTracker)
  }
}

// Type definitions
export interface AddressSuggestion {
  id: string
  description: string
  terms: any[]
}

export interface PlaceDetails {
  placeId: string
  formattedAddress: string
  addressComponents: google.maps.GeocoderAddressComponent[]
  coordinates: { lat: number; lng: number } | null
}

// Export singleton instance
export const googleServices = GoogleServicesProvider.getInstance()