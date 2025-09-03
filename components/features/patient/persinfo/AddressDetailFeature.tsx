"use client"
import * as React from 'react'
import AddressMap from './AddressMap'

type AddressRecord = {
  address_id?: string
  address_type?: string
  line1?: string
  line2?: string
  city?: string
  region?: string
  postal_code?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
}

export default function AddressDetailFeature({ title, record }: { title: string; record: AddressRecord | null }) {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null)

  React.useEffect(() => {
    if (record?.latitude != null && record?.longitude != null) {
      setCoords({ lat: Number(record.latitude), lng: Number(record.longitude) })
    }
  }, [record])

  const hasKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>

      {/* Map / link */}
      {coords ? (
        <AddressMap lat={coords.lat} lng={coords.lng} />
      ) : (
        <div className="text-gray-600">No coordinates available.</div>
      )}

      {/* Read-only details */}
      <div className="bg-white border rounded p-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
        <Detail label="Line 1" value={record?.line1 ?? null} />
        <Detail label="Line 2" value={record?.line2 ?? null} />
        <Detail label="City" value={record?.city ?? null} />
        <Detail label="Region" value={record?.region ?? null} />
        <Detail label="Postal Code" value={record?.postal_code ?? null} />
        <Detail label="Country" value={record?.country ?? null} />
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-gray-600 font-medium">{label}</div>
      <div className="text-gray-900 break-words">{value ?? '-'}</div>
    </div>
  )
}
