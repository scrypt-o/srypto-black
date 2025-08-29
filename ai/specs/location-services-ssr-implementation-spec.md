# Location Services SSR Implementation Specification

**Feature**: `patient__location__services`  
**Date**: 2025-08-28  
**Status**: Implementation Ready  
**Domain**: Patient  
**Group**: Location  
**Item**: Services (Hospital, Pharmacy, Dr, Dentist, Other medical)  
**Legacy Reference**: `/_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/`

---

## Strategic Approach: Legacy Google Maps Integration + Modern SSR

This specification leverages the **working Google Maps implementation** from the legacy codebase while adapting it to our current Next.js 15 SSR architecture and integrating with our existing patient home tile system.

### What We're Keeping (Proven Patterns)
- **Google Maps Integration**: `@react-google-maps/api` with Places API
- **Geolocation Hooks**: `useGeolocation` with proper error handling  
- **Search Architecture**: Text search + Quick filter buttons for medical types
- **Database Schema**: Complete location tables with RLS policies
- **Map UI Patterns**: Search overlay, results panel, info windows

### What We're Fixing/Adding
- **SSR Integration**: Server component wrappers for Next.js 15
- **Navigation Integration**: Proper integration with patient home tiles
- **Complete Implementation**: Add missing Healthcare and "Find Loved Ones" features
- **Modern UI**: Integrate with our current design system and layouts

---

## Legacy Code Analysis & Porting Strategy

### PROVEN: Google Maps Integration (PORT EXACTLY)
```typescript
// ✅ WORKING PATTERN FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/lib/google-maps-unified.ts
export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
    version: 'weekly'
  })
  return { isLoaded, loadError, isReady: isLoaded && !loadError }
}

// ✅ PROVEN: Medical place types configuration
export const MEDICAL_PLACE_TYPES = {
  pharmacy: { label: 'Pharmacies', icon: '💊', searchTerms: ['pharmacy', 'chemist'] },
  doctor: { label: 'Doctors', icon: '👨‍⚕️', searchTerms: ['doctor', 'GP'] },
  hospital: { label: 'Hospitals', icon: '🏥', searchTerms: ['hospital', 'clinic'] },
  dentist: { label: 'Dentists', icon: '🦷', searchTerms: ['dentist', 'dental'] }
}

// ✅ PROVEN: Distance calculation and formatting
export const calculateDistance = (lat1, lng1, lat2, lng2): number => {
  // Haversine formula implementation - PORT EXACTLY
}
```

### PROVEN: Database Schema (EXCELLENT DESIGN)
```sql
-- ✅ EXISTING SCHEMA FROM LEGACY - NO CHANGES NEEDED
-- FILE: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/supabase/migrations/20250710_create_location_services.sql

-- Patient saved locations (user-specific)
CREATE TABLE patient_saved_locations (
    saved_location_id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100),    -- 'pharmacy', 'hospital', 'clinic', 'home', 'work'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    operating_hours JSONB,
    is_favorite BOOLEAN DEFAULT false,
    -- ... complete schema in legacy file
)

-- Pharmacy directory (public/shared data)
CREATE TABLE pharmacies_directory (
    pharmacy_id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    chain_name VARCHAR(100),       -- 'Clicks', 'Dis-Chem', 'Pick n Pay'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    services_offered JSONB,        -- ['prescription_collection', 'health_screening']
    accepts_medical_aids JSONB,    -- ['Discovery', 'Bonitas', 'GEMS']
    average_rating DECIMAL(3, 2),
    is_24_hour BOOLEAN DEFAULT false,
    -- ... complete schema in legacy file
)
```

### PROVEN: Component Architecture
```typescript
// ✅ WORKING PATTERN FROM: LocationServicesMap.tsx
// Main map component with:
// - Google Maps integration with @react-google-maps/api
// - Real-time search with Places API text search
// - Quick filter buttons for medical service types  
// - User location detection and display
// - Results panel with distance calculation
// - Info windows with call/directions buttons

// ✅ WORKING PATTERN FROM: GoogleMapsLocationService.tsx  
// Alternative map implementation with:
// - Search overlay interface
// - Medical service type filters
// - Auto-search on map load
// - Geolocation integration
// - Mock data fallback for API failures
```

