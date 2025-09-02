"use client"
import * as React from 'react'

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4" />
      <span>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </span>
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block p-3 rounded-lg hover:bg-gray-50">
      <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded px-2 py-1 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export default function UISettingsClient() {
  const [tilesExpressive, setTilesExpressive] = React.useState(false)
  const [tileComposition, setTileComposition] = React.useState<'classic' | 'hero'>('classic')
  const [listPolish, setListPolish] = React.useState(false)

  React.useEffect(() => {
    try {
      setTilesExpressive(localStorage.getItem('ui:tiles:expressive') === '1')
      const comp = localStorage.getItem('ui:tiles:composition') as 'classic' | 'hero' | null
      setTileComposition(comp === 'hero' ? 'hero' : 'classic')
      setListPolish(localStorage.getItem('ui:list:polish') === '1')
    } catch {}
  }, [])

  const save = () => {
    try {
      localStorage.setItem('ui:tiles:expressive', tilesExpressive ? '1' : '0')
      localStorage.setItem('ui:tiles:composition', tileComposition)
      localStorage.setItem('ui:list:polish', listPolish ? '1' : '0')
      alert('Saved. Refresh any open pages to see changes.')
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Tiles</h3>
        </div>
        <div className="p-2">
          <SettingToggle
            label="Expressive icons"
            description="Bigger icons, watermark, brighter icon color"
            checked={tilesExpressive}
            onChange={setTilesExpressive}
          />
          <SelectField
            label="Composition"
            value={tileComposition}
            onChange={(v) => setTileComposition(v as 'classic' | 'hero')}
            options={[
              { value: 'classic', label: 'Classic (icon left, text right)' },
              { value: 'hero', label: 'Hero (title, big icon center, desc)' },
            ]}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Lists</h3>
        </div>
        <div className="p-2">
          <SettingToggle
            label="Polish preview"
            description="Zebra rows, border, focus ring"
            checked={listPolish}
            onChange={setListPolish}
          />
        </div>
      </div>

      <div className="text-right">
        <button onClick={save} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">Save</button>
      </div>
    </div>
  )
}

