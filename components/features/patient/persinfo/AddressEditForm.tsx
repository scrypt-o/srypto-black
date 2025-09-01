"use client"
import * as React from 'react'
import dynamic from 'next/dynamic'
const AddressAutocomplete = dynamic(() => import('./AddressAutocomplete'), { ssr: false })
const AddressMap = dynamic(() => import('./AddressMap'), { ssr: false })

type AddressType = 'home' | 'postal' | 'delivery'

type FormState = {
  address1?: string
  address2?: string
  street_no?: string
  street_name?: string
  suburb?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
  // Complex/estate fields (addresses audit finding)
  live_in_complex?: boolean
  complex_no?: string
  complex_name?: string
}

export default function AddressEditForm({
  type,
  initial,
  title,
}: {
  type: AddressType
  initial?: Partial<FormState>
  title: string
}) {
  const [form, setForm] = React.useState<FormState>({ ...(initial || {}) })
  const [manual, setManual] = React.useState(false)
  const [postalSame, setPostalSame] = React.useState(false)
  const [deliverySame, setDeliverySame] = React.useState(false)
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onSelectPlace = (place: google.maps.places.PlaceResult) => {
    const comps = place.address_components || []
    const get = (type: string) => comps.find(c => c.types.includes(type))?.long_name || undefined
    const short = (type: string) => comps.find(c => c.types.includes(type))?.short_name || undefined
    const next: FormState = {
      // populate sensible defaults
      address1: [get('street_number'), get('route')].filter(Boolean).join(' ') || form.address1,
      address2: form.address2,
      street_no: get('street_number') || form.street_no,
      street_name: get('route') || form.street_name,
      suburb: get('sublocality') || get('neighborhood') || form.suburb,
      city: get('locality') || get('postal_town') || form.city,
      province: get('administrative_area_level_1') || form.province,
      postal_code: get('postal_code') || form.postal_code,
      country: short('country') || form.country,
    }
    setForm(next)
    const loc = place.geometry?.location
    if (loc) setCoords({ lat: loc.lat(), lng: loc.lng() })
  }

  const onChange = (k: keyof FormState, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const onSave = async () => {
    setSaving(true); setError(null)
    try {
      const payload: any = { type, ...form }
      if (type === 'postal') payload.postal_same_as_home = postalSame
      if (type === 'delivery') payload.delivery_same_as_home = deliverySame
      // Include coordinates if available
      if (coords) {
        payload.latitude = coords.lat
        payload.longitude = coords.lng
      }
      const res = await fetch('/api/patient/personal-info/address', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Save failed')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).location?.reload()
    } catch (e) {
      setError('Failed to save address')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      {/* Map */}
      {coords ? (
        <AddressMap lat={coords.lat} lng={coords.lng} />
      ) : (
        <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-500">No coordinates</div>
      )}

      {/* Autocomplete */}
      <AddressAutocomplete onSelect={onSelectPlace} />

      {/* Toggles */}
      {type === 'postal' && (
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={postalSame} onChange={(e) => setPostalSame(e.target.checked)} />
          Postal address same as Home
        </label>
      )}
      {type === 'delivery' && (
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={deliverySame} onChange={(e) => setDeliverySame(e.target.checked)} />
          Delivery address same as Home
        </label>
      )}

      {/* Manual toggle */}
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
        Capture address manually
      </label>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Address line 1" value={form.address1 || ''} onChange={v => onChange('address1', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Address line 2" value={form.address2 || ''} onChange={v => onChange('address2', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Street number" value={form.street_no || ''} onChange={v => onChange('street_no', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Street name" value={form.street_name || ''} onChange={v => onChange('street_name', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Suburb" value={form.suburb || ''} onChange={v => onChange('suburb', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="City" value={form.city || ''} onChange={v => onChange('city', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Province" value={form.province || ''} onChange={v => onChange('province', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Postal code" value={form.postal_code || ''} onChange={v => onChange('postal_code', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
        <Field label="Country" value={form.country || ''} onChange={v => onChange('country', v)} disabled={!manual || (type==='postal'&&postalSame) || (type==='delivery'&&deliverySame)} />
      </div>

      {/* Complex/Estate Fields (addresses audit finding: missing fields in UI) */}
      {type === 'home' && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-900 mb-3">Complex/Estate Information</h3>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                checked={form.live_in_complex || false} 
                onChange={(e) => onChange('live_in_complex', e.target.checked)}
              />
              Live in complex or estate
            </label>
            
            {form.live_in_complex && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field 
                  label="Unit/Apartment Number" 
                  value={form.complex_no || ''} 
                  onChange={v => onChange('complex_no', v)} 
                />
                <Field 
                  label="Complex/Estate Name" 
                  value={form.complex_name || ''} 
                  onChange={v => onChange('complex_name', v)} 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="text-right">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full border rounded px-3 py-2 disabled:bg-gray-50" />
    </label>
  )
}