---

## File Structure & Implementation Plan

### NEW: SSR Integration Structure
```
app/patient/location/
├── page.tsx                           # NEW: Location services overview (tiles)
├── find-pharmacies/
│   ├── page.tsx                       # NEW: SSR wrapper for pharmacy search
│   ├── PharmaciesClient.tsx           # PORT: List view with map toggle
│   └── map/
│       └── page.tsx                   # NEW: SSR wrapper for pharmacy map
├── find-healthcare/
│   ├── page.tsx                       # NEW: Healthcare providers search  
│   └── map/
│       └── page.tsx                   # NEW: Healthcare map view
├── find-loved-ones/
│   ├── page.tsx                       # NEW: Family/caregiver location tracking
│   └── track/
│       └── page.tsx                   # NEW: Real-time tracking interface
└── saved-locations/
    ├── page.tsx                       # NEW: User's saved locations list
    └── [id]/
        └── page.tsx                   # NEW: Edit saved location

lib/services/location/
├── google-maps-service.ts             # PORT: From google-maps-unified.ts
├── geolocation-service.ts             # PORT: From useGeolocation hook
└── places-search-service.ts           # NEW: Enhanced search with caching

components/features/patient/location/
├── LocationOverview.tsx               # NEW: Tiles overview component
├── PharmacySearch.tsx                 # PORT: From legacy with ListView integration
├── PharmacyMap.tsx                    # PORT: From LocationServicesMap.tsx
├── HealthcareSearch.tsx               # NEW: Based on pharmacy pattern
├── LovedOnesTracking.tsx              # NEW: Family location tracking
└── SavedLocationsList.tsx             # NEW: User's saved places

hooks/location/
├── useGeolocation.ts                  # PORT: From legacy (check if exists)
├── useGoogleMaps.ts                   # PORT: From legacy (check if exists)  
└── usePlacesSearch.ts                 # NEW: Enhanced search hook with facade pattern

api/patient/location/
├── pharmacies/
│   └── route.ts                      # NEW: Pharmacy directory API
├── healthcare/  
│   └── route.ts                      # NEW: Healthcare providers API
├── saved-locations/
│   ├── route.ts                      # NEW: User saved locations CRUD
│   └── [id]/route.ts                 # NEW: Individual location operations
└── search/
    └── route.ts                      # NEW: Google Places API proxy
```

---

## Navigation Integration (Patient Home)

### Update Patient Home Config
```typescript
// app/patient/config.ts - UPDATE location tile (currently disabled)
{
  id: 'location',
  title: 'Location',
  description: 'Healthcare map and services',
  status: { text: 'Find nearby medical services', tone: 'info' as const },
  icon: 'Map',
  href: '/patient/location',
  disabled: false,              // ✅ ENABLE this tile
  variant: 'default' as const,
  accent: 'teal'
}
```

### Location Services Overview Tiles
```typescript
// app/patient/location/page.tsx (NEW)
export default async function LocationPage() {
  const user = await requireUser()
  
  const locationConfig = {
    title: 'Location Services',
    subtitle: 'Healthcare map and services',
    tiles: [
      {
        id: 'find-pharmacies',
        title: 'Find Pharmacies',
        description: 'Locate nearby pharmacies and chemists',
        status: { text: 'Search 500+ pharmacies nationwide', tone: 'info' as const },
        icon: 'MapPin',
        href: '/patient/location/find-pharmacies',
        accent: 'teal' as const
      },
      {
        id: 'find-healthcare',
        title: 'Find Healthcare',  
        description: 'Doctors, hospitals, specialists',
        status: { text: 'Find medical professionals near you', tone: 'info' as const },
        icon: 'Stethoscope',
        href: '/patient/location/find-healthcare',
        accent: 'teal' as const
      },
      {
        id: 'find-loved-ones',
        title: 'Find Loved Ones',
        description: 'Track family and caregiver locations',
        status: { text: 'Share location with trusted contacts', tone: 'warning' as const },
        icon: 'Users',
        href: '/patient/location/find-loved-ones',
        accent: 'teal' as const
      },
      {
        id: 'saved-locations',
        title: 'Saved Locations',
        description: 'Your favorite medical locations',
        status: { text: '3 saved locations', tone: 'success' as const },
        icon: 'Heart',
        href: '/patient/location/saved-locations', 
        accent: 'teal' as const
      }
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Location Services"
      tileConfig={locationConfig}
    />
  )
}
```

