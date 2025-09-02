"use client"
import * as React from 'react'
import { useJsApiLoader } from '@react-google-maps/api'

type Suggestion = {
  description: string
  place_id: string
}

export default function AddressAutocomplete({
  placeholder = 'Search address…',
  onSelect,
  className,
  size = 'md',
}: {
  placeholder?: string
  onSelect: (place: google.maps.places.PlaceResult) => void
  className?: string
  size?: 'md' | 'lg'
}) {
  // Use a single loader id to avoid duplicate script loads
  const { isLoaded } = useJsApiLoader({ id: 'scrypto-google-maps', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', libraries: ['places'] })
  const [input, setInput] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Feature flag gating: allow disabling Places via NEXT_PUBLIC flag
  const placesDisabled = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_ENABLED === 'false'

  const fetchSuggestions = React.useCallback((query: string) => {
    if (!isLoaded || !('google' in window) || !query) { setSuggestions([]); return }
    const service = new window.google.maps.places.AutocompleteService()
    service.getPlacePredictions({ input: query }, (predictions) => {
      if (!predictions) { setSuggestions([]); return }
      setSuggestions(predictions.slice(0, 5).map(p => ({ description: p.description, place_id: p.place_id })))
    })
  }, [isLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInput(val)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fetchSuggestions(val), 250)
  }

  const handleSelect = async (s: Suggestion) => {
    if (!isLoaded || !('google' in window)) return
    const service = new window.google.maps.places.PlacesService(document.createElement('div'))
    service.getDetails({ placeId: s.place_id, fields: ['address_component','geometry','formatted_address'] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        onSelect(place)
        setInput(s.description)
        setSuggestions([])
      }
    })
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || placesDisabled) {
    return (
      <input
        className={"w-full border rounded px-3 py-2 " + (className || '')}
        placeholder={placesDisabled ? 'Address autocomplete disabled' : 'Google Maps API key not configured'}
        disabled
      />
    )
  }

  return (
    <div className={"relative " + (className || '')}>
      <input
        value={input}
        onChange={handleChange}
        placeholder={placeholder}
        className={
          'w-full border rounded outline-none transition ring-1 ring-inset ring-gray-200 focus:ring-blue-500 bg-white ' +
          (size === 'lg' ? 'px-4 py-3 text-base rounded-full shadow-md' : 'px-3 py-2 text-sm')
        }
      />
      {suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow">
          {suggestions.map((s) => (
            <button key={s.place_id} type="button" className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => handleSelect(s)}>
              {s.description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
