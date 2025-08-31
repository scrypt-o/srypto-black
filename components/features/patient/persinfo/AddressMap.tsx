"use client"
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

export default function AddressMap({ lat, lng }: { lat: number; lng: number }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const { isLoaded } = useJsApiLoader({ id: 'gmaps-script', googleMapsApiKey: apiKey || '' })

  if (!apiKey) {
    const href = `https://www.google.com/maps?q=${lat},${lng}`
    return (
      <a className="text-blue-600 underline" href={href} target="_blank" rel="noreferrer">
        Open in Google Maps
      </a>
    )
  }

  if (!isLoaded) return <div className="h-64 bg-gray-100 rounded animate-pulse" />

  return (
    <div className="h-64 w-full rounded overflow-hidden">
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat, lng }} zoom={14}>
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
  )
}