---

## Google Maps Service Integration (PORT Legacy Success)

### File: `/lib/services/location/google-maps-service.ts`
```typescript
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/lib/google-maps-unified.ts

import { useJsApiLoader } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// PORT: Exact libraries and options that worked
const LIBRARIES: ("places" | "geometry")[] = ['places', 'geometry']

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
    }
  ]
}

// PORT: Exact medical place types that worked
export const MEDICAL_PLACE_TYPES = {
  pharmacy: {
    label: 'Pharmacies',
    icon: 'Pill',                    // Use Lucide icons instead of emoji
    searchTerms: ['pharmacy', 'chemist', 'drugstore']
  },
  doctor: {
    label: 'Doctors', 
    icon: 'Stethoscope',
    searchTerms: ['doctor', 'physician', 'general practitioner', 'GP']
  },
  hospital: {
    label: 'Hospitals',
    icon: 'Building2',
    searchTerms: ['hospital', 'medical center', 'clinic']
  },
  dentist: {
    label: 'Dentists',
    icon: 'Smile',
    searchTerms: ['dentist', 'dental clinic', 'orthodontist']
  }
} as const

// PORT: Exact search function that worked in legacy
export const searchNearbyPlaces = (
  map: google.maps.Map,
  location: google.maps.LatLng, 
  placeType: string,
  radius: number = 15000
): Promise<google.maps.places.PlaceResult[]> => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(map)
    
    const request: google.maps.places.PlaceSearchRequest = {
      location,
      radius,
      type: placeType as any,
      keyword: placeType
    }

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results)
      } else {
        // PORT: Exact mock data pattern from legacy for API failures
        resolve([
          {
            place_id: 'mock_pharmacy_1',
            name: 'Clicks Pharmacy Sandton',
            formatted_address: 'Sandton City, Johannesburg, South Africa',
            geometry: {
              location: new google.maps.LatLng(-26.1076, 28.0567)
            },
            rating: 4.2,
            formatted_phone_number: '011 783 0000'
          }
          // ... more mock data for demonstration
        ] as any)
      }
    })
  })
}
```

### Geolocation Hook (PORT Legacy Success)
```typescript
// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/hooks/useGeolocation.ts
// hooks/location/useGeolocation.ts

import { useState, useEffect } from 'react'

interface GeolocationState {
  position: GeolocationPosition | null
  loading: boolean
  error: GeolocationPositionError | null
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null
  })

  // PORT: Exact implementation from legacy - it handled all edge cases
  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        loading: false,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser'
        } as GeolocationPositionError
      })
      return
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({ position, loading: false, error: null })
    }

    const errorHandler = (error: GeolocationPositionError) => {
      setState({ position: null, loading: false, error })
    }

    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes - PROVEN timeout values
      }
    )
  }, [])

  const retry = () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
  }

  return { ...state, retry }
}
```

---

## Database Integration (Apply Legacy Schema)

