"use client"
import * as React from 'react'

type ProfileForm = {
  first_name: string
  last_name: string
  title?: string
  middle_name?: string
  nick_name?: string
  id_number?: string
  passport_number?: string
  citizenship?: string
  date_of_birth?: string
  gender?: string
  marital_status?: string
  phone?: string
  email?: string
  primary_language?: string
}

export default function ProfileEditForm({ initial, formId }: { initial: Partial<ProfileForm> & { first_name?: string; last_name?: string }; formId?: string }) {
  const [form, setForm] = React.useState<ProfileForm>({
    first_name: initial.first_name || '',
    last_name: initial.last_name || '',
    title: initial.title,
    middle_name: initial.middle_name,
    nick_name: initial.nick_name,
    id_number: initial.id_number,
    passport_number: initial.passport_number,
    citizenship: initial.citizenship,
    date_of_birth: initial.date_of_birth,
    gender: initial.gender,
    marital_status: initial.marital_status,
    phone: initial.phone,
    email: initial.email,
    primary_language: initial.primary_language,
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const onChange = (k: keyof ProfileForm, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const onSave = async () => {
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/patient/personal-info/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Save failed')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).location?.reload()
    } catch (e) {
      setError('Failed to save profile')
    } finally { setSaving(false) }
  }

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await onSave()
  }

  return (
    <form className="space-y-3 bg-white border rounded p-4" {...(formId ? { id: formId, onSubmit } : {})}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="First name" value={form.first_name} onChange={v => onChange('first_name', v)} required />
        <Field label="Last name" value={form.last_name} onChange={v => onChange('last_name', v)} required />
        <Field label="Title" value={form.title || ''} onChange={v => onChange('title', v)} />
        <Field label="Nickname" value={form.nick_name || ''} onChange={v => onChange('nick_name', v)} />
        <Field label="Middle name" value={form.middle_name || ''} onChange={v => onChange('middle_name', v)} />
        <Field label="ID number" value={form.id_number || ''} onChange={v => onChange('id_number', v)} />
        <Field label="Passport number" value={form.passport_number || ''} onChange={v => onChange('passport_number', v)} />
        <Field label="Citizenship" value={form.citizenship || ''} onChange={v => onChange('citizenship', v)} />
        <Field type="date" label="Date of birth" value={form.date_of_birth || ''} onChange={v => onChange('date_of_birth', v)} />
        <Field label="Gender" value={form.gender || ''} onChange={v => onChange('gender', v)} />
        <Field label="Marital status" value={form.marital_status || ''} onChange={v => onChange('marital_status', v)} />
        <Field label="Phone" value={form.phone || ''} onChange={v => onChange('phone', v)} />
        <Field type="email" label="Email" value={form.email || ''} onChange={v => onChange('email', v)} />
        <Field label="Primary language" value={form.primary_language || ''} onChange={v => onChange('primary_language', v)} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!formId && (
        <div className="text-right">
          <button onClick={onSave} type="button" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      )}
    </form>
  )
}

function Field({ label, value, onChange, type, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}{required && <span className="text-red-600"> *</span>}</div>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded px-3 py-2" />
    </label>
  )
}
