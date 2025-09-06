'use client'

import React, { useState, useCallback, useRef } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { Search, MapPin, Phone, Navigation, Star, Clock, Loader2 } from 'lucide-react'

import { 
  useGoogleMaps, 
  DEFAULT_MAP_OPTIONS, 
  MEDICAL_PLACE_TYPES, 
  MedicalPlaceType, 
  calculateDistance, 
  formatDistance 
} from '@/lib/google-maps'
import { googleServices } from '@/lib/services/google-services'
import { useGeolocation } from '@/hooks/useGeolocation'

interface Place extends google.maps.places.PlaceResult {
  distance?: number
}

export default function LocationServicesFeature() {
  // Feature gating (env + API key)
  // For now, only check for the API key and Places flag since feature flags don't work in client components
  const mapsEnabled = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const placesEnabled = (process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_ENABLED !== 'false')
  if (!mapsEnabled || !placesEnabled) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">Location services are currently disabled.</p>
          <p className="text-xs text-gray-500 mt-1">Enable Maps/Places in configuration to use this feature.</p>
        </div>
      </div>
    )
  }
  const { isLoaded, loadError } = useGoogleMaps()
  const { position, loading: locationLoading, error: locationError, retry, getCurrentPosition } = useGeolocation()
  
  // Map state
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ 
    lat: -26.2041, 
    lng: 28.0473 // Johannesburg default
  })
  const mapRef = useRef<google.maps.Map | null>(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaceType, setSelectedPlaceType] = useState<MedicalPlaceType>('pharmacy')
  const [otherMode, setOtherMode] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [searching, setSearching] = useState(false)
  const [showList, setShowList] = useState(false)
  const [radiusKm, setRadiusKm] = useState<number>(10)

  // Auto-request location: rely on user interaction (no implicit request)

  // Update center when user location is available
  React.useEffect(() => {
    if (position) {
      const newCenter = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      setCenter(newCenter)
      
      // Auto-search nearby pharmacies when location is available
      if (map && selectedPlaceType === 'pharmacy') {
        performSearch(newCenter, selectedPlaceType)
      }
    }
  }, [position, map])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    mapRef.current = map
  }, [])

  const performSearch = useCallback(async (
    searchCenter: google.maps.LatLngLiteral = center,
    placeType: MedicalPlaceType = selectedPlaceType,
    keyword?: string
  ) => {
    if (!map) return

    setSearching(true)
    setPlaces([])
    
    try {
      // Use centralized Google services to eliminate direct API calls
      const results = await googleServices.searchNearbyPlaces(
        map,
        searchCenter,
        placeType,
        (radiusKm || 10) * 1000,
        keyword && keyword.trim() ? keyword.trim() : undefined
      )
      
      // Add distance calculation to results
      const resultsWithDistance = results.map(place => ({
        ...place,
        distance: place.geometry?.location 
          ? calculateDistance(
              searchCenter.lat,
              searchCenter.lng,
              place.geometry.location.lat(),
              place.geometry.location.lng()
            )
          : 0
      }))
      
      // Sort by distance
      resultsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      
      setPlaces(resultsWithDistance)
      
      // Auto-show list if results found
      if (resultsWithDistance.length > 0) {
        setShowList(true)
      }
      
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }, [map, center, selectedPlaceType, radiusKm])

  const handlePlaceTypeChange = useCallback((newType: MedicalPlaceType) => {
    setOtherMode(false)
    setSelectedPlaceType(newType)
    setSelectedPlace(null)
    performSearch(center, newType)
  }, [center, performSearch])

  const handlePlaceSelect = useCallback((place: Place) => {
    setSelectedPlace(place)
    
    if (place.geometry?.location) {
      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
      setCenter(newCenter)
      map?.panTo(newCenter)
    }
  }, [map])

  // Loading states
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading maps...</p>
        </div>

        {/* Privacy note */}
        <p className="text-[12px] text-gray-500">We only use your location to find nearby pharmacies and services. Nothing is stored.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600">Failed to load maps</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Controls */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* Location Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">
              {locationLoading ? 'Getting your location...' :
               locationError ? 'Location unavailable' :
               position ? 'Current location detected' :
               'Location not available'}
            </span>
          </div>
          
          {locationError && (
            <button 
              onClick={retry}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Retry
            </button>
          )}
        </div>

        {/* Place Type Selector */}
        <div className="flex gap-2 overflow-x-auto items-center">
          {(['hospital','doctor','pharmacy','dentist'] as MedicalPlaceType[]).map(type => (
            <button
              key={type}
              onClick={() => handlePlaceTypeChange(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                !otherMode && selectedPlaceType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <button
            onClick={() => { setOtherMode(true); setSelectedPlaceType('health') }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
              otherMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Other
          </button>
          {otherMode && (
            <div className="flex items-center gap-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search other medical services"
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
              <button
                onClick={() => performSearch(center, selectedPlaceType, searchQuery)}
                disabled={searching || !map || !searchQuery.trim()}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white disabled:opacity-50"
              >
                Search
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => otherMode ? performSearch(center, selectedPlaceType, searchQuery) : performSearch()}
            disabled={searching || !map}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {otherMode ? 'Search' : `Find ${selectedPlaceType}s`}
          </button>

          {/* Radius selector */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>Radius</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
            </select>
          </label>

          <button
            onClick={() => setShowList(!showList)}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg"
          >
            {showList ? 'Hide' : 'Show'} List ({places.length})
          </button>
        </div>
      </div>

      {/* Map and Results */}
      <div className="flex-1 relative">
        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={position ? 14 : 11}
          options={DEFAULT_MAP_OPTIONS}
          onLoad={onMapLoad}
        >
          {/* User location marker */}
          {position && (
            <Marker
              position={{
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF'
              }}
              title="Your location"
            />
          )}

          {/* Place markers */}
          {places.map((place, index) => (
            place.geometry?.location && (
              <Marker
                key={place.place_id || index}
                position={{
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                }}
                onClick={() => handlePlaceSelect(place)}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  scale: 6,
                  fillColor: selectedPlaceType === 'pharmacy' ? '#10B981' : '#F59E0B',
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: '#FFFFFF'
                }}
              />
            )
          ))}

          {/* Info window for selected place */}
          {selectedPlace && selectedPlace.geometry?.location && (
            <InfoWindow
              position={{
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng()
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {selectedPlace.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedPlace.vicinity}
                </p>
                {selectedPlace.distance && (
                  <p className="text-sm text-blue-600 mb-2">
                    📍 {formatDistance(selectedPlace.distance)} away
                  </p>
                )}
                {selectedPlace.rating && (
                  <p className="text-sm text-yellow-600 mb-2">
                    ⭐ {selectedPlace.rating}/5 ({selectedPlace.user_ratings_total} reviews)
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {/* Call link if phone available */}
                  {selectedPlace.formatted_phone_number && (
                    <a href={`tel:${selectedPlace.formatted_phone_number}`} className="text-blue-600 text-sm underline">Call</a>
                  )}
                  {/* Directions link */}
                  {selectedPlace.geometry?.location && (
                    <a
                      className="text-blue-600 text-sm underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.geometry.location.lat()},${selectedPlace.geometry.location.lng()}`}
                    >
                      Directions
                    </a>
                  )}
                  {/* Open in Google Maps */}
                  {selectedPlace.place_id && (
                    <a
                      className="text-blue-600 text-sm underline"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://www.google.com/maps/search/?api=1&query_place_id=${selectedPlace.place_id}`}
                    >
                      Open
                    </a>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Results List Overlay */}
        {showList && places.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-h-64 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Nearby {selectedPlaceType}s ({places.length})
              </h3>
              <div className="space-y-2">
                {places.slice(0, 10).map((place, index) => (
                  <button
                    key={place.place_id || index}
                    onClick={() => handlePlaceSelect(place)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{place.name}</h4>
                        <p className="text-sm text-gray-600">{place.vicinity}</p>
                        {place.formatted_phone_number && (
                          <p className="text-sm text-green-600">
                            📞 {place.formatted_phone_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        {place.distance && (
                          <p className="text-blue-600 font-medium">
                            {formatDistance(place.distance)}
                          </p>
                        )}
                        {place.rating && (
                          <p className="text-yellow-600">
                            ⭐ {place.rating}/5
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