### Migration Required
```sql
-- Apply the PROVEN schema from legacy
-- SOURCE: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/supabase/migrations/20250710_create_location_services.sql

-- Table 1: patient__location__saved_locations (adapted to our naming)
CREATE TABLE IF NOT EXISTS patient__location__saved_locations (
    saved_location_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(100), -- 'pharmacy', 'hospital', 'clinic', 'home', 'work', 'custom'
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255), 
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'South Africa',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    website_url VARCHAR(500),
    operating_hours JSONB,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: patient__location__pharmacies_directory (public directory) 
CREATE TABLE IF NOT EXISTS patient__location__pharmacies_directory (
    pharmacy_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    chain_name VARCHAR(100),           -- 'Clicks', 'Dis-Chem', 'Pick n Pay Pharmacy'
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    website_url VARCHAR(500),
    operating_hours JSONB,
    services_offered JSONB,            -- Array of services
    accepts_medical_aids JSONB,        -- Array of medical aids accepted
    average_rating DECIMAL(3, 2),
    delivery_available BOOLEAN DEFAULT false,
    is_24_hour BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORT: Exact RLS policies from legacy
ALTER TABLE patient__location__saved_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved locations" 
  ON patient__location__saved_locations FOR SELECT 
  USING (auth.uid() = user_id);

-- PORT: Sample pharmacy data for testing
INSERT INTO patient__location__pharmacies_directory (name, chain_name, city, latitude, longitude, phone) VALUES 
  ('Clicks Pharmacy Sandton City', 'Clicks', 'Sandton', -26.1076, 28.0567, '011 783 0000'),
  ('Dis-Chem Pharmacy Menlyn', 'Dis-Chem', 'Pretoria', -25.7879, 28.2772, '012 348 4400');
```

---

## SSR Component Architecture

### Location Overview Page (NEW)
```typescript
// app/patient/location/page.tsx
import { requireUser } from '@/lib/auth/require-user'
import { patientNavItems } from '@/config/patientNav'
import TilePageLayout from '@/components/layouts/TilePageLayout'

export default async function LocationPage() {
  const user = await requireUser()
  
  const locationConfig = {
    title: 'Location Services',
    subtitle: 'Find medical services and track locations',
    tiles: [
      {
        id: 'find-pharmacies',
        title: 'Find Pharmacies', 
        description: 'Locate nearby pharmacies and chemists',
        status: { text: 'Search 500+ pharmacies nationwide', tone: 'info' as const },
        icon: 'MapPin',
        href: '/patient/location/find-pharmacies',
        accent: 'teal' as const
      },
      {
        id: 'find-healthcare',
        title: 'Find Healthcare',
        description: 'Doctors, hospitals, specialists', 
        status: { text: 'Find medical professionals near you', tone: 'info' as const },
        icon: 'Stethoscope', 
        href: '/patient/location/find-healthcare',
        accent: 'teal' as const
      },
      {
        id: 'find-loved-ones',
        title: 'Find Loved Ones',
        description: 'Track family and caregiver locations',
        status: { text: 'Share location with trusted contacts', tone: 'warning' as const },
        icon: 'Users',
        href: '/patient/location/find-loved-ones',
        accent: 'teal' as const
      },
      {
        id: 'saved-locations', 
        title: 'Saved Locations',
        description: 'Your favorite medical locations',
        icon: 'Heart',
        href: '/patient/location/saved-locations',
        accent: 'teal' as const
      }
    ]
  }

  return (
    <TilePageLayout
      sidebarItems={patientNavItems}
      headerTitle="Location Services"
      tileConfig={locationConfig}
    />
  )
}
```

### Pharmacy Search with ListView Integration (NEW)
```typescript
// app/patient/location/find-pharmacies/page.tsx
import { requireUser } from '@/lib/auth/require-user'
import PharmacySearchClient from './PharmacySearchClient'

export default async function FindPharmaciesPage() {
  const user = await requireUser()
  
  // Server-side fetch nearby pharmacies based on common locations
  // const nearbyPharmacies = await getNearbyPharmacies()
  
  return (
    <ListPageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Find Pharmacies"
    >
      <PharmacySearchClient 
        userId={user.id}
        // initialPharmacies={nearbyPharmacies}
      />
    </ListPageLayoutClient>
  )
}

// app/patient/location/find-pharmacies/PharmacySearchClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ListView from '@/components/layouts/ListView'
import { useGeolocation } from '@/hooks/location/useGeolocation'

export default function PharmacySearchClient({ userId }: { userId: string }) {
  const router = useRouter()
  const { position } = useGeolocation()
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(false)

  // Transform pharmacy data for ListView
  const listItems = pharmacies.map(pharmacy => ({
    id: pharmacy.pharmacy_id,
    title: pharmacy.name,
    letter: pharmacy.chain_name?.[0] || pharmacy.name[0],
    severity: pharmacy.is_24_hour ? 'success' : undefined,
    thirdColumn: pharmacy.distance ? `${pharmacy.distance.toFixed(1)}km` : undefined,
    data: pharmacy
  }))

  const handlePharmacyClick = (item) => {
    // Open in map view with selected pharmacy
    router.push(`/patient/location/find-pharmacies/map?selected=${item.id}`)
  }

  const handleViewMap = () => {
    router.push('/patient/location/find-pharmacies/map')
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleViewMap}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Map
        </button>
        <div className="flex-1 text-sm text-gray-600">
          {position ? 'Location enabled' : 'Enable location for better results'}
        </div>
      </div>

      {/* Pharmacy List */}
      <ListView
        items={listItems}
        loading={loading}
        onItemClick={handlePharmacyClick}
        searchPlaceholder="Search pharmacies..."
        pageTitle="Nearby Pharmacies"
        rightColumns={[
          { key: 'chain_name', label: 'Chain', render: (item) => (item.data as any).chain_name || '–' },
          { key: 'rating', label: 'Rating', render: (item) => {
            const rating = (item.data as any).average_rating
            return rating ? `⭐ ${rating}` : '–'
          }}
        ]}
        showChevron={true}
        density="comfortable"
      />
    </div>
  )
}
```

### Map View Component (PORT Legacy Map)
```typescript
// app/patient/location/find-pharmacies/map/page.tsx
import { requireUser } from '@/lib/auth/require-user'
import PharmacyMapClient from './PharmacyMapClient'

export default async function PharmacyMapPage() {
  const user = await requireUser()
  
  return (
    <DetailPageLayoutClient
      sidebarItems={patientNavItems}
      headerTitle="Pharmacy Map"
    >
      <PharmacyMapClient userId={user.id} />
    </DetailPageLayoutClient>
  )
}

// app/patient/location/find-pharmacies/map/PharmacyMapClient.tsx  
'use client'

// PORT FROM: /_eve_/projects/scrypto-failed/scrypto-legacy-for-examples-read-only/components/features/location-services/LocationServicesMap.tsx

import React, { useState, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { useGoogleMaps, DEFAULT_MAP_OPTIONS, MEDICAL_PLACE_TYPES, calculateDistance } from '@/lib/services/location/google-maps-service'
import { useGeolocation } from '@/hooks/location/useGeolocation'

export default function PharmacyMapClient({ userId }: { userId: string }) {
  const { isLoaded, loadError } = useGoogleMaps()
  const { position, loading: locationLoading, error: locationError, retry } = useGeolocation()
  
  // PORT: Exact state management from legacy
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [userLocation, setUserLocation] = useState()
  
  // PORT: Exact search handler from legacy LocationServicesMap.tsx
  const handleQuickFilter = useCallback(async (type: string) => {
    // PORT: Exact search logic from legacy lines 121-256
  }, [map, userLocation])

  // PORT: Exact map rendering from legacy
  if (!isLoaded) return <div>Loading Maps...</div>
  if (loadError) return <div>Maps failed to load</div>

  return (
    <div className="h-[calc(100vh-8rem)] w-full">
      {/* PORT: Exact search overlay from legacy */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Search input and quick filter buttons */}
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MEDICAL_PLACE_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleQuickFilter(type)}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="text-xl block mb-1">{config.icon}</span>
                  <span className="text-xs font-medium">{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PORT: Exact GoogleMap component from legacy */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat: -26.2041, lng: 28.0473 }} // Johannesburg default
        zoom={13}
        options={DEFAULT_MAP_OPTIONS}
        onLoad={setMap}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4F46E5',
              fillOpacity: 1,
              strokeColor: '#FFFFFF', 
              strokeWeight: 2,
            }}
          />
        )}

        {/* Place markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {/* Info window */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold">{selectedMarker.data?.name}</h3>
              <p className="text-sm text-gray-600">{selectedMarker.data?.formatted_address}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                  📞 Call
                </button>
                <button className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                  🧭 Directions
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
```

---

## API Endpoints (NEW - Database Integration)

### Pharmacy Directory API
```typescript
// app/api/patient/location/pharmacies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireUser, getServerClient } from '@/lib/auth/require-user'

export async function GET(request: NextRequest) {
  const user = await requireUser()
  const supabase = await getServerClient()
  
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '15' // Default 15km
  const search = searchParams.get('search') || ''
  
  let query = supabase
    .from('patient__location__pharmacies_directory')
    .select('*')
    .eq('is_active', true)
    
  if (search) {
    query = query.or(`name.ilike.%${search}%,chain_name.ilike.%${search}%`)
  }
  
  // TODO: Add distance-based filtering if lat/lng provided
  // For now, return all active pharmacies
  
  const { data, error } = await query.order('name')
  
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch pharmacies' }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
```

### Google Places Search Proxy
```typescript
// app/api/patient/location/search/route.ts
export async function POST(request: NextRequest) {
  const user = await requireUser()
  
  const { query, location, radius = 15000 } = await request.json()
  
  // Proxy to Google Places API to keep API keys secure
  // This prevents exposing Google Maps API key to client
  
  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_MAPS_API_KEY}`
    }
    // ... Google Places API call
  })
  
  const places = await response.json()
  
  // Filter and format results for medical services only
  const medicalPlaces = places.results.filter(place => 
    place.types.some(type => ['pharmacy', 'hospital', 'doctor', 'health'].includes(type))
  )
  
  return NextResponse.json({ places: medicalPlaces })
}
```

---

## Facade Pattern Hooks (NEW)

### File: `/lib/query/patient/location/services.ts`
```typescript
import { useState, useEffect, useCallback } from 'react'

/**
 * Search nearby medical services (facade pattern)
 */
export function useLocationSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const searchNearby = useCallback(async (type: string, userLocation?: { lat: number; lng: number }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/patient/location/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          location: userLocation,
          radius: 15000
        })
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      return data.places
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { searchNearby, isLoading, error }
}

/**
 * Manage saved locations (facade pattern)
 */
export function useSavedLocations() {
  const [locations, setLocations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const response = await fetch('/api/patient/location/saved-locations')
        const data = await response.json()
        setLocations(data.data || [])
      } catch (error) {
        console.error('Failed to load saved locations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSaved()
  }, [])

  const saveLocation = useCallback(async (locationData) => {
    const response = await fetch('/api/patient/location/saved-locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData)
    })
    
    if (!response.ok) throw new Error('Failed to save location')
    
    const saved = await response.json()
    setLocations(prev => [saved, ...prev])
    return saved
  }, [])

  return { locations, isLoading, saveLocation }
}
```

---

## Implementation Priorities

### Phase 1: Core Infrastructure (Week 1)
- [ ] **Apply database migration**: Create location tables from legacy schema
- [ ] **Port Google Maps service**: Exact patterns from `google-maps-unified.ts`  
- [ ] **Port geolocation hook**: From legacy `useGeolocation.ts`
- [ ] **Create overview page**: Location services tiles with navigation
- [ ] **Enable location tile**: Update patient home config

### Phase 2: Pharmacy Services (Week 1-2)
- [ ] **Port pharmacy search**: Adapt legacy `LocationServicesMap.tsx`
- [ ] **Create pharmacy list**: ListView integration with search
- [ ] **Create map interface**: Full Google Maps integration
- [ ] **Add database API**: Pharmacy directory endpoints
- [ ] **Test end-to-end**: Search → List → Map → Directions

### Phase 3: Healthcare & Loved Ones (Week 2)
- [ ] **Implement healthcare search**: Based on pharmacy pattern
- [ ] **Create loved ones tracking**: Family/caregiver location sharing
- [ ] **Add saved locations**: User's favorite places management
- [ ] **Enhanced search**: Multi-type search with filters

### Phase 4: Production Features (Week 3)
- [ ] **Add offline support**: Cache recent searches
- [ ] **Implement favorites**: Star/save favorite locations  
- [ ] **Add directions**: Deep links to Google Maps navigation
- [ ] **Enhanced UI**: Distance sorting, hours display, ratings

---

## Environment Requirements

### Google Maps API Configuration
```env
# Required environment variable
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

# API restrictions should include:
# - HTTP referrers: https://qa.scrypto.online/*
# - HTTP referrers: http://localhost:4569/*
# - APIs enabled: Maps JavaScript API, Places API, Geolocation API
```

### Feature Dependencies
```json
{
  "dependencies": {
    "@react-google-maps/api": "^2.19.0",  // PROVEN: Legacy used this successfully
    "@googlemaps/google-maps-services-js": "^3.3.0"  // For server-side API calls
  }
}
```

---

## Testing Strategy

### Legacy Evidence (They Got This Right)
- **Working map interface**: Screenshots show functional Google Maps integration
- **Successful geolocation**: Permission handling and fallbacks working
- **Search functionality**: Text search and quick filters operational  
- **Database schema**: Complete tables with RLS policies
- **Mobile responsive**: Map interface works on mobile devices

### Critical Test Scenarios
```typescript
// Test Location Permission Flow
1. Location denied → Show fallback with manual location entry
2. Location granted → Auto-detect and search nearby services  
3. Location timeout → Graceful fallback to city-based search

// Test Google Maps Integration
1. Maps API key valid → Full map functionality
2. Maps API key missing → Show error with fallback list view
3. Network offline → Cache recent searches and saved locations

// Test Medical Service Search
1. Search "pharmacy" → Show nearby pharmacies with distance
2. Quick filter "Hospital" → Filter to hospitals only
3. Select result → Show details with call/directions options
```

### Playwright E2E Tests
```typescript
// Test complete workflow
test('Find nearby pharmacy and get directions', async ({ page }) => {
  await page.goto('/patient/location/find-pharmacies')
  await page.click('[data-testid="view-map"]')
  await page.click('[data-testid="quick-filter-pharmacy"]')
  await page.waitForSelector('[data-testid="map-markers"]')
  await page.click('[data-testid="pharmacy-marker-0"]')
  await page.click('[data-testid="directions-button"]')
  // Verify Google Maps opens
})
```

---

## Success Criteria

### Technical Requirements
- ✅ Google Maps loads and displays correctly
- ✅ Geolocation permission handling works
- ✅ Search returns relevant medical services within 15km radius
- ✅ List view and map view toggle functionality
- ✅ Call and directions buttons work properly
- ✅ Saved locations can be managed (add/edit/delete/favorite)

### User Experience Goals
- ✅ Fast search results (<3 seconds)
- ✅ Accurate distance calculations and sorting
- ✅ Clear visual distinction between service types
- ✅ Seamless mobile experience with touch-friendly interface
- ✅ Offline fallback with cached data

### Integration Requirements
- ✅ Patient home tile navigation works
- ✅ Sidebar integration with proper active states
- ✅ Mobile footer quick access for location services
- ✅ SSR rendering for initial page loads
- ✅ Progressive enhancement for map features

---

## Risk Assessment & Mitigation

### High Risk
- **Google Maps API costs**: Could become expensive with high usage
- **Location privacy**: Users may deny location permissions  
- **API rate limits**: Google Places API has usage quotas

### Medium Risk
- **Network connectivity**: Maps require internet connection
- **Browser compatibility**: Some older browsers may have issues
- **Performance**: Large result sets may slow map rendering

### Mitigation Strategies
- **Cost control**: Implement search result caching and limits
- **Privacy fallback**: Manual location entry when permissions denied
- **Offline support**: Cache recent searches and saved locations
- **Performance**: Limit concurrent markers and implement clustering

---

**IMPLEMENTATION READY**: This specification provides a complete roadmap to implement medical location services by adapting proven Google Maps patterns from legacy code to our current SSR architecture. The legacy implementation provides excellent patterns for Maps integration, geolocation handling, and medical service search - we just need to modernize the presentation layer and integrate with our current design system.